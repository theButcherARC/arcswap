import type { Token } from "@/types/token";
import { DEFAULT_CHAIN } from "./chains";

/**
 * Token registry for all tokens supported by ArcSwap, on Arc Mainnet.
 *
 * USDC: 0x3600000000000000000000000000000000000000
 *   Arc L1 native asset - precompile address, 6 decimals (same address on mainnet and testnet).
 *
 * EURC:   Arc Mainnet token - defaults to Circle's published mainnet address,
 *         override with NEXT_PUBLIC_EURC_ADDRESS
 * cirBTC: Arc Mainnet token - defaults to Circle's published mainnet address,
 *         override with NEXT_PUBLIC_CIRBTC_ADDRESS
 * VIBE:   deployed by this project - set NEXT_PUBLIC_VIBE_TOKEN_ADDRESS after deploy
 */
const MAINNET_EURC_ADDRESS = "0xbEf5f6d51CB62b58e6A8f77868681825C6fe21c1";
const MAINNET_CIRBTC_ADDRESS = "0x171A4217b86A807A64eB94757Db6849fb4bDbAA0";

export const TOKENS: Record<string, Token> = {
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    address: "0x3600000000000000000000000000000000000000",
    chainId: DEFAULT_CHAIN.id,
    logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
  },
  EURC: {
    symbol: "EURC",
    name: "Euro Coin",
    decimals: 6,
    address: (process.env.NEXT_PUBLIC_EURC_ADDRESS ?? MAINNET_EURC_ADDRESS) as `0x${string}`,
    chainId: DEFAULT_CHAIN.id,
    logoURI: "https://assets.coingecko.com/coins/images/26045/small/euro-coin.png",
  },
  cirBTC: {
    symbol: "cirBTC",
    name: "Circle Bitcoin",
    decimals: 8,
    address: (process.env.NEXT_PUBLIC_CIRBTC_ADDRESS ?? MAINNET_CIRBTC_ADDRESS) as `0x${string}`,
    chainId: DEFAULT_CHAIN.id,
    logoURI: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  },
  VIBE: {
    symbol: "VIBE",
    name: "Vibe Token",
    decimals: 18,
    address: (process.env.NEXT_PUBLIC_VIBE_TOKEN_ADDRESS ?? "") as `0x${string}`,
    chainId: DEFAULT_CHAIN.id,
    logoURI: "",
  },
} as const;

/** Ordered list for UI rendering */
export const TOKEN_LIST: Token[] = [TOKENS.USDC, TOKENS.EURC, TOKENS.cirBTC, TOKENS.VIBE];

/** Maximum recipients allowed in a single bulk pay operation */
export const BULK_PAY_MAX_RECIPIENTS = 100;
