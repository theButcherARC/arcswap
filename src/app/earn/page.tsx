import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Earn",
  robots: { index: false, follow: false },
};

const CARDS = [
  {
    tag: "IN BUILD",
    title: "Bounties",
    body: "Projects post real work with the budget locked in escrow on Arc mainnet, visible on the explorer before you start. Finish the work, get approved, and the payout lands instantly. No ghosted payments, because the money is already locked.",
  },
  {
    tag: "APPLY FIRST",
    title: "Creator gigs",
    body: "Creators apply first with their VibeID and past work. Only approved creators see campaigns, quote on them, and deliver. Every finished gig becomes proof of work on your VibeID. The apply gate is deliberate: it is how the Square stays free of slop.",
  },
];

const RULES = [
  "Escrow is mandatory, never optional, and always mainnet USDC",
  "Approval pays out instantly through the same batch system that runs payroll here",
  "Winners and payouts are public, with the explorer link attached",
  "Testnet money is never presented as real money, anywhere on this page",
];

export default function EarnPage() {
  return (
    <main className="relative min-h-screen bg-[var(--bg)] px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="relative mx-auto w-full max-w-3xl">
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--fg)] sm:text-4xl">
              EARN
            </h1>
            <span className="rounded-full border border-[var(--line)] px-2.5 py-1">
              <span className="mono-label !text-[var(--accent)]">V1 SOON</span>
            </span>
          </div>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--fg-muted)]">
            Real work, paid in USDC on Arc. This is the plan, stated plainly,
            while the escrow rails are being built. Nothing here is listed
            yet, and no numbers on this page are invented.
          </p>
        </div>

        <div className="mb-10 grid gap-px overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2">
          {CARDS.map((c) => (
            <div key={c.title} className="bg-[var(--bg-raised)] p-6">
              <p className="mono-label mb-3 !text-[var(--accent)]">{c.tag}</p>
              <h2 className="mb-2 text-lg font-semibold text-[var(--fg)]">
                {c.title}
              </h2>
              <p className="text-sm leading-relaxed text-[var(--fg-muted)]">
                {c.body}
              </p>
            </div>
          ))}
        </div>

        <h2 className="mono-label mb-4 !text-[var(--fg-muted)]">
          HOW EARN WILL RUN
        </h2>
        <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {RULES.map((r, i) => (
            <div key={r} className="flex items-start gap-3 py-3.5">
              <span className="font-mono text-sm text-[var(--data)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-sm leading-relaxed text-[var(--fg)]">{r}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs leading-relaxed text-[var(--fg-faint)]">
          Bounties open first, once the escrow contract is live and reviewed.
          Creator applications open after that. When either opens, it will be
          announced in the Square and on the landing page, not before.
        </p>
      </div>
    </main>
  );
}
