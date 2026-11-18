"use client";

import { useState, useCallback } from "react";
import { useAccount, useChainId, usePublicClient, useWriteContract } from "wagmi";
import { erc20Abi, zeroAddress, type Address } from "viem";
import { useArcNetwork } from "./useArcNetwork";
import { arc, arcTestnet } from "@/constants/chains";
import { getErrorMessage, isUserRejection, APP_ERRORS } from "@/utils/errors";
import { BULK_PAY_MAX_RECIPIENTS } from "@/constants/tokens";
import {
  buildTransfers,
  getTotalAmount,
  computeProtocolFee,
  chunkList,
  BATCHPAY_V2_ADDRESS,
  BATCHPAY_V2_ABI,
  BATCHPAY_FEE_RECIPIENT,
  BATCHPAY_CHUNK_SIZE,
  type TransferInstruction,
} from "@/services/bulkPayService";
import { reconcileBatch, type ChunkReceipt } from "@/services/reconciliation";
import { recordPaidRecipients } from "@/lib/paidHistory";
import type {
  BatchResult,
  BulkPayParams,
  BulkPayStatus,
  ExpectedLine,
} from "@/types/bulkPay";

/**
 * Commit-moment haptics: one short pulse when a send confirms, a
 * distinct broken pattern when it fails. iOS Safari has no Vibration
 * API, so this silently no-ops there. Haptics are used nowhere else
 * in the app.
 */
function vibrate(pattern: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Haptics are decoration; never let them break a send.
  }
}

/**
 * BatchPay v2 send path.
 *
 * 1. Preflight: the sender's balance must cover total + fee. No wallet
 *    popup happens before this check passes.
 * 2. Approval: if the BatchPay contract's allowance is short, the sender
 *    approves EXACTLY total + fee. Never an unlimited approval.
 * 3. Per chunk of up to 250 recipients: simulate disperse() first, then
 *    send it. The protocol fee rides on the first chunk only. disperse
 *    pulls via transferFrom, so it can only be simulated truthfully
 *    after the approval in step 2 exists; the simulation still always
 *    runs before the disperse signature it protects.
 * 4. After every chunk confirms, its recipients are recorded in the
 *    local paid history, and at the end every expected line is
 *    reconciled against the receipts' Transfer logs.
 */
