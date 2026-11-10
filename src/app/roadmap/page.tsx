import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import RoadJourney from "@/components/roadmap/RoadJourney";

export const metadata: Metadata = {
  title: "Roadmap - VibeFlow",
  description:
    "What VibeFlow is building, in the order we are building it: mainnet contracts, VibeWallet, pay-in pages, escrow, automation, and more on Arc.",
};

const LIVE = [
  ["Bulk Pay", "Up to 100 recipients in one transaction, one signature, simulated before your wallet opens."],
  ["CSV Upload", "A spreadsheet becomes a batch payment, checked row by row."],
  ["AI Payment Agent", "Describe a payment in plain words, the agent builds it for your review."],
  ["Scheduled Payments", "Save a batch with a date, review and sign when it is due. Non-custodial."],
  ["VibeID", "Join with X and your handle becomes your identity and payment address."],
  ["Vibrain", "Arc mainnet, live: blocks, USDC transfers, the largest moves, and the USDC freeze watch."],
  ["VibeSquare", "The community feed where money is attached: tips and pay requests in USDC."],
  ["Dashboard", "Every batch, schedule and settlement, with explorer proof."],
] as const;

export default function RoadmapPage() {
  return (
    <main className="relative min-h-screen bg-[var(--bg)] px-5 pb-24 pt-28 text-[var(--fg)] sm:px-8">
      <div className="relative mx-auto w-full max-w-6xl">
        <div className="mb-12 flex items-center justify-between border-b border-[var(--line)] pb-3">
          <span className="mono-label">SYS.ROADMAP / VIBEFLOW</span>
          <span className="mono-label hidden sm:inline">UPDATED NOV 2026</span>
        </div>

        <div className="text-center">
          <h1 className="text-5xl leading-[0.98] tracking-[-0.03em] sm:text-6xl">
            <span className="font-extrabold">The road</span>{" "}
            <span className="font-light">ahead.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-[var(--fg-muted)] sm:text-base">
            What VibeFlow is building, in the order we are building it. Payments stay the heart of it. Everything here serves one mission: stablecoin payments for everyone, everywhere.
          </p>
        </div>

        {/* LIVE NOW */}
        <section className="mt-20" aria-label="Live now">
          <div className="rule-tick mb-10 pt-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-3xl font-bold tracking-[-0.02em] sm:text-4xl">Live now</h2>
              <span className="mono-label hidden md:inline">SYS.LIVE / 08</span>
            </div>
          </div>
          <div className="grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)] md:grid-cols-2 lg:grid-cols-4">
            {LIVE.map(([title, body]) => (
              <div key={title} className="bg-white/60 p-6">
                <div className="mb-6 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
                  <span className="mono-label !text-[var(--success)]">Live</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold tracking-tight">{title}</h3>
                <p className="text-sm leading-relaxed text-[var(--fg-muted)]">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* THE ROAD */}
        <section className="mt-24" aria-label="The plan">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-[-0.02em] sm:text-4xl">The plan, in order</h2>
            <p className="mono-label mt-3">SYS.PLAN / 15 STOPS</p>
            <p className="mt-3 text-sm text-[var(--fg-faint)]">Scroll. The road builds itself.</p>
          </div>

          <RoadJourney />

          <p className="mx-auto mt-16 max-w-2xl text-center text-sm leading-relaxed text-[var(--fg-faint)]">
            This order is the plan, not a promise of dates. When an item ships, it moves up to Live now. Contracts are built in Arc Studio first, and every payment feature is simulated before a wallet ever opens.
          </p>

          <div className="mt-10 text-center">
            <Link
              href={ROUTES.BULK_PAY}
              className="inline-flex items-center justify-center gap-2.5 bg-[var(--accent)] px-8 py-4 text-base font-semibold text-[var(--bg)] transition-opacity duration-200 hover:opacity-85"
            >
              Launch App
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
