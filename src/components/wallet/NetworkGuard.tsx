"use client";

import { useAccount } from "wagmi";
import { useArcNetwork } from "@/hooks/useArcNetwork";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface NetworkGuardProps {
  children: React.ReactNode;
}

/**
 * Wraps pages that require a connected wallet on Arc.
 *
 * - Not connected → prompt to connect
 * - Wrong network → prompt to switch
 * - Correct → render children
 */
export function NetworkGuard({ children }: NetworkGuardProps) {
  const { isConnected } = useAccount();
  const { isCorrectNetwork, isSwitching, switchToArc, requiredChainName } = useArcNetwork();

  if (!isConnected) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="max-w-sm w-full text-center">
          <p className="mb-4 text-sm text-surface-800">
            Connect your wallet to use VibeFlow.
          </p>
          {/* ConnectButton handles the actual connection */}
        </Card>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="max-w-sm w-full text-center">
          <p className="mb-1 font-semibold text-surface-800">Wrong Network</p>
          <p className="mb-5 text-sm text-[var(--fg-muted)]">
            VibeFlow requires Arc Mainnet or Arc Testnet.
          </p>
          <Button
            onClick={switchToArc}
            isLoading={isSwitching}
            className="w-full"
          >
            Switch to {requiredChainName}
          </Button>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
