'use client';

const phases = [
  {
    phase: 1,
    title: 'Foundation',
    status: 'LIVE NOW',
    live: true,
    items: [
      'Batch USDC/EURC payments on Arc Mainnet',
      'AI-powered natural language payment parsing (Groq)',
      'Zero approval flow via Multicall3From',
      'Onchain Memo labels for payroll batching',
      'Real-time transaction dashboard',
      'Unique VibeID + Social Pay via @handle, VibeID, or wallet address',
    ],
  },
  {
    phase: 2,
    title: 'Expansion',
    status: 'COMING SOON',
    live: false,
    items: [
      'Discord + Telegram social payments',
      'CSV upload - 1000+ recipients per batch',
      'Payroll templates - recurring automation',
      'ERC-8183 Job escrow for milestone payments',
    ],
  },
  {
    phase: 3,
    title: 'Funding & Grant',
    status: 'UPCOMING',
    live: false,
    items: [
      'Arc Ecosystem Grant application',
      'Seed funding round for scaling infrastructure',
      'Gateway Unified Balance: aggregate USDC from any chain, pay on Arc',
      'Strategic partnerships with Web3 payroll platforms',
      'Community growth + VIBE token waitlist',
    ],
  },
  {
    phase: 4,
    title: 'Mainnet + VIBE Token',
    status: 'UPCOMING',
    live: false,
    items: [
      'Full Arc Mainnet deployment',
      'VIBE token generation event on Arc Mainnet',
      'Airdrop to early testnet users',
      '0.2% protocol fee activation',
      'VIBE holders: 50% fee discount + CSV + payroll templates',
      'VIBE staking and governance voting',
    ],
  },
  {
    phase: 5,
    title: 'Multi-chain & AI',
    status: 'UPCOMING',
    live: false,
    items: [
      'CCTP Bridging: send USDC from Ethereum/Base/Solana directly to Arc',
      'Multi-chain expansion: Base Testnet',
      'AI Voice Assistant for payment commands',
      'Compliance integration: Elliptic + TRM Labs',
    ],
  },
  {
    phase: 6,
    title: 'Fiat & Mobile',
    status: 'VISION',
    live: false,
    items: [
      'Fiat on/off ramp integration (bank transfers)',
      'VibeFlow Debit/ATM card for USDC spending',
      'iOS + Android mobile app',
      'Mobile push notifications for payments received',
    ],
  },
  {
    phase: 7,
    title: 'Enterprise',
    status: 'VISION',
    live: false,
    items: [
      '$50M+ monthly volume target',
      'Series A fundraise',
      'Fortune 500 partnerships',
      'Multi-region regulatory compliance',
      'White-label SDK for Web3 protocols',
      'VibeFlow API for enterprise integrations',
    ],
  },
];

export default function RoadmapPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--bg)] px-5 pb-32 pt-10 sm:px-8">
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />

      <div className="relative mx-auto max-w-4xl">
        {/* Header */}
        <header className="animate-fade-in-up mb-10">
          <div className="rule-tick pt-4">
            <div className="flex items-baseline justify-between">
              <h1 className="text-balance max-w-3xl text-3xl font-bold tracking-[-0.03em] text-[var(--fg)] sm:text-4xl">
                VibeFlow Roadmap.
              </h1>
              <span className="mono-label hidden md:inline">SYS.ROADMAP / 07 PHASES</span>
            </div>
          </div>
          <p className="mt-4 text-lg text-[var(--fg-muted)]">Stripe for Web3 Teams on Arc</p>
        </header>

        {/* Phases */}
        <div className="space-y-px border border-[var(--line)] bg-[var(--line)]">
          {phases.map((phase) => (
            <div key={phase.phase} className="group relative bg-[var(--bg-raised)] p-6 transition-colors duration-300 hover:bg-[#101018] sm:p-8">
              <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-baseline gap-5">
                  <span className="font-mono text-2xl font-bold text-[var(--fg-faint)]">{String(phase.phase).padStart(2, '0')}</span>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-[var(--fg)] sm:text-2xl">{phase.title}</h3>
                    <p className="mono-label mt-1">Phase {phase.phase}</p>
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2 border border-[var(--line-strong)] px-3 py-1.5">
                  {phase.live && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />}
                  <span className={`mono-label ${phase.live ? '!text-emerald-400' : ''}`}>{phase.status}</span>
                </div>
              </div>

              <ul className="grid gap-x-10 gap-y-0 border-t border-[var(--line)] md:grid-cols-2">
                {phase.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 border-b border-[var(--line)] py-3">
                    <span className="mt-1.5 h-1 w-1 flex-shrink-0 bg-[var(--accent)]" />
                    <span className="text-sm leading-relaxed text-[var(--fg-muted)]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 border-t border-[var(--line)] pt-8 text-center">
          <p className="text-sm text-[var(--fg-muted)]">
            Investor-facing roadmap. Follow our progress on{' '}
            <a
              href="https://github.com/theButcherARC/arcswap"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--data)] transition-colors duration-200 underline"
            >
              GitHub
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
