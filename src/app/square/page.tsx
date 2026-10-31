import type { Metadata } from "next";
import { SquareFeed } from "@/components/square/SquareFeed";

export const metadata: Metadata = {
  title: "VibeSquare",
  robots: { index: false, follow: false },
};

export default function SquarePage() {
  return (
    <main className="relative min-h-screen bg-[var(--bg)] px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="relative mx-auto w-full max-w-3xl">
        <SquareFeed />
      </div>
    </main>
  );
}
