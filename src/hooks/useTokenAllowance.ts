"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { ERC20_ABI } from "@/contracts/abis/erc20.abi";
import type { Address } from "viem";
import type { Token } from "@/types/token";

/**
 * Reads the current ERC20 allowance for a spender and provides
 * an `approve` function to increase it.
 *
 * Typical usage:
 *   1. Call `allowance` to check if spender has enough budget.
 *   2. If not, call `approve(amount)` and wait for `isApproveConfirmed`.
 *   3. Proceed with the actual transaction.
 */
export function useTokenAllowance(token: Token | null, spender: Address | undefined) {
  const { address: owner } = useAccount();

  // ── Read current allowance ────────────────────────────────────────────────
  const { data: allowance = 0n, refetch: refetchAllowance } = useReadContract({
    address: token?.address,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: owner && spender ? [owner, spender] : undefined,
    query: {
      enabled: !!token && !!owner && !!spender,
    },
  });

  // ── Write approve ─────────────────────────────────────────────────────────
  const {
    writeContract,
    data: approveTxHash,
    isPending: isApprovePending,
    error: approveError,
  } = useWriteContract();

  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } =
    useWaitForTransactionReceipt({ hash: approveTxHash });

  function approve(amount: bigint) {
    if (!token || !spender) return;
    writeContract({
      address: token.address,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spender, amount],
    });
  }

  return {
    allowance,
    refetchAllowance,
    approve,
    approveTxHash,
    isApprovePending,
    isApproveConfirming,
    isApproveConfirmed,
    approveError,
  };
}
