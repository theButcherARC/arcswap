import type { Metadata } from "next";
import { VibrainLive } from "@/components/vibrain/VibrainLive";

export const metadata: Metadata = {
  title: "Vibrain",
  description:
    "Live activity on Arc mainnet: latest blocks, USDC transfers and the largest moves, read straight from the chain.",
};

export default function VibrainPage() {
  return (
    <main className="relative min-h-screen bg-[var(--bg)] px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="relative mx-auto w-full max-w-5xl">
        <VibrainLive />
      </div>
    </main>
  );
}
