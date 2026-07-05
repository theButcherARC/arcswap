"use client";

const PARTNERS = [
  {
    name: "Vercel",
    role: "Deployment & Edge",
    dot: "#ffffff",
    border: "rgba(255,255,255,0.12)",
    bg: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
  },
  {
    name: "Gemini",
    role: "AI Intelligence",
    dot: "#60a5fa",
    border: "rgba(96,165,250,0.22)",
    bg: "linear-gradient(135deg, rgba(96,165,250,0.10) 0%, rgba(99,102,241,0.04) 100%)",
  },
  {
    name: "Circle",
    role: "USDC Stablecoin",
    dot: "#34d399",
    border: "rgba(52,211,153,0.22)",
    bg: "linear-gradient(135deg, rgba(52,211,153,0.10) 0%, rgba(20,184,166,0.04) 100%)",
  },
  {
    name: "Arc Network",
    role: "L1 Blockchain",
    dot: "#a78bfa",
    border: "rgba(167,139,250,0.22)",
    bg: "linear-gradient(135deg, rgba(167,139,250,0.10) 0%, rgba(139,92,246,0.04) 100%)",
  },
];

export default function PoweredBySection() {
  return (
    <>
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotPing {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50%       { transform: scale(2.2); opacity: 0; }
        }
        .powered-card {
          opacity: 0;
          animation: fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .powered-card:nth-child(1) { animation-delay: 0.05s; }
        .powered-card:nth-child(2) { animation-delay: 0.15s; }
        .powered-card:nth-child(3) { animation-delay: 0.25s; }
        .powered-card:nth-child(4) { animation-delay: 0.35s; }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 10s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        .dot-ping {
          animation: dotPing 2s ease-in-out infinite;
        }
      `}</style>

      <section className="relative z-10 mb-32 px-4">
        <div className="mx-auto max-w-5xl">

          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-5 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-[11px] font-semibold text-white/50 tracking-[0.18em] uppercase">
                Powered by
              </span>
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-center text-4xl md:text-5xl font-bold text-white tracking-tight text-balance mb-14">
            Built on the best{" "}
            <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              infrastructure in web3
            </span>
          </h2>

          {/* 4 Cards — fade up on mount */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {PARTNERS.map((p) => (
              <div
                key={p.name}
                className="powered-card rounded-2xl p-[1px] transition-transform duration-300 hover:scale-[1.04] hover:-translate-y-1"
                style={{
                  background: `linear-gradient(135deg, ${p.dot}33 0%, transparent 70%)`,
                }}
              >
                <div
                  className="rounded-2xl p-6 h-full flex flex-col gap-4"
                  style={{ background: p.bg, border: `1px solid ${p.border}` }}
                >
                  {/* Pulsing dot */}
                  <span className="relative flex h-2.5 w-2.5">
                    <span
                      className="dot-ping absolute inline-flex h-full w-full rounded-full"
                      style={{ backgroundColor: p.dot, opacity: 0.5 }}
                    />
                    <span
                      className="relative inline-flex h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: p.dot }}
                    />
                  </span>

                  {/* Name */}
                  <p className="text-xl font-bold text-white leading-tight">
                    {p.name}
                  </p>

                  {/* Role */}
                  <p className="text-[11px] font-semibold text-white/35 uppercase tracking-widest mt-auto">
                    {p.role}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Horizontal scrolling marquee of names — BELOW the cards */}
          <div className="relative overflow-hidden">
            {/* Left fade */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10"
              style={{ background: "linear-gradient(to right, #000 0%, transparent 100%)" }} />
            {/* Right fade */}
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10"
              style={{ background: "linear-gradient(to left, #000 0%, transparent 100%)" }} />

            <div className="marquee-track select-none">
              {[...Array(3)].map((_, i) =>
                PARTNERS.map((p) => (
                  <span
                    key={`${p.name}-${i}`}
                    className="inline-flex items-center gap-3 px-8 text-sm font-semibold text-white/25 tracking-widest uppercase whitespace-nowrap"
                  >
                    <span
                      className="inline-block h-1 w-1 rounded-full flex-shrink-0"
                      style={{ backgroundColor: p.dot, opacity: 0.6 }}
                    />
                    {p.name}
                  </span>
                ))
              )}
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
