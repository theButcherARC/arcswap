import type { Token } from "@/types/token";
import { arcTestnet } from "./chains";

/**
 * Token registry for all tokens supported by ArcSwap.
 *
 * USDC: 0x3600000000000000000000000000000000000000
 *   Arc L1 native asset — precompile address, 6 decimals.
 *   This is also the gas token on Arc Testnet, hardcoded (not from env).
 *
 * EURC: existing Arc Testnet token — set NEXT_PUBLIC_EURC_ADDRESS in .env.local
 * VIBE: deployed by this project — set NEXT_PUBLIC_VIBE_TOKEN_ADDRESS after deploy
 */
export const TOKENS: Record<string, Token> = {
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    // Native USDC precompile on Arc Testnet — hardcoded, not configurable per env
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
export const TOKEN_LIST: Token[] = [TOKENS.USDC, TOKENS.EURC, TOKENS.VIBE];

/** Maximum recipients allowed in a single bulk pay operation */
export const BULK_PAY_MAX_RECIPIENTS = 10;
