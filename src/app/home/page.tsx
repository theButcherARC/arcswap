import type { Metadata } from "next";
import { HomeTop } from "@/components/home/HomeTop";
import { SquareFeed } from "@/components/square/SquareFeed";

export const metadata: Metadata = {
  title: "Home",
  robots: { index: false, follow: false },
};

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-[var(--bg)] px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="relative mx-auto w-full max-w-3xl">
        <HomeTop />
        <div className="border-t border-[var(--line)] pt-10">
          <SquareFeed />
        </div>
      </div>
    </main>
  );
}
