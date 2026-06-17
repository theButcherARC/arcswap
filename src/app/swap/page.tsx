import type { Metadata } from "next";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { NetworkGuard } from "@/components/wallet/NetworkGuard";
import { SwapForm } from "@/components/swap/SwapForm";

export const metadata: Metadata = {
  title: "Swap — ArcSwap",
};

export default function SwapPage() {
  return (
    <PageWrapper
      title="Swap"
      description="Exchange tokens on Arc Testnet using existing liquidity."
    >
      <NetworkGuard>
        <SwapForm />
      </NetworkGuard>
    </PageWrapper>
  );
}
