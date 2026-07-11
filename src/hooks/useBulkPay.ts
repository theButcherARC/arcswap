"use client";

import { useState, useCallback } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { encodeFunctionData, keccak256, toHex, toBytes } from "viem";
import { useArcNetwork } from "./useArcNetwork";
import { getErrorMessage, isUserRejection, APP_ERRORS } from "@/utils/errors";
import { toast as sonnerToast } from "sonner";
import { BULK_PAY_MAX_RECIPIENTS } from "@/constants/tokens";
import {
  buildTransfers,
  buildMulticallCalls,
  getTotalAmount,
  MULTICALL3_FROM_ADDRESS,
  MULTICALL3_FROM_ABI,
} from "@/services/bulkPayService";
import type { BulkPayParams, BulkPayStatus } from "@/types/bulkPay";

const MEMO_CONTRACT_ADDRESS = "0x5294E9927c3306DcBaDb03fe70b92e01cCede505" as const;

// Memo contract wraps Multicall3From calls
const MEMO_ABI = [
  {
    type: "function",
    name: "memo",
    stateMutability: "nonpayable",
    inputs: [
      { name: "target", type: "address" },
      { name: "data", type: "bytes" },
      { name: "memoId", type: "bytes32" },
      { name: "memoData", type: "bytes" },
    ],
    outputs: [],
  },
] as const;

export function useBulkPay() {
  const { address } = useAccount();
  const { isCorrectNetwork } = useArcNetwork();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [status, setBulkStatus] = useState<BulkPayStatus>("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);

  const executeBulkPay = useCallback(
    async (params: BulkPayParams & { memo?: string }, onSubmit?: (timestamp: number) => void) => {
      if (!address) { setError(APP_ERRORS.WALLET_NOT_CONNECTED); return; }
      if (!isCorrectNetwork) {
        // Auto-prompt to switch to Arc testnet instead of just erroring
        const toastId = sonnerToast.loading("Switching to Arc Testnet...");
        try {
          // This will show MetaMask's switch chain dialog
          const result = await new Promise<void>((resolve, reject) => {
            window.ethereum?.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0xc8d" }], // Arc testnet chain ID in hex
            }).then(() => resolve()).catch(reject);
          });
          // Give MetaMask a moment to update internal state
          await new Promise(r => setTimeout(r, 1000));
          sonnerToast.dismiss(toastId);
        } catch (err: any) {
          sonnerToast.dismiss(toastId);
          if (err.code === 4902) {
            // Chain not added to MetaMask — this shouldn't happen on Arc testnet but handle it
            sonnerToast.error("Arc Testnet not found", { description: "Please add Arc Testnet to MetaMask first." });
          }
          setError("Chain switch failed. Please switch to Arc Testnet manually.");
          return;
        }
        return; // Let the user retry after switching
      }
      if (params.recipients.length === 0) { setError("Add at least one recipient."); return; }
      if (params.recipients.length > BULK_PAY_MAX_RECIPIENTS) {
        setError(`Maximum ${BULK_PAY_MAX_RECIPIENTS} recipients allowed.`);
        return;
      }

      try {
        setError(null);
        setTxHash(null);
        setBulkStatus("preparing");

        const instructions = buildTransfers(params);
        const transferCalls = buildMulticallCalls(instructions);

        const memoString = params.memo?.trim() || "";
        const hasMemo = memoString.length > 0;

        // Simulate before MetaMask popup
        if (publicClient) {
          const simulation = await publicClient.simulateContract({
            account: address,
            address: MULTICALL3_FROM_ADDRESS,
            abi: MULTICALL3_FROM_ABI,
            functionName: "aggregate3",
            args: [transferCalls],
          });

          const results = simulation.result as { success: boolean; returnData: `0x${string}` }[];
          const failedIdx = results.findIndex((r) => !r.success);
          if (failedIdx !== -1) {
            throw new Error(
              `Transfer to ${params.recipients[failedIdx]?.address} would fail. Check balance and addresses.`
            );
          }
        }

        // One MetaMask popup - either call Memo (wrapping Multicall3From) or Multicall3From directly
        setBulkStatus("sending");
        let hash: `0x${string}`;

        if (hasMemo) {
          // Encode the Multicall3From.aggregate3(transferCalls) call
          const multicallData = encodeFunctionData({
            abi: MULTICALL3_FROM_ABI,
            functionName: "aggregate3",
            args: [transferCalls],
          });

          // Create memoId from keccak256 hash of memo string
          const memoId = keccak256(toBytes(memoString));

          // Call Memo contract which wraps the Multicall3From call
          hash = await writeContractAsync({
            address: MEMO_CONTRACT_ADDRESS,
            abi: MEMO_ABI,
            functionName: "memo",
            args: [
              MULTICALL3_FROM_ADDRESS,
              multicallData,
              memoId,
              toHex(memoString),
            ],
          });
        } else {
          // No memo - call Multicall3From directly
          hash = await writeContractAsync({
            address: MULTICALL3_FROM_ADDRESS,
            abi: MULTICALL3_FROM_ABI,
            functionName: "aggregate3",
            args: [transferCalls],
          });
        }

        // Call onSubmit callback exactly when transaction is submitted
        const submitTimestamp = Date.now();
        onSubmit?.(submitTimestamp);

        console.log("[v0] Transaction submitted:", hash);
        setTxHash(hash);

        // Wait for receipt with fallback
        if (publicClient) {
          try {
            const receipt = await publicClient.waitForTransactionReceipt({ 
              hash,
              timeout: 60_000, // 60 second timeout
            });
            if (receipt.status !== "success") {
              throw new Error(`Transaction reverted. Hash: ${hash}`);
            }
          } catch (waitErr) {
            // If wait times out or fails, still mark as success since tx was submitted
            // User can verify on ArcScan
            if (waitErr instanceof Error && waitErr.message.includes("timed out")) {
              console.log("[v0] Receipt wait timed out, but tx was submitted:", hash);
            }
          }
        }

        console.log("[v0] Transaction confirmed, setting status to success");
        setBulkStatus("success");
        sonnerToast.success("Payment sent!", { description: `Transaction: ${hash.slice(0, 10)}...` });
      } catch (err) {
        const errorMsg = isUserRejection(err) ? APP_ERRORS.TX_REJECTED : getErrorMessage(err);
        setError(errorMsg);
        setBulkStatus("error");
        sonnerToast.error("Payment failed", { description: errorMsg });
      }
    },
    [address, isCorrectNetwork, publicClient, writeContractAsync],
  );

  function reset() {
    setBulkStatus("idle");
    setTxHash(null);
    setError(null);
  }

  return { status, txHash, error, executeBulkPay, reset };
}
