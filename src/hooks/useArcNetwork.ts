"use client";

import { useChainId, useSwitchChain } from "wagmi";
import { arcTestnet } from "@/constants/chains";

/**
 * Provides the current chain state and a helper to switch to Arc Testnet.
 *
 * Use this hook in any component or hook that needs to guard against
 * the user being on the wrong network before sending a transaction.
 */
export function useArcNetwork() {
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const isCorrectNetwork = chainId === arcTestnet.id;

  function switchToArc() {
    switchChain({ chainId: arcTestnet.id });
  }

  return {
    chainId,
    isCorrectNetwork,
    isSwitching,
    switchToArc,
    requiredChainId: arcTestnet.id,
    requiredChainName: arcTestnet.name,
  };
}
