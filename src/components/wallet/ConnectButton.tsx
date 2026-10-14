"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { metaMask } from "wagmi/connectors";
import { Button } from "@/components/ui/Button";
import { truncateAddress } from "@/utils/address";
import { useArcNetwork } from "@/hooks/useArcNetwork";

/**
 * Displays either a "Connect Wallet" button or the connected account address.
 * On wrong network, shows a "Switch Network" button instead of the address.
 */
export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { isCorrectNetwork, isSwitching, switchToArc } = useArcNetwork();

  if (!isConnected) {
    return (
      <Button
        variant="primary"
        size="sm"
        isLoading={isPending}
        onClick={() => connect({ connector: metaMask() })}
      >
        Connect Wallet
      </Button>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <Button
        variant="danger"
        size="sm"
        isLoading={isSwitching}
        onClick={switchToArc}
      >
        Switch Network
      </Button>
    );
  }

  return (
    <button
      onClick={() => disconnect()}
      className="flex items-center gap-2 border border-[var(--line)] bg-[var(--glass)] px-3.5 py-1.5 text-xs font-medium text-[var(--fg)] hover:bg-[var(--glass-strong)] transition-colors"
    >
      <span className="h-1.5 w-1.5 bg-emerald-400" aria-hidden="true" />
      {truncateAddress(address ?? "")}
    </button>
  );
}
