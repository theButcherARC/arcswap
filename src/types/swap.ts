import type { Address, Hex } from "viem";
import type { Token } from "./token";

/** Input parameters for a swap operation */
export interface SwapParams {
  tokenIn: Token;
  tokenOut: Token;
  /** Amount in tokenIn's smallest unit */
  amountIn: bigint;
  /** Minimum amount of tokenOut to accept (slippage protection) */
  amountOutMin: bigint;
  recipient: Address;
  /** Unix timestamp deadline for the swap transaction */
  deadline: bigint;
}

/** Quote returned by the DEX router before executing a swap */
export interface SwapQuote {
  tokenIn: Token;
  tokenOut: Token;
  amountIn: bigint;
  /** Expected output amount from the router */
  amountOut: bigint;
  /** Minimum output after slippage */
  amountOutMin: bigint;
  /** Price impact as a percentage (0–100) */
  priceImpact: number;
  /** Encoded calldata for the swap transaction */
  calldata: Hex;
  /** Router contract address to send the transaction to */
  to: Address;
}

/** Current status of a swap execution */
export type SwapStatus = "idle" | "approving" | "swapping" | "success" | "error";
