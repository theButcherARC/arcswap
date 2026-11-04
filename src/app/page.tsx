import Link from "next/link";
import dynamic from "next/dynamic";
import { ROUTES } from "@/constants/routes";

const PoweredBySection = dynamic(() => import("@/components/landing/PoweredBySection"), {
  ssr: false,
});
import FaqSection from "@/components/landing/FaqSection";
import { LiveStats } from "@/components/landing/LiveStats";
import Reveal from "@/components/landing/Reveal";
import { HeroScroll } from "@/components/landing/HeroScroll";
import HeroCoin from "@/components/landing/HeroCoin";
import { TokenCoin } from "@/components/TokenCoin";
import { JoinWithXButton } from "@/components/auth/JoinWithXButton";

const FEATURES = [
  {
    fig: "FIG 01",
    sys: "SYS.AGENT",
    title: "Agentic Payments",
    body: "Describe a payment in plain words and the agent builds it: recipients, amounts, token, ready to review. Later, hire agents inside the hub and let them pay within limits you set.",
    tag: "Live now",
    accent: "accent" as const,
  },
  {
    fig: "FIG 02",
    sys: "SYS.BATCH",
    title: "Bulk Pay",
    body: "Up to 100 recipients in one transaction, one signature, zero token approvals. The batch is simulated first, so a failing payment stops everything and names the address.",
    tag: "Live now",
    accent: "data" as const,
  },
  {
    fig: "FIG 03",
    sys: "SYS.SCHEDULE",
    title: "Scheduled Payments",
    body: "Save a batch with a date and it waits on your dashboard. When payday comes you review and sign. Non-custodial: nothing moves until you sign.",
    tag: "Live now",
    accent: "accent" as const,
  },
  {
    fig: "FIG 04",
    sys: "SYS.VIBRAIN",
    title: "Vibrain",
    body: "Arc, live. Latest blocks, USDC transfers and the largest moves on the chain, read straight from mainnet and refreshed every few seconds. No wallet needed.",
    tag: "Live now",
    accent: "data" as const,
  },
  {
    fig: "FIG 05",
    sys: "SYS.SQUARE",
    title: "VibeSquare",
    body: "The community feed where money is attached: tip any post in USDC in one tap, straight to its author, and post a pay request the whole Square can settle on the spot.",
    tag: "Live now",
    accent: "accent" as const,
  },
  {
    fig: "FIG 06",
    sys: "SYS.EARN",
    title: "Earn",
    body: "Bounties and creator gigs paid in USDC. Budgets sit in escrow you can verify on the explorer, and approval pays out instantly, not in seven days.",
    tag: "Coming soon",
    accent: "data" as const,
  },
];

const STEPS = [
  {
    fig: "STEP 01",
    title: "Connect",
    body: "Connect any EVM wallet, or pay people by their VibeID handle instead of a raw address.",
    points: ["Any EVM wallet", "Auto network switch", "Pay by @handle or VibeID"],
  },
  {
    fig: "STEP 02",
    title: "Add recipients",
    body: "Type it in plain words for the agent, add rows by hand, or upload a CSV. Up to 100 people per batch.",
    points: ["Natural language input", "Percentage splits", "Up to 100 recipients per batch"],
  },
  {
    fig: "STEP 03",
    title: "Review and send",
    body: "See every recipient, the total and the fee in one clean summary. The batch is simulated before your wallet opens, then one signature settles everything.",
    points: ["Review before you sign", "Simulated onchain first", "Sub-second settlement"],
  },
];

const CHIPS = [
  "0.2% flat fee · $0.01 min",
  "No code required",
  "Zero approval needed",
  "AI-powered parsing",
  "Sub-second finality",
];

