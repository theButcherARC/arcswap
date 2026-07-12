import type { Token } from "@/types/token";
import { arcTestnet } from "./chains";

/**
 * Token registry for all tokens supported by VibeFlow.
 *
 * USDC: 0x3600000000000000000000000000000000000000
 *   Arc L1 native asset — precompile address, 6 decimals.
 *   This is also the gas token on Arc Testnet, hardcoded (not from env).
 *
 * EURC:   existing Arc Testnet token — set NEXT_PUBLIC_EURC_ADDRESS
 * cirBTC: existing Arc Testnet token — set NEXT_PUBLIC_CIRBTC_ADDRESS
 * VIBE:   deployed by this project — set NEXT_PUBLIC_VIBE_TOKEN_ADDRESS after deploy
 */
export const TOKENS: Record<string, Token> = {
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    address: "0x3600000000000000000000000000000000000000",
    chainId: arcTestnet.id,
    logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
  },
  EURC: {
    symbol: "EURC",
    name: "Euro Coin",
    decimals: 6,
    address: (process.env.NEXT_PUBLIC_EURC_ADDRESS ?? "") as `0x${string}`,
    chainId: arcTestnet.id,
    logoURI: "https://assets.coingecko.com/coins/images/26045/small/euro-coin.png",
  },
  cirBTC: {
    symbol: "cirBTC",
    name: "Circle Bitcoin",
    // TODO: Confirm actual decimals for cirBTC on Arc Testnet (BTC-pegged tokens are often 8)
    decimals: 8,
    address: (process.env.NEXT_PUBLIC_CIRBTC_ADDRESS ?? "") as `0x${string}`,
    chainId: arcTestnet.id,
    logoURI: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  },
  VIBE: {
    symbol: "VIBE",
    name: "Vibe Token",
    decimals: 18,
    address: (process.env.NEXT_PUBLIC_VIBE_TOKEN_ADDRESS ?? "") as `0x${string}`,
    chainId: arcTestnet.id,
    logoURI: "",
  },
} as const;

/** Ordered list for UI rendering */
export const TOKEN_LIST: Token[] = [TOKENS.USDC, TOKENS.EURC, TOKENS.cirBTC, TOKENS.VIBE];

/** Maximum recipients allowed in a single bulk pay operation */
export const BULK_PAY_MAX_RECIPIENTS = 100;
