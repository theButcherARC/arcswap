import Link from "next/link";
import dynamic from "next/dynamic";
import { ROUTES } from "@/constants/routes";

const HeroCanvas = dynamic(() => import("@/components/landing/HeroCanvas"), {
  ssr: false,
});
const PoweredBySection = dynamic(() => import("@/components/landing/PoweredBySection"), {
  ssr: false,
});
import FaqSection from "@/components/landing/FaqSection";

const FEATURES = [
  {
    fig: "FIG 01",
    sys: "SYS.PARSE",
    title: "AI Payment Agent",
    body: "Describe payments in plain English. VibeAI parses your intent instantly: recipients, amounts, tokens, all auto-filled in seconds.",
    tag: "VibeAI",
    accent: "accent" as const,
  },
  {
    fig: "FIG 02",
    sys: "SYS.BATCH",
    title: "Zero Approval Flow",
    body: "Multicall3From preserves msg.sender throughout the batch. No ERC20 approve step needed, your USDC moves in one click.",
    tag: "0 approvals",
    accent: "data" as const,
  },
  {
    fig: "FIG 03",
    sys: "SYS.PERKS",
    title: "VIBE Token Perks",
    body: "CSV upload, payroll templates, and a 50% fee discount for VIBE holders (coming soon).",
    tag: "Coming soon",
    accent: "accent" as const,
  },
  {
    fig: "FIG 04",
    sys: "SYS.TOKENS",
    title: "USDC + EURC",
    body: "Pay in US dollars or Euros. Switch stablecoins with one click. Both Circle-issued, both on Arc.",
    tag: "2 stablecoins",
    accent: "data" as const,
  },
  {
    fig: "FIG 05",
    sys: "SYS.MEMO",
    title: "Onchain Memo Labels",
    body: "Tag every payroll batch with a label stored permanently onchain. July Salary. Q3 Bonus. Contractor Batch.",
    tag: "Memo contract",
    accent: "accent" as const,
  },
  {
    fig: "FIG 06",
    sys: "SYS.IDENTITY",
    title: "Unique VibeID",
    body: "Get a permanent, unique identifier like VIBE-XXXXX. Pay anyone by their X handle, wallet address, or VibeID.",
    tag: "@handle or VIBE-ID",
    accent: "data" as const,
  },
];

const STEPS = [
  {
    fig: "STEP 01",
    title: "Connect Wallet",
    body: "Link MetaMask with USDC on Arc. NetworkGuard auto-switches to Arc Mainnet.",
    points: ["MetaMask supported", "Auto network switch", "Live balance display"],
  },
  {
    fig: "STEP 02",
    title: "Describe Payment",
    body: "Use AI or manual entry to define recipients and amounts. AI auto-fills the entire form.",
    points: ["Natural language input", "Percentage splits", "Up to 100 recipients per batch"],
  },
  {
    fig: "STEP 03",
    title: "One Click Send",
    body: "Sign once in MetaMask. Every payment settles on-chain instantly via Multicall3From.",
    points: ["Single MetaMask popup", "Explorer tx link", "Sub-second settlement"],
  },
];

const STATS = [
  { value: "1", label: "Signature Per Batch" },
  { value: "Zero", label: "Token Approvals Needed" },
  { value: "<1s", label: "Arc Finality" },
  { value: "100", label: "Recipients Per Tx" },
];

