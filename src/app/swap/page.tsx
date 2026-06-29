import type { Metadata } from "next";
import { PageWrapper } from "@/components/layout/PageWrapper";

export const metadata: Metadata = {
  title: "Swap — VibeFlow",
};

export default function SwapPage() {
  return (
    <PageWrapper
      title="Swap"
      description="Exchange tokens on Arc Testnet using existing liquidity."
    >
      <div className="relative mx-auto max-w-md w-full">
        {/* Blurred SwapForm placeholder */}
        <div className="blur-sm pointer-events-none select-none opacity-60">
          <div className="rounded-2xl border border-surface-100 bg-surface-50 p-6 space-y-4">
            <div className="h-10 rounded-xl bg-surface-100" />
            <div className="h-10 rounded-xl bg-surface-100" />
            <div className="flex justify-center">
              <div className="h-8 w-8 rounded-full bg-surface-200" />
            </div>
            <div className="h-10 rounded-xl bg-surface-100" />
            <div className="h-10 rounded-xl bg-surface-100" />
            <div className="h-12 rounded-xl bg-arc-200" />
          </div>
        </div>

        {/* Overlay message */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <div className="rounded-2xl border border-arc-200 bg-white/90 backdrop-blur-sm px-6 py-5 shadow-lg">
            <p className="text-arc-600 font-semibold text-base mb-1">
              Swap temporarily unavailable
            </p>
            <p className="text-surface-400 text-sm leading-relaxed">
              Circle App Kit swap is disabled due to limited liquidity on Arc
              Testnet. This will be fully functional on Arc Mainnet.
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}