export function useBulkPay() {
  const { address } = useAccount();
  const { isCorrectNetwork } = useArcNetwork();
  const walletChainId = useChainId();
  // Pin every read, simulation and write to the Arc chain this session targets.
  // Without the pin, wagmi follows the wallet's per-site chain: if MetaMask has
  // another chain selected for this site (for example Base), the batch is sent
  // there instead, where the same calls silently do nothing. Passing chainId
  // to writeContractAsync makes the wallet switch to Arc before signing.
  const targetChainId = walletChainId === arcTestnet.id ? arcTestnet.id : arc.id;
  const publicClient = usePublicClient({ chainId: targetChainId });
  const { writeContractAsync } = useWriteContract();

  const [status, setBulkStatus] = useState<BulkPayStatus>("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [txHashes, setTxHashes] = useState<`0x${string}`[]>([]);
  const [result, setResult] = useState<BatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const executeBulkPay = useCallback(
    async (params: BulkPayParams, onSubmit?: (timestamp: number) => void) => {
      if (!address) { setError(APP_ERRORS.WALLET_NOT_CONNECTED); return; }
      if (!isCorrectNetwork) { setError(APP_ERRORS.WRONG_NETWORK); return; }
      if (params.recipients.length === 0) { setError("Add at least one recipient."); return; }
      if (params.recipients.length > BULK_PAY_MAX_RECIPIENTS) {
        setError(`Maximum ${BULK_PAY_MAX_RECIPIENTS} recipients allowed.`);
        return;
      }
      if (!publicClient) { setError("Network client is not ready. Try again."); return; }

      const sentChunks: ChunkReceipt[] = [];

      try {
        setError(null);
        setTxHash(null);
        setTxHashes([]);
        setResult(null);
        setBulkStatus("preparing");

        const instructions = buildTransfers(params);
        const totalRaw = getTotalAmount(instructions);
        const feeRaw = computeProtocolFee(totalRaw, params.token.decimals);
        const grandTotal = totalRaw + feeRaw;
        const tokenAddress = params.token.address as Address;
        const batchMemo = (params.batchMemo ?? "").trim();
        const chunks = chunkList(instructions, BATCHPAY_CHUNK_SIZE);

        /* ---- Preflight: balance must cover total + fee ---- */
        const balance = await publicClient.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [address],
        });
        if (balance < grandTotal) {
          throw new Error(
            `Insufficient ${params.token.symbol} balance for this batch. ` +
            `The batch plus its protocol fee needs more than this wallet holds.`,
          );
        }

        /* ---- Approval: exactly total + fee, never unlimited ---- */
        const allowance = await publicClient.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "allowance",
          args: [address, BATCHPAY_V2_ADDRESS],
        });
        if (allowance < grandTotal) {
          setBulkStatus("approving");
          const approveHash = await writeContractAsync({
            chainId: targetChainId,
            address: tokenAddress,
            abi: erc20Abi,
            functionName: "approve",
            args: [BATCHPAY_V2_ADDRESS, grandTotal],
          });
          const approveReceipt = await publicClient.waitForTransactionReceipt({
            hash: approveHash,
            timeout: 120_000,
          });
          if (approveReceipt.status !== "success") {
            throw new Error(`Approval transaction reverted. Hash: ${approveHash}`);
          }
        }

        /* ---- Send chunk by chunk: simulate, sign, confirm ---- */
        let submitFired = false;
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i] as TransferInstruction[];
          const isFirst = i === 0;
          const chunkFeeRecipient = isFirst ? BATCHPAY_FEE_RECIPIENT : zeroAddress;
          const chunkFeeAmount = isFirst ? feeRaw : 0n;
          const memos = chunk.map((c) => c.memo);
          const memosArg: string[] = memos.every((m) => m.length === 0) ? [] : memos;

          const disperseArgs = [
            tokenAddress,
            chunk.map((c) => c.to),
            chunk.map((c) => c.amount),
            memosArg,
            chunkFeeRecipient,
            chunkFeeAmount,
            batchMemo,
          ] as const;

          setBulkStatus("preparing");
          await publicClient.simulateContract({
            account: address,
            address: BATCHPAY_V2_ADDRESS,
            abi: BATCHPAY_V2_ABI,
            functionName: "disperse",
            args: disperseArgs,
          });

          setBulkStatus("sending");
          const hash = await writeContractAsync({
            chainId: targetChainId,
            address: BATCHPAY_V2_ADDRESS,
            abi: BATCHPAY_V2_ABI,
            functionName: "disperse",
            args: disperseArgs,
          });

          if (!submitFired) {
            onSubmit?.(Date.now());
            submitFired = true;
          }
          setTxHash(hash);
          setTxHashes((prev) => [...prev, hash]);

          const receipt = await publicClient.waitForTransactionReceipt({
            hash,
            timeout: 120_000,
          });
          if (receipt.status !== "success") {
            throw new Error(
              `Transaction ${i + 1} of ${chunks.length} reverted. Hash: ${hash}`,
            );
          }
          sentChunks.push({ hash, receipt });
          recordPaidRecipients(chunk.map((c) => c.to));
        }

        /* ---- Reconcile every expected line against the receipts ---- */
        setBulkStatus("reconciling");
        const expected: ExpectedLine[] = instructions.map((instr, idx) => ({
          row: idx + 1,
          name: instr.name,
          address: instr.to,
          amount: instr.amount,
        }));
        const summary = reconcileBatch(
          sentChunks,
          expected,
          tokenAddress,
          BATCHPAY_V2_ADDRESS,
          BATCHPAY_FEE_RECIPIENT,
          feeRaw,
        );

        setResult({
          txHashes: sentChunks.map((c) => c.hash),
          totalRaw,
          feeRaw,
          batchMemo,
          token: params.token,
          sender: address,
          sentAt: Date.now(),
          summary,
        });
        setBulkStatus("success");
        vibrate(12);
      } catch (err) {
        if (sentChunks.length > 0) {
          // Part of the batch is already onchain. Say so plainly and name
          // the transactions, so the user never resends the whole batch
          // and double-pays the lines that already went through.
          setError(
            `Part of this batch was already sent (${sentChunks
              .map((c) => c.hash)
              .join(", ")}). The rest was not sent: ${getErrorMessage(err)} ` +
            `Do not resend the whole batch. Remove the recipients in the sent ` +
            `transactions and send only the remainder.`,
          );
        } else {
          setError(isUserRejection(err) ? APP_ERRORS.TX_REJECTED : getErrorMessage(err));
        }
        setBulkStatus("error");
        vibrate([20, 40, 20]);
      }
    },
    [address, isCorrectNetwork, publicClient, writeContractAsync, targetChainId],
  );

  function reset() {
    setBulkStatus("idle");
    setTxHash(null);
    setTxHashes([]);
    setResult(null);
    setError(null);
  }

  return { status, txHash, txHashes, result, error, executeBulkPay, reset };
}