export default function VibeFlowLanding() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg)] text-[var(--fg)]">
      {/* Exposed brutalist grid backdrop */}
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-25" aria-hidden="true" />

      {/* ==================== HERO ==================== */}
      <section className="relative flex min-h-screen flex-col justify-center px-5 pt-28 pb-20 sm:px-8">
        <HeroCanvas />

        <div className="relative z-10 mx-auto w-full max-w-6xl">
          {/* Mono metadata row */}
          <div className="animate-fade-in mb-10 flex items-center justify-between border-b border-[var(--line)] pb-3">
            <span className="mono-label">VF.PAYROLL / ARC.CHAIN / REV 1.0</span>
            <span className="mono-label hidden sm:inline">SETTLEMENT: USDC.EURC</span>
          </div>

          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-9">
              <Link
                href={ROUTES.BULK_PAY}
                className="animate-fade-in-up group mb-4 flex w-fit items-center gap-2.5 border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-4 py-2 backdrop-blur-xl transition-colors duration-200 hover:border-[var(--accent)]"
              >
                <span className="mono-label !text-[var(--accent)]">New</span>
                <span className="mono-label !text-[var(--fg-muted)]">Scheduled payments are live</span>
                <svg className="text-[var(--accent)] transition-transform duration-300 group-hover:translate-x-0.5" width="12" height="12" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9H15M15 9L10 4M15 9L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>

              <div className="animate-fade-in-up mb-8 inline-flex items-center gap-2.5 border border-[var(--line)] bg-[var(--glass)] px-4 py-2 backdrop-blur-xl">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--data)] opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--data)]" />
                </span>
                <span className="mono-label !text-[var(--fg-muted)]">Built with Arc Studio · Powered by Arc Blockchain</span>
              </div>

              <h1 className="animate-fade-in-up delay-100 max-w-4xl text-5xl font-bold leading-[0.98] tracking-[-0.03em] sm:text-6xl md:text-7xl xl:text-8xl">
                Batch USDC
                <br />
                payments.
                <br />
                <span className="text-[var(--fg-faint)]">One signature.</span>
              </h1>

              <p className="animate-fade-in-up delay-200 mt-8 max-w-xl text-base leading-relaxed text-[var(--fg-muted)] sm:text-lg">
                Send USDC or EURC to your entire team in one transaction. AI-powered, zero approval, settled in under a second on Arc.
              </p>

              <div className="animate-fade-in-up delay-300 mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={ROUTES.BULK_PAY}
                  className="group inline-flex items-center justify-center gap-2.5 bg-[var(--accent)] px-8 py-4 text-base font-semibold text-[var(--bg)] transition-opacity duration-200 hover:opacity-85"
                >
                  Launch App
                  <svg className="transition-transform duration-300 group-hover:translate-x-0.5" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9H15M15 9L10 4M15 9L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link
                  href={ROUTES.DASHBOARD}
                  className="btn-brutal inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-medium text-[var(--fg-muted)] hover:text-[var(--fg)]"
                >
                  View Dashboard
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Spec column: brutalist metadata */}
            <div className="animate-fade-in-up delay-500 hidden lg:col-span-3 lg:block">
              <div className="space-y-0 border-l border-[var(--line)] pl-6">
                {[
                  ["No code required"],
                  ["Zero approval needed"],
                  ["AI-powered parsing"],
                  ["Sub-second finality"],
                ].map(([label]) => (
                  <div key={label} className="flex items-center gap-3 border-b border-[var(--line)] py-3 last:border-b-0">
                    <span className="h-1 w-1 bg-[var(--data)]" />
                    <span className="mono-label !text-[var(--fg-muted)]">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 h-24 bg-gradient-to-t from-[var(--bg)] to-transparent pointer-events-none" />
      </section>

      {/* ==================== PRODUCT PREVIEW ==================== */}
      <section className="relative z-10 px-5 mb-28 sm:px-8" aria-label="Product preview">
        <div className="relative mx-auto max-w-6xl">
          {/* Accent glow behind the card */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-[36rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] opacity-[0.13] blur-[110px]" aria-hidden="true" />

          <div className="animate-fade-in-up delay-200 relative border border-[var(--line)] bg-[var(--bg-raised)] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
            {/* Crosshair corner marks */}
            <span className="mono-label absolute -top-2.5 left-4 z-10 bg-[var(--bg)] px-1 !text-[var(--fg-faint)]" aria-hidden="true">+</span>
            <span className="mono-label absolute -top-2.5 right-4 z-10 bg-[var(--bg)] px-1 !text-[var(--fg-faint)]" aria-hidden="true">+</span>
            <span className="mono-label absolute -bottom-2.5 left-4 z-10 bg-[var(--bg)] px-1 !text-[var(--fg-faint)]" aria-hidden="true">+</span>
            <span className="mono-label absolute -bottom-2.5 right-4 z-10 bg-[var(--bg)] px-1 !text-[var(--fg-faint)]" aria-hidden="true">+</span>
            {/* Card header */}
            <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4 sm:px-8">
              <span className="mono-label">SYS.BATCH / JULY PAYROLL</span>
              <span className="mono-label border border-[var(--line)] px-2.5 py-1 !text-[var(--accent)]">1 signature</span>
            </div>

            {/* Recipient rows */}
            <div className="divide-y divide-[var(--line)] px-6 sm:px-8">
              {[
                ["Alice", "0x742d...bD38", "$2,500.00"],
                ["Bob", "0x8ba1...DBA72", "$1,800.00"],
                ["Sarah", "0xdD87...2148", "$2,200.00"],
                ["Mike", "0x5aA2...9cE1", "$1,500.00"],
              ].map(([name, addr, amt]) => (
                <div key={name} className="flex items-center justify-between gap-4 py-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--line)] bg-[var(--glass)] font-mono text-xs font-bold text-[var(--fg-muted)]">
                      {name.slice(0, 1)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--fg)]">{name}</p>
                      <p className="font-mono text-[11px] text-[var(--fg-faint)]">{addr}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-[var(--fg)]">
                    {amt}
                    <span className="ml-1.5 font-normal text-[var(--fg-faint)]">USDC</span>
                  </span>
                </div>
              ))}
              <div className="py-3.5">
                <span className="mono-label !text-[var(--fg-faint)]">+ 21 more recipients</span>
              </div>
            </div>

            {/* Card footer */}
            <div className="flex flex-col gap-3 border-t border-[var(--line)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--data)]" />
                <span className="mono-label !text-[var(--fg-muted)]">Simulated OK · All or nothing · Settles in under 1s</span>
              </div>
              <div className="flex items-baseline gap-5">
                <span className="mono-label">Fee $16.00 (0.2%)</span>
                <span className="text-lg font-bold tracking-tight text-[var(--fg)]">
                  $8,000.00 <span className="text-sm font-normal text-[var(--fg-faint)]">USDC</span>
                </span>
              </div>
            </div>
          </div>

          {/* Floating chips */}
          <div className="animate-fade-in-up delay-300 absolute -top-6 right-6 hidden items-center gap-3 border border-[var(--line)] bg-[var(--glass-strong)] px-4 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl md:flex">
            <span className="flex h-6 w-6 items-center justify-center bg-[var(--data)] text-[var(--bg)]">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <p className="text-xs font-semibold text-[var(--fg)]">Batch settled</p>
              <p className="font-mono text-[10px] text-[var(--fg-faint)]">0.4s on Arc</p>
            </div>
          </div>
          <div className="animate-fade-in-up delay-500 absolute -bottom-6 left-6 hidden items-center gap-3 border border-[var(--line)] bg-[var(--glass-strong)] px-4 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl md:flex">
            <span className="flex h-6 w-6 items-center justify-center bg-[var(--accent)] text-[var(--bg)]">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.6" />
                <path d="M7 4V7.2L9.2 8.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <p className="text-xs font-semibold text-[var(--fg)]">Scheduled</p>
              <p className="font-mono text-[10px] text-[var(--fg-faint)]">Pays out Oct 31, 9:00 AM</p>
            </div>
          </div>

          <p className="mono-label mt-10 text-center !text-[var(--fg-faint)]">Illustration of a VibeFlow batch</p>
        </div>
      </section>

      {/* ==================== STATS ==================== */}
      <section className="relative z-10 px-5 mb-28 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="animate-fade-in-up delay-200 overflow-hidden border border-[var(--line)] bg-[var(--line)] grid grid-cols-2 gap-px md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-start justify-center bg-[var(--bg-raised)] px-6 py-10 sm:px-8">
                <span className="text-4xl font-bold tracking-tight text-[var(--fg)] sm:text-5xl">{s.value}</span>
                <span className="mono-label mt-3">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FEATURES ==================== */}
      <section id="features" className="relative z-10 px-5 mb-32 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rule-tick mb-14 pt-4">
            <div className="flex items-baseline justify-between">
              <h2 className="max-w-2xl text-3xl font-bold tracking-[-0.02em] sm:text-4xl md:text-5xl">
                Everything you need to move money at scale.
              </h2>
              <span className="mono-label hidden md:inline">SYS.FEATURES / 06</span>
            </div>
          </div>

          <div className="grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)] md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.fig} className="group relative bg-[var(--bg-raised)] p-8 transition-colors duration-300 hover:bg-[var(--glass-strong)]">
                <div className="mb-10 flex items-center justify-between">
                  <span className="mono-label">{f.fig}</span>
                  <span className={`mono-label ${f.accent === "accent" ? "!text-[var(--accent)]" : "!text-[var(--data)]"}`}>{f.sys}</span>
                </div>
                <h3 className="mb-3 text-xl font-semibold tracking-tight text-[var(--fg)]">{f.title}</h3>
                <p className="mb-8 text-sm leading-relaxed text-[var(--fg-muted)]">{f.body}</p>
                <div className="flex items-center justify-between border-t border-[var(--line)] pt-4">
                  <span className="mono-label">{f.tag}</span>
                  <span className={`h-1.5 w-1.5 transition-transform duration-300 group-hover:scale-150 ${f.accent === "accent" ? "bg-[var(--accent)]" : "bg-[var(--data)]"}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== POWERED BY ==================== */}
      <PoweredBySection />

      {/* ==================== HOW IT WORKS ==================== */}
      <section id="how-it-works" className="relative z-10 px-5 mb-32 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rule-tick mb-14 pt-4">
            <div className="flex items-baseline justify-between">
              <h2 className="max-w-2xl text-3xl font-bold tracking-[-0.02em] sm:text-4xl md:text-5xl">
                Three steps to mass payment clarity.
              </h2>
              <span className="mono-label hidden md:inline">SYS.FLOW / 03</span>
            </div>
          </div>

          <div className="grid gap-px border border-[var(--line)] bg-[var(--line)] md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.fig} className="relative bg-[var(--bg-raised)] p-8 transition-colors duration-300 hover:bg-[#101018]">
                <div className="mb-10 flex items-center justify-between">
                  <span className="mono-label">{s.fig}</span>
                  <span className="font-mono text-2xl font-bold text-[var(--fg-faint)]">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mb-3 text-xl font-semibold tracking-tight text-[var(--fg)]">{s.title}</h3>
                <p className="mb-8 text-sm leading-relaxed text-[var(--fg-muted)]">{s.body}</p>
                <div className="space-y-0 border-t border-[var(--line)]">
                  {s.points.map((p) => (
                    <div key={p} className="flex items-center gap-3 border-b border-[var(--line)] py-2.5 last:border-b-0">
                      <span className="h-1 w-1 bg-[var(--accent)]" />
                      <span className="mono-label !text-[var(--fg-muted)]">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FAQ ==================== */}
      <FaqSection />

      {/* ==================== CTA ==================== */}
      <section className="relative z-10 px-5 mb-32 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="glass-panel-strong depth-glow relative overflow-hidden px-8 py-16 text-center sm:px-16 sm:py-20">
            <div className="grid-lines pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
            <div className="relative">
              <span className="mono-label mb-6 block">SYS.INIT / PAYROLL.BATCH</span>
              <h2 className="mb-5 text-3xl font-bold leading-tight tracking-[-0.02em] sm:text-4xl md:text-5xl">
                Ready to streamline your mass payments?
              </h2>
              <p className="mx-auto mb-10 max-w-lg text-base leading-relaxed text-[var(--fg-muted)]">
                Start moving USDC through VibeFlow. Get started in under five minutes.
              </p>
              <Link
                href={ROUTES.BULK_PAY}
                className="group inline-flex items-center gap-2.5 bg-[var(--accent)] px-10 py-4 text-base font-semibold text-[var(--bg)] transition-opacity duration-200 hover:opacity-85"
              >
                Start Paying in Batches
                <svg className="transition-transform duration-300 group-hover:translate-x-1" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9H15M15 9L10 4M15 9L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="relative z-10 border-t border-[var(--line)]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="mb-16 grid grid-cols-2 gap-10 md:grid-cols-5">
            <div className="col-span-2 md:col-span-1">
              <Link href={ROUTES.HOME} className="mb-5 inline-flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="VibeFlow" width={32} height={32} className="rounded-none" />
                <span className="text-lg font-semibold tracking-tight text-[var(--fg)]">VibeFlow</span>
              </Link>
              <p className="mb-6 max-w-xs text-sm leading-relaxed text-[var(--fg-faint)]">
                Programmable USDC payroll and batch payments for Web3 teams on Arc.
              </p>
              <div className="flex items-center gap-3">
                <a href="https://x.com/The_Last_Dip" target="_blank" rel="noopener noreferrer" aria-label="VibeFlow on X" className="btn-brutal flex h-9 w-9 items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg)]">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.15 1.5H10.15L6.25 6.35L2.85 1.5H0.5L5.1 7.85L0.5 13.5H2.5L6.6 8.4L10.15 13.5H12.5L7.75 6.9L12.15 1.5ZM11.1 12.4H10L2.95 2.55H4.1L11.1 12.4Z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="mono-label mb-4 !text-[var(--fg-muted)]">Product</h4>
              <ul className="space-y-3">
                <li><Link href={ROUTES.BULK_PAY} className="text-sm text-[var(--fg-faint)] transition-colors duration-200 hover:text-[var(--fg)]">Bulk Payments</Link></li>
                <li><Link href={ROUTES.DASHBOARD} className="text-sm text-[var(--fg-faint)] transition-colors duration-200 hover:text-[var(--fg)]">Dashboard</Link></li>
                <li><Link href={ROUTES.SOCIAL_PROFILE} className="text-sm text-[var(--fg-faint)] transition-colors duration-200 hover:text-[var(--fg)]">VibeID</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mono-label mb-4 !text-[var(--fg-muted)]">Built On</h4>
              <ul className="space-y-3">
                <li><a href="https://arc.network" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--fg-faint)] transition-colors duration-200 hover:text-[var(--fg)]">Arc Blockchain</a></li>
                <li><a href="https://circle.com" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--fg-faint)] transition-colors duration-200 hover:text-[var(--fg)]">Circle USDC</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mono-label mb-4 !text-[var(--fg-muted)]">Resources</h4>
              <ul className="space-y-3">
                <li><Link href="/architecture" className="text-sm text-[var(--fg-faint)] transition-colors duration-200 hover:text-[var(--fg)]">Architecture</Link></li>
                <li><Link href="/roadmap" className="text-sm text-[var(--fg-faint)] transition-colors duration-200 hover:text-[var(--fg)]">Roadmap</Link></li>
                <li><a href="https://github.com/theButcherARC/arcswap" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--fg-faint)] transition-colors duration-200 hover:text-[var(--fg)]">GitHub</a></li>
              </ul>
            </div>

            <div>
              <h4 className="mono-label mb-4 !text-[var(--fg-muted)]">Connect</h4>
              <ul className="space-y-3">
                <li><a href="https://x.com/The_Last_Dip" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--fg-faint)] transition-colors duration-200 hover:text-[var(--fg)]">Butcher (Haroon)</a></li>
              </ul>
            </div>
          </div>

          {/* Giant outlined wordmark */}
          <div className="pointer-events-none mb-10 select-none overflow-hidden" aria-hidden="true">
            <p
              className="text-center text-[19vw] font-bold leading-[0.8] tracking-[-0.02em] text-transparent md:text-[12.5rem]"
              style={{ WebkitTextStroke: "1px var(--line-strong)" }}
            >
              VIBEFLOW
            </p>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--line)] pt-8">
            <p className="mono-label">2026 VibeFlow. Built with Arc Studio by Butcher.</p>
            <div className="flex items-center gap-2">
              <span className="mono-label">Powered by</span>
              <span className="mono-label !text-[var(--fg-muted)]">Arc Studio</span>
              <span className="mono-label">+</span>
              <span className="mono-label !text-[var(--fg-muted)]">Arc</span>
              <span className="mono-label">+</span>
              <span className="mono-label !text-[var(--fg-muted)]">Circle USDC</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
