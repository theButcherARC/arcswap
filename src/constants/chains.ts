import { defineChain } from "viem";

/**
 * Arc Testnet chain definition.
 *
 * Chain ID:        5042002
 * RPC:             https://rpc.testnet.arc.network
 * Explorer:        https://explorer.testnet.arc.network
 * Native token:    USDC (6 decimals) — Arc L1 uses native USDC as gas asset
 * USDC address:    0x3600000000000000000000000000000000000000 (native, precompile)
 */
export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.arc.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Arc Explorer",
      url: "https://explorer.testnet.arc.network",
    },
  },
  testnet: true,
});

export const SUPPORTED_CHAINS = [arcTestnet] as const;

export const DEFAULT_CHAIN = arcTestnet;
