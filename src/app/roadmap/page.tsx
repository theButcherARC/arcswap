'use client';

const phases = [
  {
    phase: 1,
    title: 'Foundation',
    status: 'LIVE NOW',
    statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    borderColor: 'border-emerald-500/30',
    glowColor: 'shadow-[0_0_30px_rgba(16,185,129,0.2)]',
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
    statusColor: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    borderColor: 'border-yellow-500/20',
    glowColor: 'shadow-[0_0_20px_rgba(234,179,8,0.1)]',
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
    statusColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    borderColor: 'border-blue-500/20',
    glowColor: 'shadow-[0_0_20px_rgba(59,130,246,0.1)]',
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
    statusColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    borderColor: 'border-purple-500/20',
    glowColor: 'shadow-[0_0_20px_rgba(168,85,247,0.1)]',
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
    statusColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    borderColor: 'border-orange-500/20',
    glowColor: 'shadow-[0_0_20px_rgba(249,115,22,0.1)]',
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
    statusColor: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    borderColor: 'border-gray-500/20',
    glowColor: '',
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
    statusColor: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    borderColor: 'border-gray-500/20',
    glowColor: '',
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
    <main className="relative min-h-screen bg-[#050508] overflow-hidden px-4 pb-32 pt-28 sm:px-6 lg:px-8">
      {/* Ambient background */}
      <div className="pointer-events-none absolute top-0 left-1/4 h-[400px] w-[500px] rounded-full bg-violet-600/[0.05] blur-[130px]" />
      <div className="pointer-events-none absolute bottom-1/3 right-1/4 h-[350px] w-[400px] rounded-full bg-indigo-600/[0.04] blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <header className="animate-fade-in-up mb-20 text-center">
          <div className="mb-6 inline-block rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 backdrop-blur-xl">
            <p className="text-sm font-medium text-white/60 tracking-wide uppercase">Product Roadmap</p>
          </div>
          <h1 className="text-balance bg-gradient-to-r from-violet-400 via-[#7c3aed] to-violet-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
            VibeFlow Roadmap
          </h1>
          <p className="mt-4 text-lg text-white/40">Stripe for Web3 Teams on Arc</p>
        </header>

        {/* Timeline Container */}
        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute left-0 top-0 bottom-0 ml-3 w-px bg-gradient-to-b from-violet-600/0 via-violet-600/30 to-violet-600/0 sm:ml-20" />

          {/* Phases */}
          <div className="space-y-12">
            {phases.map((phase, index) => (
              <div key={phase.phase} className={`animate-fade-in-up delay-${Math.min(index * 100, 300)} relative pl-8 sm:pl-40`}>
                {/* Phase number badge - visible on sm and up */}
                <div className="hidden sm:block absolute -left-20 top-0">
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-600 to-violet-800" />
                    <div className="absolute inset-1 flex items-center justify-center rounded-full bg-[#050508]">
                      <span className="text-lg font-bold text-violet-400">{phase.phase}</span>
                    </div>
                  </div>
                </div>

                {/* Mobile phase number badge */}
                <div className="sm:hidden absolute -left-2 top-1">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600">
                    <span className="text-xs font-bold text-white">{phase.phase}</span>
                  </div>
                </div>

                {/* Timeline dot */}
                <div className={`absolute -left-1.5 top-8 h-1.5 w-1.5 transform rounded-full bg-violet-500 sm:-left-8`} />

                {/* Card */}
                <div className={`group rounded-2xl border backdrop-blur-2xl transition-all duration-300 hover:border-opacity-100 ${phase.borderColor} bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:bg-white/[0.08] sm:p-8 ${phase.glowColor}`}>
                  {/* Header with title and status badge */}
                  <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{phase.title}</h3>
                      <p className="mt-1 text-sm text-white/40">Phase {phase.phase}</p>
                    </div>
                    <div className={`flex-shrink-0 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold ${phase.statusColor}`}>
                      {phase.status}
                    </div>
                  </div>

                  {/* Features list */}
                  <ul className="space-y-3">
                    {phase.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-500" />
                        <span className="text-sm leading-relaxed text-white/70">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-24 border-t border-white/10 pt-12 text-center">
          <p className="text-sm text-white/40">
            Investor-facing roadmap. Follow our progress on{' '}
            <a
              href="https://github.com/theButcherARC/arcswap"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white/80 transition-colors duration-200 underline"
            >
              GitHub
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
