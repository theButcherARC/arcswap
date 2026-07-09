"use client";

const PARTNERS = [
  { name: "Vercel",      dot: "#ffffff",  border: "rgba(255,255,255,0.12)", pillBg: "rgba(255,255,255,0.04)" },
  { name: "Groq",        dot: "#f97316",  border: "rgba(249,115,22,0.22)",  pillBg: "rgba(249,115,22,0.06)"  },
  { name: "Circle",      dot: "#34d399",  border: "rgba(52,211,153,0.22)",  pillBg: "rgba(52,211,153,0.06)"  },
  { name: "Arc Network", dot: "#a78bfa",  border: "rgba(167,139,250,0.22)", pillBg: "rgba(167,139,250,0.06)" },
  { name: "Next.js",     dot: "#ffffff",  border: "rgba(255,255,255,0.10)", pillBg: "rgba(255,255,255,0.03)" },
  { name: "USDC",        dot: "#34d399",  border: "rgba(52,211,153,0.18)",  pillBg: "rgba(52,211,153,0.05)"  },
  { name: "EURC",        dot: "#60a5fa",  border: "rgba(96,165,250,0.18)",  pillBg: "rgba(96,165,250,0.05)"  },
  { name: "Wagmi",       dot: "#818cf8",  border: "rgba(129,140,248,0.18)", pillBg: "rgba(129,140,248,0.05)" },
];

export default function PoweredBySection() {
  return (
    <>
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 18s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
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

          {/* Scrolling pill marquee */}
          <div className="relative overflow-hidden">
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-20 z-10"
              style={{ background: "linear-gradient(to right, #050508 0%, transparent 100%)" }}
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-20 z-10"
              style={{ background: "linear-gradient(to left, #050508 0%, transparent 100%)" }}
            />

            <div className="marquee-track select-none py-2">
              {[...Array(3)].map((_, i) =>
                PARTNERS.map((p) => (
                  <span
                    key={`${p.name}-${i}`}
                    className="inline-flex items-center gap-2 mx-2 rounded-full px-4 py-2 whitespace-nowrap text-sm font-medium text-white/70"
                    style={{
                      border: `1px solid ${p.border}`,
                      backgroundColor: p.pillBg,
                    }}
                  >
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: p.dot }}
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
