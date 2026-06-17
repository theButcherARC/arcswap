"use client";

import { useReadContract, useAccount } from "wagmi";
import { ERC20_ABI } from "@/contracts/abis/erc20.abi";
import { formatTokenAmount } from "@/utils/format";
import type { Token } from "@/types/token";

/**
 * Reads the ERC20 balance of the connected account for a given token.
 *
 * Returns both the raw bigint and a formatted display string.
 * Automatically refreshes every block via wagmi's built-in polling.
 */
export function useTokenBalance(token: Token | null) {
  const { address: accountAddress } = useAccount();

  const { data: rawBalance, isLoading, isError, refetch } = useReadContract({
    address: token?.address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: accountAddress ? [accountAddress] : undefined,
    query: {
      enabled: !!token && !!accountAddress,
    },
  });

  const formatted = rawBalance !== undefined && token
    ? formatTokenAmount(rawBalance, token.decimals)
    : "0";

  return {
    raw: rawBalance ?? 0n,
    formatted,
    isLoading,
    isError,
    refetch,
  };
}
