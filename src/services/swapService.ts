import type { Address } from "viem";
import type { SwapParams, SwapQuote } from "@/types/swap";

/**
 * Swap service — integration layer between ArcSwap UI and the DEX router.
 *
 * This module is deliberately framework-agnostic (no React hooks).
 * It is called by the `useSwap` hook which handles wagmi write calls.
 *
 * TODO (Phase 3):
 *   - Identify the router contract and its ABI on Arc Testnet.
 *   - Implement getQuote() by calling the router's quoteExactInputSingle (or equivalent).
 *   - Implement buildSwapCalldata() to encode the swap transaction.
 *
 * Integration targets (choose based on what's live on Arc Testnet):
 *   A) Uniswap V3 SwapRouter02 — quoteExactInputSingle + exactInputSingle
 *   B) Uniswap V2 Router02     — getAmountsOut + swapExactTokensForTokens
 *   C) Centra liquidity API    — consult Arc Testnet docs
 */

export interface GetQuoteParams {
  tokenInAddress: Address;
  tokenOutAddress: Address;
  tokenInDecimals: number;
  tokenOutDecimals: number;
  amountIn: bigint;
  /** Slippage tolerance as a fraction (e.g. 0.005 = 0.5%) */
  slippage: number;
  recipient: Address;
}

/**
 * Fetch a swap quote from the DEX router.
 * Returns null if no route is available.
 */
export async function getQuote(_params: GetQuoteParams): Promise<SwapQuote | null> {
  // TODO: Implement
  throw new Error("swapService.getQuote not yet implemented");
}

/**
 * Build the transaction params for executing a swap.
 * Called after the user confirms the quote and approval is in place.
 */
export function buildSwapCalldata(_params: SwapParams): {
  to: Address;
  data: `0x${string}`;
  value: bigint;
} {
  // TODO: Implement
  throw new Error("swapService.buildSwapCalldata not yet implemented");
}
