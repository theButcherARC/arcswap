import { defineChain } from "viem";

/**
 * Arc Mainnet chain definition.
 *
 * Chain ID:        5042
 * RPC:             https://rpc.mainnet.arc.io
 * Explorer:        https://explorer.arc.io
 * Native token:    USDC (18 decimals at the EVM/gas level) - Arc L1 uses native USDC as gas asset
 * USDC ERC-20:     0x3600000000000000000000000000000000000000 (precompile, 6 decimals)
 */
export const arc = defineChain({
  id: 5042,
  name: "Arc",
  nativeCurrency: {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.mainnet.arc.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Arc Explorer",
      url: "https://explorer.arc.io",
    },
  },
});

/**
 * Arc Testnet chain definition.
 *
 * Chain ID:        5042002
 * RPC:             https://rpc.testnet.arc.io
 * Explorer:        https://explorer.testnet.arc.io
 */
export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.arc.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Arc Explorer",
      url: "https://explorer.testnet.arc.io",
    },
  },
  testnet: true,
});

export const SUPPORTED_CHAINS = [arc, arcTestnet] as const;

export const DEFAULT_CHAIN = arc;
