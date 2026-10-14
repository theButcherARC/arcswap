import Link from "next/link";
import dynamic from "next/dynamic";
import { ROUTES } from "@/constants/routes";

const HeroCanvas = dynamic(() => import("@/components/landing/HeroCanvas"), {
  ssr: false,
});
const PoweredBySection = dynamic(() => import("@/components/landing/PoweredBySection"), {
  ssr: false,
});

export default function VibeFlowLanding() {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ backgroundColor: "#050508" }}>

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-24 pb-20">
        <HeroCanvas />

        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-violet-600/[0.07] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/[0.05] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/[0.04] rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="animate-fade-in-up inline-flex items-center gap-2.5 rounded-full border border-white/[0.1] bg-white/[0.04] backdrop-blur-xl px-5 py-2 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            <span className="text-xs font-medium text-white/70 tracking-wide uppercase">
              Powered by Arc Blockchain
            </span>
          </div>

          <h1 className="animate-fade-in-up delay-100 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.05] mb-6">
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x">
              Batch USDC Payments.
            </span>
            <br />
            <span className="text-white">
              Instantly. Effortlessly.
            </span>
          </h1>

          <p className="animate-fade-in-up delay-200 mx-auto max-w-2xl text-base sm:text-lg md:text-xl text-white/50 leading-relaxed mb-10 font-light">
            Send USDC or EURC to your entire team in one transaction. AI-powered, zero approval, settled in under a second on Arc.
          </p>

          <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href={ROUTES.BULK_PAY}
              className="group relative inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-violet-600/25 transition-all duration-300 hover:shadow-violet-600/40 hover:scale-[1.03] active:scale-[0.97]"
            >
              <span className="relative z-10">Launch App</span>
              <svg className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9H15M15 9L10 4M15 9L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
            <Link
              href={ROUTES.DASHBOARD}
              className="inline-flex items-center gap-2.5 rounded-2xl border border-white/[0.12] bg-white/[0.03] backdrop-blur-xl px-8 py-4 text-base font-medium text-white/80 transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.2] hover:text-white hover:scale-[1.02] active:scale-[0.97]"
            >
              View Dashboard
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          <div className="animate-fade-in-up delay-500 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-white/30">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 1L8.5 5.5L13 7L8.5 8.5L7 13L5.5 8.5L1 7L5.5 5.5L7 1Z" fill="currentColor"/>
              </svg>
              <span>No code required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 1L8.5 5.5L13 7L8.5 8.5L7 13L5.5 8.5L1 7L5.5 5.5L7 1Z" fill="currentColor"/>
              </svg>
              <span>Zero approval needed</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 1L8.5 5.5L13 7L8.5 8.5L7 13L5.5 8.5L1 7L5.5 5.5L7 1Z" fill="currentColor"/>
              </svg>
              <span>AI-powered parsing</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 1L8.5 5.5L13 7L8.5 8.5L7 13L5.5 8.5L1 7L5.5 5.5L7 1Z" fill="currentColor"/>
              </svg>
              <span>Sub-second finality</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050508] to-transparent pointer-events-none z-10" />
      </section>

      {/* ==================== STATS SECTION ==================== */}
      <section className="relative z-10 px-4 -mt-8 mb-24">
        <div className="mx-auto max-w-5xl">
          <div className="animate-fade-in-up delay-200 rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl p-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden bg-white/[0.05]">
              <div className="flex flex-col items-center justify-center bg-[#0a0a10] px-6 py-8 sm:py-10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-400 to-violet-300 bg-clip-text text-transparent">$50M+</span>
                  <span className="inline-flex items-center rounded-full border border-violet-500/25 bg-violet-500/[0.08] px-2 py-0.5 text-[9px] font-semibold text-violet-400 uppercase tracking-wider">Vision</span>
                </div>
                <span className="text-xs sm:text-sm text-white/40 font-medium tracking-wide">Volume Vision</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-[#0a0a10] px-6 py-8 sm:py-10">
                <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-300 bg-clip-text text-transparent mb-1">10K+</span>
                <span className="text-xs sm:text-sm text-white/40 font-medium tracking-wide">Transactions</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-[#0a0a10] px-6 py-8 sm:py-10">
                <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent mb-1">{"<1s"}</span>
                <span className="text-xs sm:text-sm text-white/40 font-medium tracking-wide">Arc Finality</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-[#0a0a10] px-6 py-8 sm:py-10">
                <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent mb-1">100+</span>
                <span className="text-xs sm:text-sm text-white/40 font-medium tracking-wide">Recipients Per Tx</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FEATURES SECTION ==================== */}
      <section id="features" className="relative z-10 px-4 mb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/[0.04] rounded-full blur-[120px] pointer-events-none" />
        <div className="relative mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/[0.06] px-4 py-1.5 mb-6">
              <span className="text-xs font-semibold text-violet-400 tracking-wider uppercase">Core Features</span>
            </div>
            <h2 className="animate-fade-in-up delay-100 text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-5">
              Everything you need to
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">move money at scale</span>
            </h2>
            <p className="animate-fade-in-up delay-200 mx-auto max-w-xl text-base text-white/40 leading-relaxed">
              VibeFlow abstracts the complexity of blockchain batch payments into a simple, reliable interface your team will love.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <div className="animate-fade-in-up delay-100 group relative rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] hover:border-violet-500/20 hover:bg-white/[0.05]">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-violet-600/[0.06] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/[0.08]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6H20M4 12H14M4 18H18" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M20 15L17 18L20 21" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">AI Payment Agent</h3>
                <p className="text-sm text-white/40 leading-relaxed mb-6">
                  Describe payments in plain English. VibeAI parses your intent instantly - recipients, amounts, tokens - all auto-filled in seconds.
                </p>
                <div className="flex items-center gap-3 pt-6 border-t border-white/[0.06]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                    <span className="text-xs font-bold text-violet-400">AI</span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-white/60">VibeAI</span>
                    <span className="text-xs text-white/30 ml-1">powered</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-fade-in-up delay-200 group relative rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] hover:border-indigo-500/20 hover:bg-white/[0.05]">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-indigo-600/[0.06] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.08]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">Zero Approval Flow</h3>
                <p className="text-sm text-white/40 leading-relaxed mb-6">
                  Multicall3From preserves msg.sender throughout the batch. No ERC20 approve step needed - your USDC moves in one click.
                </p>
                <div className="flex items-center gap-3 pt-6 border-t border-white/[0.06]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
                    <span className="text-xs font-bold text-indigo-400">0</span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-white/60">Approvals</span>
                    <span className="text-xs text-white/30 ml-1">needed</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-fade-in-up delay-300 group relative rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] hover:border-cyan-500/20 hover:bg-white/[0.05]">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-cyan-600/[0.06] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.08]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">VIBE Token Perks</h3>
                <p className="text-sm text-white/40 leading-relaxed mb-6">
                  CSV upload, payroll templates, and 50% fee discount for VIBE holders. Power users save more with every batch.
                </p>
                <div className="flex items-center gap-3 pt-6 border-t border-white/[0.06]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10">
                    <span className="text-xs font-bold text-cyan-400">50%</span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-white/60">Fee discount</span>
                    <span className="text-xs text-white/30 ml-1">for holders</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* USDC + EURC */}
            <div className="animate-fade-in-up delay-100 group relative rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] hover:border-emerald-500/20 hover:bg-white/[0.05]">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-emerald-600/[0.06] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.08]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="9" cy="12" r="6" stroke="#10b981" strokeWidth="2"/>
                    <circle cx="15" cy="12" r="6" stroke="#10b981" strokeWidth="2" strokeDasharray="4 2"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">USDC + EURC</h3>
                <p className="text-sm text-white/40 leading-relaxed mb-6">
                  Pay in US dollars or Euros. Switch stablecoins with one click. Both Circle-issued, both on Arc.
                </p>
                <div className="flex items-center gap-3 pt-6 border-t border-white/[0.06]">
                  <div className="flex h-8 items-center justify-center rounded-lg bg-emerald-500/10 px-2.5">
                    <span className="text-xs font-bold text-emerald-400">2 Stablecoins</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Onchain Memo Labels */}
            <div className="animate-fade-in-up delay-200 group relative rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] hover:border-amber-500/20 hover:bg-white/[0.05]">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-amber-600/[0.06] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/[0.08]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 2v6h6M8 13h8M8 17h5" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">Onchain Memo Labels</h3>
                <p className="text-sm text-white/40 leading-relaxed mb-6">
                  Tag every payroll batch with a label stored permanently onchain. July Salary. Q3 Bonus. Contractor Batch.
                </p>
                <div className="flex items-center gap-3 pt-6 border-t border-white/[0.06]">
                  <div className="flex h-8 items-center justify-center rounded-lg bg-amber-500/10 px-2.5">
                    <span className="text-xs font-bold text-amber-400">Memo Contract</span>
                  </div>
                </div>
              </div>
            </div>

            {/* VibeID */}
            <div className="animate-fade-in-up delay-300 group relative rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] hover:border-fuchsia-500/20 hover:bg-white/[0.05]">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-fuchsia-600/[0.06] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/[0.08]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" fill="#d946ef"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">Unique VibeID</h3>
                <p className="text-sm text-white/40 leading-relaxed mb-6">
                  Get a permanent, unique identifier like VIBE-XXXXX. Pay anyone by their X handle, wallet address, or VibeID.
                </p>
                <div className="flex items-center gap-3 pt-6 border-t border-white/[0.06]">
                  <div className="flex h-8 items-center justify-center rounded-lg bg-fuchsia-500/10 px-2.5">
                    <span className="text-xs font-bold text-fuchsia-400">@handle or VIBE-ID</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ==================== POWERED BY ==================== */}
      <PoweredBySection />

      {/* ==================== HOW IT WORKS ==================== */}
      <section id="how-it-works" className="relative z-10 px-4 mb-32">
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-indigo-600/[0.04] rounded-full blur-[120px] pointer-events-none" />
        <div className="relative mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/[0.06] px-4 py-1.5 mb-6">
              <span className="text-xs font-semibold text-indigo-400 tracking-wider uppercase">How It Works</span>
            </div>
            <h2 className="animate-fade-in-up delay-100 text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-5">
              Three steps to
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">mass payment clarity</span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3 relative">
            <div className="hidden md:block absolute top-16 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-gradient-to-r from-violet-500/20 via-indigo-500/20 to-cyan-500/20" />

            <div className="animate-fade-in-up delay-100 relative">
              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl p-8 transition-all duration-300 hover:border-white/[0.12] h-full">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-violet-700 text-white font-bold text-lg shadow-lg shadow-violet-600/20">1</div>
                  <div className="h-px flex-1 bg-gradient-to-r from-violet-500/20 to-transparent" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">Connect Wallet</h3>
                <p className="text-sm text-white/40 leading-relaxed mb-5">Link MetaMask with USDC on Arc. NetworkGuard auto-switches to Arc Mainnet.</p>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-1 w-1 rounded-full bg-violet-400" />
                    <span className="text-xs text-white/35">MetaMask supported</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="h-1 w-1 rounded-full bg-violet-400" />
                    <span className="text-xs text-white/35">Auto network switch</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="h-1 w-1 rounded-full bg-violet-400" />
                    <span className="text-xs text-white/35">Live balance display</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-fade-in-up delay-200 relative">
              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl p-8 transition-all duration-300 hover:border-white/[0.12] h-full">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white font-bold text-lg shadow-lg shadow-indigo-600/20">2</div>
                  <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/20 to-transparent" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">Describe Payment</h3>
                <p className="text-sm text-white/40 leading-relaxed mb-5">Use AI or manual entry to define recipients and amounts. AI auto-fills the entire form.</p>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-1 w-1 rounded-full bg-indigo-400" />
                    <span className="text-xs text-white/35">Natural language input</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="h-1 w-1 rounded-full bg-indigo-400" />
                    <span className="text-xs text-white/35">Percentage splits</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="h-1 w-1 rounded-full bg-indigo-400" />
                    <span className="text-xs text-white/35">Up to 10 recipients (free)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-fade-in-up delay-300 relative">
              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl p-8 transition-all duration-300 hover:border-white/[0.12] h-full">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-600 to-cyan-700 text-white font-bold text-lg shadow-lg shadow-cyan-600/20">3</div>
                  <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/20 to-transparent" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">One Click Send</h3>
                <p className="text-sm text-white/40 leading-relaxed mb-5">Sign once in MetaMask. Every payment settles on-chain instantly via Multicall3From.</p>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-1 w-1 rounded-full bg-cyan-400" />
                    <span className="text-xs text-white/35">Single MetaMask popup</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="h-1 w-1 rounded-full bg-cyan-400" />
                    <span className="text-xs text-white/35">ArcScan tx link</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="h-1 w-1 rounded-full bg-cyan-400" />
                    <span className="text-xs text-white/35">Sub-second settlement</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CTA BANNER ==================== */}
      <section className="relative z-10 px-4 mb-32">
        <div className="mx-auto max-w-4xl">
          <div className="animate-fade-in-up relative rounded-[2rem] overflow-hidden">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-violet-600/40 via-indigo-600/40 to-cyan-600/40 p-px">
              <div className="w-full h-full rounded-[2rem] bg-[#050508]" />
            </div>
            <div className="relative rounded-[2rem] border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl px-8 py-16 sm:px-16 sm:py-20 text-center overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-violet-600/[0.1] rounded-full blur-[100px] pointer-events-none" />
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-5 leading-tight">
                  Ready to streamline your
                  <br />
                  <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">mass payments?</span>
                </h2>
                <p className="mx-auto max-w-lg text-base text-white/40 leading-relaxed mb-10">
                  Join the teams already moving USDC through VibeFlow. Get started in under five minutes.
                </p>
                <Link
                  href={ROUTES.BULK_PAY}
                  className="group inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 px-10 py-4 text-base font-semibold text-white shadow-2xl shadow-violet-600/30 transition-all duration-300 hover:shadow-violet-600/50 hover:scale-[1.03] active:scale-[0.97]"
                >
                  <span>Start Paying in Batches</span>
                  <svg className="transition-transform duration-300 group-hover:translate-x-1" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9H15M15 9L10 4M15 9L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="relative z-10 border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
            <div className="col-span-2 md:col-span-1">
              <Link href={ROUTES.HOME} className="inline-flex items-center gap-2.5 mb-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="VibeFlow" width={32} height={32} className="rounded-lg shadow-md shadow-violet-500/20" />
                <span className="text-lg font-semibold text-white tracking-tight">VibeFlow</span>
              </Link>
              <p className="text-sm text-white/30 leading-relaxed max-w-xs mb-6">
                Programmable USDC payroll and batch payments for Web3 teams on Arc.
              </p>
              <div className="flex items-center gap-3">
                <a href="https://x.com/The_Last_Dip" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/40 transition-all duration-200 hover:text-white hover:border-white/[0.15] hover:bg-white/[0.06]">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.15 1.5H10.15L6.25 6.35L2.85 1.5H0.5L5.1 7.85L0.5 13.5H2.5L6.6 8.4L10.15 13.5H12.5L7.75 6.9L12.15 1.5ZM11.1 12.4H10L2.95 2.55H4.1L11.1 12.4Z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white/60 tracking-wider uppercase mb-4">Product</h4>
              <ul className="space-y-3">
                <li><Link href={ROUTES.BULK_PAY} className="text-sm text-white/30 hover:text-white/70 transition-colors duration-200">Bulk Payments</Link></li>
                <li><Link href={ROUTES.DASHBOARD} className="text-sm text-white/30 hover:text-white/70 transition-colors duration-200">Dashboard</Link></li>
                <li><Link href={ROUTES.SOCIAL_PROFILE} className="text-sm text-white/30 hover:text-white/70 transition-colors duration-200">Social Pay</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white/60 tracking-wider uppercase mb-4">Built On</h4>
              <ul className="space-y-3">
                <li><a href="https://arc.network" target="_blank" rel="noopener noreferrer" className="text-sm text-white/30 hover:text-white/70 transition-colors duration-200">Arc Blockchain</a></li>
                <li><a href="https://circle.com" target="_blank" rel="noopener noreferrer" className="text-sm text-white/30 hover:text-white/70 transition-colors duration-200">Circle USDC</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white/60 tracking-wider uppercase mb-4">Resources</h4>
              <ul className="space-y-3">
                <li><Link href="/architecture" className="text-sm text-white/30 hover:text-white/70 transition-colors duration-200">Architecture</Link></li>
                <li><Link href="/roadmap" className="text-sm text-white/30 hover:text-white/70 transition-colors duration-200">Roadmap</Link></li>
                <li><a href="https://github.com/theButcherARC/arcswap" target="_blank" rel="noopener noreferrer" className="text-sm text-white/30 hover:text-white/70 transition-colors duration-200">GitHub</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white/60 tracking-wider uppercase mb-4">Connect</h4>
              <ul className="space-y-3">
                <li><a href="https://x.com/The_Last_Dip" target="_blank" rel="noopener noreferrer" className="text-sm text-white/30 hover:text-white/70 transition-colors duration-200">Butcher (Haroon)</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/20">2026 VibeFlow. Built on Arc by Butcher.</p>
            <div className="flex items-center gap-2 text-xs text-white/20">
              <span>Powered by</span>
              <span className="font-medium text-white/40">Arc</span>
              <span>+</span>
              <span className="font-medium text-white/40">Circle USDC</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
