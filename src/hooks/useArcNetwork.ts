"use client";

import { useChainId, useSwitchChain } from "wagmi";
import { DEFAULT_CHAIN } from "@/constants/chains";

/**
 * Provides the current chain state and a helper to switch to Arc Mainnet.
 *
 * Use this hook in any component or hook that needs to guard against
 * the user being on the wrong network before sending a transaction.
 */
export function useArcNetwork() {
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const isCorrectNetwork = chainId === DEFAULT_CHAIN.id;

  function switchToArc() {
    switchChain({ chainId: DEFAULT_CHAIN.id });
  }

  return {
    chainId,
    isCorrectNetwork,
    isSwitching,
    switchToArc,
    requiredChainId: DEFAULT_CHAIN.id,
    requiredChainName: DEFAULT_CHAIN.name,
  };
}
