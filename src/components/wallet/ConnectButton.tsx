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
  const { isCorrectNetwork, isSwitching, switchToDefault } = useArcNetwork();

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
        onClick={switchToDefault}
      >
        Switch Network
      </Button>
    );
  }

  return (
    <button
      onClick={() => disconnect()}
      className="flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-50 px-3 py-1.5 text-sm font-medium text-surface-800 hover:bg-surface-100 transition-colors"
    >
      <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
      {truncateAddress(address ?? "")}
    </button>
  );
}
