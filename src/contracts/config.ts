import { arcTestnet } from "@/constants/chains";
import type { Address } from "viem";

/**
 * Contract address registry, keyed by chain ID.
 *
 * Arc Testnet (5042002):
 *   USDC     — 0x3600000000000000000000000000000000000000 (native precompile, hardcoded)
 *   EURC     — from NEXT_PUBLIC_EURC_ADDRESS
 *   VIBE     — from NEXT_PUBLIC_VIBE_TOKEN_ADDRESS (deploy first via /contracts)
 */

interface ContractAddresses {
  usdc: Address;
  eurc: Address;
  vibeToken: Address;
}

const arcTestnetAddresses: ContractAddresses = {
  usdc:       "0x3600000000000000000000000000000000000000", // Arc native USDC precompile
  eurc:       (process.env.NEXT_PUBLIC_EURC_ADDRESS        ?? "") as Address,
  vibeToken:  (process.env.NEXT_PUBLIC_VIBE_TOKEN_ADDRESS  ?? "") as Address,
};

export const CONTRACT_ADDRESSES: Record<number, ContractAddresses> = {
  [arcTestnet.id]: arcTestnetAddresses,
};

/**
 * Retrieve contract addresses for the given chain.
 * Throws if the chain is not supported — guard with useArcNetwork first.
 */
export function getContractAddresses(chainId: number): ContractAddresses {
  const addresses = CONTRACT_ADDRESSES[chainId];
  if (!addresses) {
    throw new Error(`No contract addresses configured for chain ${chainId}`);
  }
  return addresses;
}
