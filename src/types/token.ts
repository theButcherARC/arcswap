import type { Address } from "viem";

/** A token in the VibeFlow token registry */
export interface Token {
  symbol: string;
  name: string;
  decimals: number;
  address: Address;
  chainId: number;
  logoURI?: string;
}

/** A token paired with a raw BigInt amount (before formatting) */
export interface TokenAmount {
  token: Token;
  /** Raw amount in the token's smallest unit (e.g. 1_000_000 for 1 USDC) */
  raw: bigint;
}
