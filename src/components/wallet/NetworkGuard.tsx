"use client";

import { useAccount } from "wagmi";
import { useArcNetwork } from "@/hooks/useArcNetwork";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface NetworkGuardProps {
  children: React.ReactNode;
}

/**
 * Wraps pages that require a connected wallet on a supported chain.
 *
 * - Not connected → prompt to connect
 * - Wrong network → prompt to switch to a supported chain
 * - Correct → render children
 *
 * Supports: Arc Testnet, Base Sepolia, Base Mainnet
 */
export function NetworkGuard({ children }: NetworkGuardProps) {
  const { isConnected } = useAccount();
  const { isCorrectNetwork, isSwitching, switchToDefault, defaultChainName, supportedChains } = useArcNetwork();

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
    const chainList = supportedChains.map((c) => c.name).join(", ");
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="max-w-sm w-full text-center">
          <p className="mb-1 font-semibold text-surface-800">Wrong Network</p>
          <p className="mb-5 text-sm text-surface-200">
            VibeFlow supports {chainList}.
          </p>
          <Button
            onClick={switchToDefault}
            isLoading={isSwitching}
            className="w-full"
          >
            Switch to {defaultChainName}
          </Button>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
