import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

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

const PHASES = [
  {
    label: "Next",
    items: [
      ["BatchPay on mainnet", "The batch contract built in Arc Studio, tested for 1,000 recipients, goes live on Arc mainnet and the app moves onto it."],
      ["VibeID Registry on mainnet", "The identity registry built in Arc Studio, already live on testnet, deploys to mainnet."],
    ],
  },
  {
    label: "The wallet era",
    items: [
      ["VibeWallet", "A wallet inside the app, created the moment you join with X. No seed phrase to lose, gas handled for you."],
      ["Pay-in pages and invoice links", "Send anyone a link and get paid, whether they hold crypto or not. Built for freelancers first."],
      ["Earn escrow, live", "Bounties with the budget locked in escrow you can verify on the explorer. Approval pays out instantly in USDC."],
    ],
  },
  {
    label: "Automation",
    items: [
      ["Scheduled payments, automated", "Set a payment once with limits and an expiry you control. It executes on its own, and you can revoke it any time."],
      ["Agent rails", "Hire agents inside the hub and let them pay within limits you set. Agentic payments, with your rules."],
    ],
  },
  {
    label: "Money in and out",
    items: [
      ["CCTP", "Native USDC bridging into and out of Arc. Money arrives as USDC, not a wrapped copy."],
      ["Swap", "A quiet swap inside your balance: USDC, EURC and cirBTC. No trading screen, no noise."],
    ],
  },
  {
    label: "Growth",
    items: [
      ["Embeds", "VibeSquare tips and pay requests that any site or community can embed."],
      ["Creator gigs", "Campaigns on Earn with apply-first curation: approved creators, escrowed budgets, instant settlement."],
      ["$VIBE fee discount", "Holding $VIBE cuts the batch fee. The token serves the product, not the other way around."],
    ],
  },
  {
    label: "Later",
    items: [
      ["Fiat last mile", "Bank and card payouts through licensed partners, once volume justifies it. Receiving stays instant on Arc."],
    ],
  },
  {
    label: "Last",
    items: [
      ["Prediction markets", "Last on this list, and only after a full legal review."],
    ],
  },
] as const;

export default function RoadmapPage() {
  let n = 0;
  return (
    <main className="relative min-h-screen bg-[var(--bg)] px-5 pb-24 pt-28 text-[var(--fg)] sm:px-8">
      <div className="relative mx-auto w-full max-w-6xl">
        <div className="mb-10 flex items-center justify-between border-b border-[var(--line)] pb-3">
          <span className="mono-label">SYS.ROADMAP / VIBEFLOW</span>
          <span className="mono-label hidden sm:inline">UPDATED NOV 2026</span>
        </div>

        <h1 className="max-w-3xl text-5xl font-bold leading-[0.98] tracking-[-0.03em] sm:text-6xl">
          The road ahead.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--fg-muted)] sm:text-lg">
          What VibeFlow is building, in the order we are building it. Payments stay the heart of it. Everything here serves one mission: stablecoin payments for everyone, everywhere.
        </p>

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
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--data)]" />
                  <span className="mono-label !text-[var(--data)]">Live</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold tracking-tight">{title}</h3>
                <p className="text-sm leading-relaxed text-[var(--fg-muted)]">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* THE PLAN */}
        <section className="mt-24" aria-label="The plan">
          <div className="rule-tick mb-4 pt-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-3xl font-bold tracking-[-0.02em] sm:text-4xl">The plan, in order</h2>
              <span className="mono-label hidden md:inline">SYS.PLAN / 14</span>
            </div>
          </div>

          {PHASES.map((phase) => (
            <div key={phase.label} className="mt-12">
              <p className="mono-label mb-2 !text-[var(--accent)]">{phase.label}</p>
              <div className="border-t border-[var(--line)]">
                {phase.items.map(([title, body]) => {
                  n += 1;
                  return (
                    <div key={title} className="flex gap-5 border-b border-[var(--line)] py-6 sm:gap-8">
                      <span className="font-mono text-xl font-bold text-[var(--fg-faint)] sm:text-2xl">
                        {String(n).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h3>
                        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--fg-muted)]">{body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <p className="mt-14 max-w-2xl text-sm leading-relaxed text-[var(--fg-faint)]">
            This order is the plan, not a promise of dates. When an item ships, it moves up to Live now. Contracts are built in Arc Studio first, and every payment feature is simulated before a wallet ever opens.
          </p>

          <div className="mt-10">
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
