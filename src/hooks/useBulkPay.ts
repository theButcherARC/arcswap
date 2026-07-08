"use client";

import { useState, useCallback } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { useArcNetwork } from "./useArcNetwork";
import { getErrorMessage, isUserRejection, APP_ERRORS } from "@/utils/errors";
import { BULK_PAY_MAX_RECIPIENTS } from "@/constants/tokens";
import {
  buildTransfers,
  buildMulticallCalls,
  getTotalAmount,
  MULTICALL3_FROM_ADDRESS,
  MULTICALL3_FROM_ABI,
} from "@/services/bulkPayService";
import type { BulkPayParams, BulkPayStatus } from "@/types/bulkPay";

export function useBulkPay() {
  const { address } = useAccount();
  const { isCorrectNetwork } = useArcNetwork();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [status, setBulkStatus] = useState<BulkPayStatus>("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
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

      try {
        setError(null);
        setTxHash(null);
        setBulkStatus("preparing");

        const instructions = buildTransfers(params);
        const calls = buildMulticallCalls(instructions);

        // Simulate before MetaMask popup
        if (publicClient) {
          const simulation = await publicClient.simulateContract({
            account: address,
            address: MULTICALL3_FROM_ADDRESS,
            abi: MULTICALL3_FROM_ABI,
            functionName: "aggregate3",
            args: [calls],
          });

          const results = simulation.result as { success: boolean; returnData: `0x${string}` }[];
          const failedIdx = results.findIndex((r) => !r.success);
          if (failedIdx !== -1) {
            throw new Error(
              `Transfer to ${params.recipients[failedIdx]?.address} would fail. Check balance and addresses.`
            );
          }
        }

        // One MetaMask popup
        setBulkStatus("sending");
        const hash = await writeContractAsync({
          address: MULTICALL3_FROM_ADDRESS,
          abi: MULTICALL3_FROM_ABI,
          functionName: "aggregate3",
          args: [calls],
        });

        // Call onSubmit callback exactly when transaction is submitted
        const submitTimestamp = Date.now();
        onSubmit?.(submitTimestamp);

        setTxHash(hash);

        // Wait for receipt
        if (publicClient) {
          const receipt = await publicClient.waitForTransactionReceipt({ hash });
          if (receipt.status !== "success") {
            throw new Error(`Transaction reverted. Hash: ${hash}`);
          }
        }

        setBulkStatus("success");
      } catch (err) {
        setError(isUserRejection(err) ? APP_ERRORS.TX_REJECTED : getErrorMessage(err));
        setBulkStatus("error");
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