export default function VibeFlowLanding() {
  return (
    <div className="relative min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      {/* ==================== HERO ==================== */}
      <section className="relative overflow-hidden px-5 pb-24 pt-28 sm:px-8 lg:pt-36">
        <div className="relative mx-auto w-full max-w-6xl">
          <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-6">
          <div className="text-center lg:text-left">
          <div className="animate-fade-in-up inline-flex items-center gap-2.5 rounded-full border border-[var(--accent)]/40 bg-[var(--accent-soft)] py-2 pl-3.5 pr-4">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            </span>
            <span className="mono-label !text-[var(--accent)]">VibeFlow · The Arc Hub · Live on mainnet</span>
          </div>

          <h1 className="mx-auto mt-8 max-w-4xl text-6xl font-bold leading-[0.98] tracking-[-0.03em] sm:text-7xl lg:mx-0 xl:text-8xl">
            <span className="hi-line"><span style={{ animationDelay: "100ms" }}>The people</span></span>
            <span className="hi-line"><span style={{ animationDelay: "220ms" }}>layer of <span className="text-[var(--accent)]">Arc.</span></span></span>
          </h1>

          <p className="animate-fade-in-up delay-300 mx-auto mt-7 max-w-xl text-base leading-relaxed text-[var(--fg-muted)] sm:text-lg lg:mx-0">
            Pay your whole team in one signature, get paid from anywhere, and watch it all move live. Stablecoin payments for everyone, everywhere.
          </p>

          <div className="animate-fade-in-up delay-300 mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:items-start lg:justify-start">
            <Link
              href={ROUTES.BULK_PAY}
              className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-[var(--fg)] px-8 py-4 text-base font-semibold text-[var(--bg)] transition-opacity duration-200 hover:opacity-85"
            >
              Launch App
              <svg className="transition-transform duration-300 group-hover:translate-x-0.5" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9H15M15 9L10 4M15 9L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <JoinWithXButton variant="hero" />
            <Link
              href={ROUTES.VIBRAIN}
              className="inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full px-6 py-4 text-base font-medium text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
            >
              Watch Arc Live
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          <div className="animate-fade-in-up delay-500 mt-9 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
            {CHIPS.map((label) => (
              <span key={label} className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3.5 py-2">
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--accent)]">
                  <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="mono-label !text-[var(--fg-muted)]">{label}</span>
              </span>
            ))}
          </div>
          </div>

          {/* 3D stage: one big glass coin, slow spin and float */}
          <div className="hi-big relative mx-auto h-[320px] w-full max-w-[440px] sm:h-[380px] lg:h-[500px] lg:max-w-none" style={{ animationDelay: "450ms" }}>
            <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(39,117,202,0.20), rgba(39,117,202,0.05) 55%, transparent 72%)" }} />
            <div aria-hidden="true" className="absolute bottom-[6%] left-1/2 h-7 w-[56%] -translate-x-1/2 rounded-[100%] bg-[#0b0d16]/15 blur-xl" />
            <div className="absolute left-1/2 top-1/2 w-[74%] max-w-[400px] -translate-x-1/2 -translate-y-1/2 lg:left-auto lg:right-[-4%] lg:translate-x-0">
              <div className="floaty">
                <HeroCoin thickness={18} duration={17} />
              </div>
            </div>
            <div className="floaty-b absolute left-[1%] top-[4%] w-[19%] max-w-[84px]" style={{ animationDelay: "0.9s" }}>
              <HeroCoin thickness={9} duration={23} />
            </div>
            <div aria-hidden="true" className="floaty-b absolute right-[10%] top-[7%] h-3 w-3 rounded-full bg-[var(--accent)]" style={{ animationDelay: "0.4s" }} />
          </div>
          </div>

          {/* Hero visual: the batch, as a document on a desk */}
          <HeroScroll className="relative mx-auto mt-20 max-w-3xl text-left">
            <div className="hi-big" style={{ animationDelay: "700ms" }}>
            <div aria-hidden="true" className="absolute inset-0 -rotate-2 rounded-lg border border-[var(--line)] bg-white" />
            <div aria-hidden="true" className="absolute inset-0 rotate-[1.2deg] rounded-lg border border-[var(--line)] bg-white" />

            <div className="glass-live relative rounded-lg">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4 sm:px-8">
                <span className="mono-label">SYS.BATCH / JULY PAYROLL</span>
                <span className="mono-label border border-[var(--line)] px-2.5 py-1 !text-[var(--accent)]">1 signature</span>
              </div>
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
                    <span className="flex items-center gap-2 text-sm font-semibold text-[var(--fg)]">
                      <TokenCoin symbol="USDC" size={20} />
                      {amt}
                      <span className="font-normal text-[var(--fg-faint)]">USDC</span>
                    </span>
                  </div>
                ))}
                <div className="py-3.5">
                  <span className="mono-label !text-[var(--fg-faint)]">+ 21 more recipients</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 border-t border-[var(--line)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <div className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--data)]" />
                  <span className="mono-label !text-[var(--fg-muted)]">Simulated OK · All or nothing · Settles in under 1s</span>
                </div>
                <div className="flex items-baseline gap-5">
                  <span className="mono-label">Fee $16.00 (0.2%)</span>
                  <span className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-[var(--fg)]">
                    <TokenCoin symbol="USDC" size={26} />
                    $8,000.00 <span className="text-sm font-normal text-[var(--fg-faint)]">USDC</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Floating widgets */}
            <div className="absolute -left-8 top-14 z-20 hidden lg:block" style={{ transform: "translateX(calc(var(--hp, 0) * -38px))" }}><div className="floaty-b flex h-24 w-24 flex-col items-center justify-center rounded-full bg-[var(--accent)] text-white">
              <span className="text-xl font-extrabold leading-none">0.2%</span>
              <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/75">flat fee</span>
            </div>
            </div>
            <div className="absolute -top-6 right-4 z-20 hidden md:block" style={{ transform: "translateX(calc(var(--hp, 0) * 38px))" }}><div className="floaty flex items-center gap-3 border border-[var(--line)] bg-[var(--glass-strong)] px-4 py-3 backdrop-blur-xl">
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
            </div>
            <div className="absolute -bottom-6 left-4 z-20 hidden md:block" style={{ transform: "translateX(calc(var(--hp, 0) * -30px))" }}><div className="floaty-b flex items-center gap-3 border border-[var(--line)] bg-[var(--glass-strong)] px-4 py-3 backdrop-blur-xl">
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
            </div>
            </div>
          </HeroScroll>

          <p className="mono-label mt-12 text-center !text-[var(--fg-faint)]">Illustration of a VibeFlow batch</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--data)]" />
            <span className="mono-label !text-[var(--fg-muted)]">Live proof: a real batch settled on Arc mainnet</span>
            <a
              href="https://explorer.arc.io/tx/0x2998eb1bab0bcdaf673f8f1e2558817faa6eba0dfc4f5cea4095648f444d9439"
              target="_blank"
              rel="noreferrer"
              className="mono-label !text-[var(--accent)] underline underline-offset-4"
            >
              TX 0x2998...d9439
            </a>
          </div>
        </div>
      </section>

      {/* ==================== LIVE STATS ==================== */}
      <LiveStats />

      {/* ==================== THE PROBLEM ==================== */}
      <section className="relative px-5 py-28 sm:px-8" aria-label="The problem">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mono-label !text-[var(--accent)]">THE PROBLEM</span>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.02em] sm:text-4xl md:text-5xl">
              Getting paid from abroad is broken.
            </h2>
          </div>
          <Reveal className="rv-group mt-14 grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)] md:grid-cols-3">
            {[
              ["The usual apps are not here", "PayPal does not operate in Pakistan. The world's freelancers get paid through workarounds, not products built for them."],
              ["4 to 5% quietly disappears", "Fees and exchange rates take a cut at every hop on the common routes home. On a $1,000 payment, that is days of work, gone."],
              ["Days of waiting, and freezes", "Payouts crawl for days through custodial accounts that can hold a balance without warning. Your money, someone else's permission."],
            ].map(([title, body]) => (
              <div key={title} className="rv-item bg-white/60 p-8">
                <h3 className="mb-3 text-xl font-semibold tracking-tight">{title}</h3>
                <p className="text-sm leading-relaxed text-[var(--fg-muted)]">{body}</p>
              </div>
            ))}
          </Reveal>
          <p className="mx-auto mt-12 max-w-2xl text-center text-lg font-medium leading-relaxed">
            VibeFlow runs on Arc instead: a dollar sent is a dollar received, settled in under a second, wallet to wallet. <span className="text-[var(--fg-muted)]">Nobody in the middle can freeze it.</span>
          </p>
        </div>
      </section>

      {/* ==================== FEATURE ROWS ==================== */}
      <section className="relative px-5 py-10 sm:px-8" aria-label="Core features">
        <div className="mx-auto max-w-6xl space-y-28">
          {/* Bulk Pay */}
          <Reveal className="rv-group grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="rv-item">
              <span className="mono-label !text-[var(--accent)]">SYS.BATCH · BULK PAY</span>
              <h3 className="mt-4 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">Pay the whole team in one signature.</h3>
              <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--fg-muted)]">
                Add up to 100 recipients by hand, by CSV, or by describing the payment to the agent. The batch is simulated before your wallet opens: if one address would fail, nothing moves and you see exactly which one.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
                <span className="mono-label !text-[var(--fg-muted)]">Live on mainnet, proven by a real batch</span>
                <a href="https://explorer.arc.io/tx/0x2998eb1bab0bcdaf673f8f1e2558817faa6eba0dfc4f5cea4095648f444d9439" target="_blank" rel="noreferrer" className="mono-label !text-[var(--accent)] underline underline-offset-4">View tx</a>
              </div>
            </div>
            <div className="rv-item relative">
              <div aria-hidden="true" className="absolute inset-0 rotate-[1.5deg] rounded-lg border border-[var(--line)] bg-white" />
              <div className="glass-live relative rounded-lg">
                <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4">
                  <span className="mono-label">SYS.BATCH / TEAM PAYOUT</span>
                  <span className="mono-label !text-[var(--accent)]">100 max</span>
                </div>
                <div className="divide-y divide-[var(--line)] px-6">
                  {[
                    ["Alice", "$2,500.00"],
                    ["Bob", "$1,800.00"],
                    ["Sarah", "$2,200.00"],
                  ].map(([name, amt]) => (
                    <div key={name} className="flex items-center justify-between py-3.5">
                      <span className="text-sm font-medium">{name}</span>
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        <TokenCoin symbol="USDC" size={18} />
                        {amt} <span className="font-normal text-[var(--fg-faint)]">USDC</span>
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-[var(--line)] px-6 py-4">
                  <span className="mono-label !text-[var(--fg-muted)]">Simulated OK</span>
                  <span className="text-sm font-bold">1 signature</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Vibrain */}
          <Reveal className="rv-group grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="rv-item lg:order-2">
              <span className="mono-label !text-[var(--accent)]">SYS.VIBRAIN · LIVE CHAIN DATA</span>
              <h3 className="mt-4 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">Watch Arc move, live.</h3>
              <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--fg-muted)]">
                Latest blocks, USDC transfers and the largest moves on the chain, read straight from mainnet. Plus the USDC freeze watch: every frozen address, on the record.
              </p>
              <Link href={ROUTES.VIBRAIN} className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
                Open Vibrain
                <svg className="transition-transform duration-300 group-hover:translate-x-0.5" width="15" height="15" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9H15M15 9L10 4M15 9L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
            <div className="rv-item relative lg:order-1">
              <div aria-hidden="true" className="absolute inset-0 -rotate-[1.5deg] rounded-lg border border-[var(--line)] bg-white" />
              <div className="glass-live relative rounded-lg">
                <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4">
                  <span className="mono-label">SYS.VIBRAIN / ARC MAINNET</span>
                  <span className="flex items-center gap-2">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--success)] opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
                    </span>
                    <span className="mono-label !text-[var(--success)]">Live</span>
                  </span>
                </div>
                <div className="divide-y divide-[var(--line)] px-6">
                  {[
                    ["Latest blocks", "Streaming"],
                    ["USDC transfers", "Live"],
                    ["Largest moves", "Tracked"],
                    ["USDC freeze watch", "On record"],
                  ].map(([label, state]) => (
                    <div key={label} className="flex items-center justify-between py-3.5">
                      <span className="text-sm font-medium">{label}</span>
                      <span className="mono-label !text-[var(--fg-muted)]">{state}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[var(--line)] px-6 py-4">
                  <span className="mono-label !text-[var(--fg-muted)]">Read from mainnet, no wallet needed</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* VibeSquare */}
          <Reveal className="rv-group grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="rv-item">
              <span className="mono-label !text-[var(--accent)]">SYS.SQUARE · COMMUNITY</span>
              <h3 className="mt-4 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">A feed where money is attached.</h3>
              <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--fg-muted)]">
                VibeSquare is the community layer of the hub. Tip any post in USDC in one tap, straight to its author, or post a pay request and let the Square settle it on the spot.
              </p>
              <Link href={ROUTES.SQUARE} className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
                Open VibeSquare
                <svg className="transition-transform duration-300 group-hover:translate-x-0.5" width="15" height="15" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9H15M15 9L10 4M15 9L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
            <div className="rv-item relative">
              <div aria-hidden="true" className="absolute inset-0 rotate-[1.5deg] rounded-lg border border-[var(--line)] bg-white" />
              <div className="glass-live relative rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] font-mono text-sm font-bold text-white">N</span>
                  <div>
                    <p className="text-sm font-semibold">noob</p>
                    <p className="font-mono text-[11px] text-[var(--fg-faint)]">VibeID · VIBE-XEGGDV</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed">
                  Shipped: payroll for the whole team, one signature, settled on Arc. This is how paying people should feel.
                </p>
                <div className="mt-5 flex flex-wrap gap-2.5 border-t border-[var(--line)] pt-4">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white">Tip USDC</span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--fg-muted)]">Pay request</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ==================== FEATURES GRID ==================== */}
      <section id="features" className="relative px-5 py-28 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="mono-label !text-[var(--accent)]">SYS.FEATURES / 06</span>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.02em] sm:text-4xl md:text-5xl">
              One hub. Every way money moves.
            </h2>
          </div>
          <Reveal className="rv-group grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)] md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.fig} className="rv-item group relative bg-white/60 p-8 transition-colors duration-300 hover:bg-[var(--glass-strong)]">
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
          </Reveal>
        </div>
      </section>

      {/* ==================== POWERED BY ==================== */}
      <PoweredBySection />

      {/* ==================== HOW IT WORKS ==================== */}
      <section id="how-it-works" className="relative px-5 py-28 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span className="mono-label !text-[var(--accent)]">SYS.FLOW / 03</span>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.02em] sm:text-4xl md:text-5xl">
              Three steps. One signature.
            </h2>
          </div>
          <Reveal className="rv-group grid gap-12 md:grid-cols-3 md:gap-10">
            {STEPS.map((s, i) => (
              <div key={s.fig} className="rv-item">
                <p className="font-mono text-6xl font-extrabold tracking-tight text-[var(--fg)]/10">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[var(--fg-muted)]">{s.body}</p>
                <div className="mt-5 space-y-2">
                  {s.points.map((p) => (
                    <p key={p} className="flex items-center gap-2.5">
                      <span className="h-1 w-1 shrink-0 bg-[var(--accent)]" />
                      <span className="mono-label !text-[var(--fg-muted)]">{p}</span>
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="relative px-5 pb-28 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden bg-[var(--fg)] px-8 py-16 text-center text-white sm:px-16 sm:py-20">
            <div className="relative">
              <span className="mono-label mb-6 block !text-white/60">SYS.INIT / VIBEFLOW.HUB</span>
              <h2 className="mx-auto mb-5 max-w-2xl text-3xl font-bold leading-tight tracking-[-0.02em] sm:text-4xl md:text-5xl">
                The people layer of Arc is open.
              </h2>
              <p className="mx-auto mb-10 max-w-lg text-base leading-relaxed text-white/70">
                Pay your whole team in one signature, get paid from anywhere, and watch it all move live.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href={ROUTES.BULK_PAY}
                  className="group inline-flex items-center gap-2.5 rounded-full bg-white px-10 py-4 text-base font-semibold text-[var(--fg)] transition-opacity duration-200 hover:opacity-90"
                >
                  Launch App
                  <svg className="transition-transform duration-300 group-hover:translate-x-1" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9H15M15 9L10 4M15 9L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link
                  href={ROUTES.ROADMAP}
                  className="inline-flex items-center gap-2.5 rounded-full border border-white/30 px-8 py-4 text-base font-medium text-white transition-colors hover:border-white"
                >
                  See the roadmap
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FAQ ==================== */}
      <FaqSection />

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
                The people layer of Arc: payments, community and live chain data in one hub.
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
                <li><Link href={ROUTES.ROADMAP} className="text-sm text-[var(--fg-faint)] transition-colors duration-200 hover:text-[var(--fg)]">Roadmap</Link></li>
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

          {/* On-chain proof: contract addresses */}
          <div className="mt-8 flex flex-col gap-4 border-t border-[var(--line)] pt-6">
            <div className="flex flex-col gap-1.5">
              <span className="mono-label">Contracts on Arc Mainnet</span>
              <span className="text-xs text-[var(--fg-faint)]">
                Public and verifiable on the explorer. Independent audit: not yet.
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href="https://explorer.arc.io/address/0x522fAf9A91c41c443c66765030741e4AaCe147D0"
                target="_blank"
                rel="noopener noreferrer"
                className="break-all font-mono text-[11px] text-[var(--fg-faint)] transition-colors hover:text-[var(--data)]"
              >
                Batch 0x522fAf9A91c41c443c66765030741e4AaCe147D0
              </a>
              <a
                href="https://explorer.arc.io/address/0x5294E9927c3306DcBaDb03fe70b92e01cCede505"
                target="_blank"
                rel="noopener noreferrer"
                className="break-all font-mono text-[11px] text-[var(--fg-faint)] transition-colors hover:text-[var(--data)]"
              >
                Memo 0x5294E9927c3306DcBaDb03fe70b92e01cCede505
              </a>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
