"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/Button";
import { truncateAddress } from "@/utils/address";
import { useArcNetwork } from "@/hooks/useArcNetwork";

/**
 * Displays either a "Connect Wallet" button or the connected account address.
 * On wrong network, shows a "Switch Network" button instead of the address.
 */
const NO_WALLET_NOTE =
  "No wallet opened. If you have a wallet extension, give it a second and try again. If nothing opens, install MetaMask, or open VibeFlow inside your wallet app's browser, then try again.";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { isCorrectNetwork, isSwitching, switchToArc } = useArcNetwork();
  const [note, setNote] = useState<string | null>(null);

  // Try the configured MetaMask connector first, then fall back to any
  // other injected wallet. Either way, a failed attempt must SAY something:
  // a silent no-op reads as "the site is broken" to a first-time user.
  const handleConnect = () => {
    setNote(null);
    const metaMaskConnector = connectors.find((c) => c.id === "metaMask");
    const injectedConnector = connectors.find((c) => c.id === "injected");
    const first = metaMaskConnector ?? injectedConnector ?? connectors[0];
    if (!first) {
      setNote(NO_WALLET_NOTE);
      return;
    }
    connect(
      { connector: first },
      {
        onError: () => {
          if (injectedConnector && first !== injectedConnector) {
            connect(
              { connector: injectedConnector },
              { onError: () => setNote(NO_WALLET_NOTE) },
            );
          } else {
            setNote(NO_WALLET_NOTE);
          }
        },
      },
    );
  };

  if (!isConnected) {
    return (
      <div className="relative">
        <Button
          variant="primary"
          size="sm"
          isLoading={isPending}
          onClick={handleConnect}
        >
          Connect Wallet
        </Button>
        {note ? (
          <p className="absolute right-0 top-full z-50 mt-2 w-60 border border-[var(--line)] bg-white p-3 text-left text-[11px] leading-relaxed text-[var(--fg-muted)] shadow-xl">
            {note}
          </p>
        ) : null}
      </div>
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
