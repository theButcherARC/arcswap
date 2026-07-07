"use client";

import { useChainId, useSwitchChain } from "wagmi";
import { SUPPORTED_CHAINS, DEFAULT_CHAIN, CHAIN_DISPLAY_INFO } from "@/constants/chains";

/**
 * Provides the current chain state and helpers to switch between supported chains.
 *
 * Use this hook in any component that needs to track the current network
 * or switch to a different supported chain (Arc Testnet, Base Sepolia, Base Mainnet).
 */
export function useArcNetwork() {
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const isCorrectNetwork = SUPPORTED_CHAINS.some(chain => chain.id === chainId);
  const supportedChainIds = SUPPORTED_CHAINS.map(chain => chain.id);

  function switchToChain(targetChainId: number) {
    if (supportedChainIds.includes(targetChainId)) {
      switchChain({ chainId: targetChainId });
    }
  }

  function switchToDefault() {
    switchChain({ chainId: DEFAULT_CHAIN.id });
  }

  return {
    chainId,
    isCorrectNetwork,
    isSwitching,
    switchToChain,
    switchToDefault,
    supportedChainIds,
    supportedChains: SUPPORTED_CHAINS,
    chainDisplayInfo: CHAIN_DISPLAY_INFO,
    defaultChainId: DEFAULT_CHAIN.id,
    defaultChainName: DEFAULT_CHAIN.name,
  };
}
