'use client'

const phases = [
  {
    phase: 1,
    title: 'Foundation',
    status: 'LIVE NOW',
    statusColor: 'emerald',
    glow: 'emerald',
    items: [
      'Batch USDC payments on Arc Testnet',
      '100+ recipients in one transaction',
      'AI-powered natural language payment parsing',
      'Zero approval flow via Multicall3',
      'Real-time transaction dashboard',
    ],
  },
  {
    phase: 2,
    title: 'Expansion',
    status: 'COMING SOON',
    statusColor: 'yellow',
    glow: null,
    items: [
      'X/Twitter social payments via @handle',
      'Multi-chain expansion: Base Testnet',
    ],
  },
  {
    phase: 3,
    title: 'Scale',
    status: 'UPCOMING',
    statusColor: 'gray',
    glow: null,
    items: [
      'CSV upload - 1000+ recipients per batch',
      'Payroll templates - recurring automation',
    ],
  },
  {
    phase: 4,
    title: 'Mainnet + VIBE Token',
    status: 'UPCOMING',
    statusColor: 'gray',
    glow: null,
    items: [
      'Full Arc Mainnet deployment',
      'VIBE token generation event on Arc Mainnet',
      'Airdrop to early testnet users and VIBE holders',
      '0.2% protocol fee activation',
      'VIBE holders: 50% fee discount + CSV + payroll templates',
      'VIBE staking and governance voting',
    ],
  },
  {
    phase: 5,
    title: 'Enterprise',
    status: 'VISION',
    statusColor: 'violet',
    glow: 'violet',
    items: [
      '$50M+ monthly volume target',
      'Series A fundraise',
      'Fortune 500 partnerships',
      'Multi-region regulatory compliance',
      'VibeFlow SDK embedded in major Web3 protocols',
    ],
  },
]

const statusBadgeColors = {
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  gray: 'bg-white/5 text-white/60 border-white/10',
  violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
}

const glowShadows = {
  emerald: 'shadow-[0_0_30px_rgba(16,185,129,0.2)]',
  violet: 'shadow-[0_0_30px_rgba(124,58,237,0.2)]',
}

const getCardClassName = (phaseGlow: string | null) => {
  let base = 'rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 p-8 transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20'
  if (phaseGlow && phaseGlow in glowShadows) base += ' ' + glowShadows[phaseGlow as keyof typeof glowShadows]
  if (phaseGlow === 'emerald') base += ' border-emerald-500/30'
  if (phaseGlow === 'violet') base += ' border-violet-500/30'
  return base
}

export default function RoadmapPage() {
  return (
    <main className="min-h-screen bg-[#050508] overflow-hidden">
      {/* Header */}
      <div className="pt-32 pb-20 px-6 text-center">
        <div className="inline-block mb-6 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
          <p className="text-sm font-medium text-white/60">PRODUCT ROADMAP</p>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">VibeFlow</h1>
        <p className="text-lg text-white/40">Stripe for Web3 Teams on Arc</p>
      </div>

      {/* Timeline */}
      <div className="relative px-6 pb-32 max-w-4xl mx-auto">
        {/* Vertical connecting line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-600/0 via-violet-600/50 to-violet-600/0 transform -translate-x-1/2" />

        {/* Phases */}
        <div className="space-y-16">
          {phases.map((p) => (
            <div key={p.phase} className="relative">
              {/* Phase number badge */}
              <div className="absolute -left-24 top-0 flex items-center justify-center">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-violet-800 rounded-full" />
                  <div className="absolute inset-1 bg-[#050508] rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-violet-400">{p.phase}</span>
                  </div>
                </div>
              </div>

              {/* Dot on timeline */}
              <div className="absolute -left-3 top-8 w-1.5 h-1.5 bg-violet-500 rounded-full transform -translate-x-1/2" />

              {/* Card */}
              <div className={getCardClassName(p.glow)}>
                {/* Header with title and status */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{p.title}</h3>
                    <p className="text-white/40 text-sm">Phase {p.phase}</p>
                  </div>
                  <div className={'px-3 py-1 rounded-lg border text-xs font-semibold whitespace-nowrap ' + statusBadgeColors[p.statusColor as keyof typeof statusBadgeColors]}>
                    {p.status}
                  </div>
                </div>

                {/* Items list */}
                <ul className="space-y-3">
                  {p.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-violet-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-white/70 text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer text */}
      <div className="pb-20 px-6 text-center">
        <p className="text-sm text-white/40">Submitting to Stablecoins Commerce Stack Challenge - July 13, 2026</p>
      </div>
    </main>
  )
}
