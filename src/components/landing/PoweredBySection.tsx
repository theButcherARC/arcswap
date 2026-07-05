"use client";

const PARTNERS = [
  {
    name: "Vercel",
    role: "Deployment & Edge",
    accent: "from-white/10 to-white/5",
    border: "border-white/[0.12]",
    dot: "bg-white/60",
  },
  {
    name: "Gemini",
    role: "AI Intelligence",
    accent: "from-blue-500/10 to-indigo-500/5",
    border: "border-blue-500/20",
    dot: "bg-blue-400",
  },
  {
    name: "Circle",
    role: "USDC Stablecoin",
    accent: "from-cyan-500/10 to-teal-500/5",
    border: "border-cyan-500/20",
    dot: "bg-cyan-400",
  },
  {
    name: "Arc Network",
    role: "L1 Blockchain",
    accent: "from-violet-500/10 to-purple-500/5",
    border: "border-violet-500/20",
    dot: "bg-violet-400",
  },
];

export default function PoweredBySection() {
  return (
    <section className="relative z-10 mb-32 px-4">
      <div className="mx-auto max-w-5xl">

        {/* Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl px-5 py-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-400" />
            </span>
            <span className="text-[11px] font-semibold text-white/50 tracking-widest uppercase">
              Powered by
            </span>
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight text-balance mb-4">
          Built on the best{" "}
          <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            infrastructure in web3
          </span>
        </h2>

        {/* Name row */}
        <p className="text-center text-sm text-white/30 tracking-widest uppercase mb-12">
          Vercel&nbsp;&nbsp;·&nbsp;&nbsp;Gemini&nbsp;&nbsp;·&nbsp;&nbsp;Circle&nbsp;&nbsp;·&nbsp;&nbsp;Arc Network
        </p>

        {/* 4 Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PARTNERS.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl border ${p.border} bg-gradient-to-br ${p.accent} backdrop-blur-xl p-6 flex flex-col gap-3 overflow-hidden group transition-all duration-300 hover:scale-[1.03] hover:shadow-lg`}
            >
              {/* Subtle glow blob */}
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 bg-white/10 group-hover:opacity-40 transition-opacity duration-300" />

              {/* Dot indicator */}
              <span className={`w-2 h-2 rounded-full ${p.dot} shrink-0`} />

              {/* Name */}
              <p className="text-lg font-bold text-white leading-tight tracking-tight">
                {p.name}
              </p>

              {/* Role */}
              <p className="text-xs text-white/40 font-medium uppercase tracking-wider">
                {p.role}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
