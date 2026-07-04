export default function RoadmapPage() {
  const phases = [
    {
      phase: 0,
      title: 'Brand + Landing',
      date: 'July 1',
      status: 'COMPLETE',
      statusColor: 'bg-green-500/20 text-green-400 border-green-500/30',
      items: [
        'Design system with glassmorphism dark theme',
        'Landing page with hero, features, and stats',
        'Header with wallet connection',
        'Roadmap page with timeline view'
      ]
    },
    {
      phase: 1,
      title: 'AI Payment Agent',
      date: 'July 2-3',
      status: 'IN PROGRESS',
      statusColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      items: [
        'Gemini API integration for natural language parsing',
        'Parse recipient addresses, amounts, and tokens from text',
        'Real-time validation and error feedback',
        'Conversation memory for multi-turn interactions'
      ]
    },
    {
      phase: 2,
      title: 'Dashboard + History',
      date: 'July 4-5',
      status: 'UPCOMING',
      statusColor: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      items: [
        'Payment history table with filters',
        'Transaction status tracking via ArcScan',
        'Total volume and fee statistics',
        'Recipient address book'
      ]
    },
    {
      phase: 3,
      title: 'Templates + CSV',
      date: 'July 6-7',
      status: 'UPCOMING',
      statusColor: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      items: [
        'Save payment templates for recurring batches',
        'CSV file upload with validation',
        'Template editing and duplication',
        'Import from previous transactions'
      ]
    },
    {
      phase: 4,
      title: 'VIBE Token + Fee Model',
      date: 'July 8',
      status: 'UPCOMING',
      statusColor: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      items: [
        'VIBE token contract deployment on Arc',
        '50% fee discount for VIBE holders',
        'Token balance checking and UI integration',
        'Fee calculation display before submission'
      ]
    },
    {
      phase: 5,
      title: 'Polish + Submit',
      date: 'July 9-10',
      status: 'UPCOMING',
      statusColor: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      items: [
        'Mobile responsiveness optimization',
        'Error handling and edge cases',
        'Performance optimization',
        'Final testing and challenge submission'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">VibeFlow Roadmap</span>
          </h1>
          <p className="text-gray-400 text-lg">
            July 1-13, 2026 - Stablecoins Commerce Stack Challenge
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {phases.map((phase, index) => (
            <div key={phase.phase} className="relative pb-12 last:pb-0">
              {/* Timeline line */}
              {index < phases.length - 1 && (
                <div className="absolute left-6 top-16 bottom-0 w-px bg-white/10" />
              )}
              
              {/* Phase Card */}
              <div className="flex gap-6">
                {/* Phase Number Circle */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-lg shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                  {phase.phase}
                </div>
                
                {/* Card Content */}
                <div className="flex-1 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl p-6 hover:shadow-[0_0_30px_rgba(124,58,237,0.2)] transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{phase.title}</h3>
                      <p className="text-gray-400 text-sm mt-1">{phase.date}</p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${phase.statusColor}`}>
                      {phase.status}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {phase.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2 text-gray-400 text-sm">
                        <span className="text-violet-400 mt-0.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-4">
            <span className="text-gray-400">Submitting to Stablecoins Commerce Stack Challenge -</span>
            <span className="text-white font-semibold">July 13, 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}