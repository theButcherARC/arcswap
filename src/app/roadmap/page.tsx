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

type Phase = {
  label: string;
  color: string;
  items: readonly (readonly [string, string])[];
};

const PHASES: Phase[] = [
  {
    label: "Next",
    color: "var(--phase-1)",
    items: [
      ["BatchPay on mainnet", "The batch contract built in Arc Studio, tested for 1,000 recipients, goes live on Arc mainnet and the app moves onto it."],
      ["VibeID Registry on mainnet", "The identity registry built in Arc Studio, already live on testnet, deploys to mainnet."],
    ],
  },
  {
    label: "The wallet era",
    color: "var(--accent)",
    items: [
      ["VibeWallet", "A wallet inside the app, created the moment you join with X. No seed phrase to lose, gas handled for you."],
      ["Pay-in pages and invoice links", "Send anyone a link and get paid, whether they hold crypto or not. Built for freelancers first."],
      ["Earn escrow, live", "Bounties with the budget locked in escrow you can verify on the explorer. Approval pays out instantly in USDC."],
    ],
  },
  {
    label: "Automation",
    color: "var(--phase-3)",
    items: [
      ["Scheduled payments, automated", "Set a payment once with limits and an expiry you control. It executes on its own, and you can revoke it any time."],
      ["Agent rails", "Hire agents inside the hub and let them pay within limits you set. Agentic payments, with your rules."],
    ],
  },
  {
    label: "Money in and out",
    color: "var(--phase-4)",
    items: [
      ["CCTP", "Native USDC bridging into and out of Arc. Money arrives as USDC, not a wrapped copy."],
      ["Swap", "A quiet swap inside your balance: USDC, EURC and cirBTC. No trading screen, no noise."],
    ],
  },
  {
    label: "Growth",
    color: "var(--phase-1)",
    items: [
      ["Embeds", "VibeSquare tips and pay requests that any site or community can embed."],
      ["Creator gigs", "Campaigns on Earn with apply-first curation: approved creators, escrowed budgets, instant settlement."],
      ["$VIBE fee discount", "Holding $VIBE cuts the batch fee. The token serves the product, not the other way around."],
    ],
  },
  {
    label: "Later",
    color: "var(--accent)",
    items: [
      ["Fiat last mile", "Bank and card payouts through licensed partners, once volume justifies it. Receiving stays instant on Arc."],
    ],
  },
  {
    label: "Last",
    color: "var(--fg-faint)",
    items: [
      ["Prediction markets", "Last on this list, and only after a full legal review."],
    ],
  },
];

const STARTS = [0, 2, 5, 7, 9, 12, 13];

function PhaseItems({ phase, start }: { phase: Phase; start: number }) {
  return (
    <div>
      <p className="mono-label mb-3" style={{ color: phase.color }}>
        {phase.label}
      </p>
      <div className="space-y-3.5">
        {phase.items.map(([title, body], i) => (
          <div key={title}>
            <p className="text-sm font-semibold leading-snug tracking-tight text-[var(--fg)]">
              <span className="mr-1.5 font-mono text-[11px] font-bold text-[var(--fg-faint)]">
                {String(start + i + 1).padStart(2, "0")}
              </span>
              {title}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--fg-muted)]">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Marker({ index, color, size }: { index: number; color: string; size: string }) {
  return (
    <span
      className={`relative z-10 flex ${size} shrink-0 items-center justify-center rounded-full border-4 border-[var(--bg)] font-mono font-bold text-white`}
      style={{ background: color }}
    >
      {index + 1}
    </span>
  );
}

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
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-[-0.02em] sm:text-4xl">The plan, in order</h2>
            <p className="mono-label mt-3">SYS.PLAN / 14 STOPS ON ONE ROAD</p>
          </div>

          {/* Desktop road */}
          <div className="relative mt-6 hidden lg:block">
            <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[14px] -translate-y-1/2 rounded-full bg-[var(--fg)]" />
            <div className="pointer-events-none absolute inset-x-4 top-1/2 -translate-y-1/2 border-t-[3px] border-dashed border-white/60" />
            <div className="relative grid grid-cols-7">
              {PHASES.map((phase, i) => {
                const above = i % 2 === 0;
                return (
                  <div key={phase.label} className="flex flex-col items-center px-2">
                    <div className="flex min-h-[248px] flex-col justify-end pb-1">
                      {above ? (
                        <div className="text-center">
                          <div className="[&_p]:text-center">
                            <PhaseItems phase={phase} start={STARTS[i]} />
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <div className="flex h-7 items-stretch justify-center">
                      {above ? (
                        <span className="border-l-2 border-dotted" style={{ borderColor: phase.color }} />
                      ) : null}
                    </div>
                    <Marker index={i} color={phase.color} size="h-12 w-12 text-sm" />
                    <div className="flex h-7 items-stretch justify-center">
                      {!above ? (
                        <span className="border-l-2 border-dotted" style={{ borderColor: phase.color }} />
                      ) : null}
                    </div>
                    <div className="min-h-[248px] pt-1">
                      {!above ? (
                        <div className="text-center">
                          <div className="[&_p]:text-center">
                            <PhaseItems phase={phase} start={STARTS[i]} />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile road */}
          <div className="relative mt-12 lg:hidden">
            <div className="pointer-events-none absolute bottom-3 left-[13px] top-3 w-[10px] rounded-full bg-[var(--fg)]" />
            <div className="pointer-events-none absolute bottom-3 left-[17px] top-3 border-l-2 border-dashed border-white/60" />
            <div className="space-y-10">
              {PHASES.map((phase, i) => (
                <div key={phase.label} className="relative flex gap-5">
                  <Marker index={i} color={phase.color} size="h-9 w-9 text-xs" />
                  <div className="pt-1">
                    <PhaseItems phase={phase} start={STARTS[i]} />
                  </div>
                </div>
              ))}
            </div>
          </div>

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
