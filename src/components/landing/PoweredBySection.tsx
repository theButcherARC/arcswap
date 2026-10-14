"use client";

const PARTNERS = [
  { name: "Vercel" },
  { name: "Groq AI" },
  { name: "Circle" },
  { name: "Arc Network" },
  { name: "USDC" },
  { name: "MetaMask" },
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

          {/* Heading */}
          <h2 className="text-center text-4xl md:text-5xl font-bold text-white tracking-tight text-balance mb-14">
            Built on the best{" "}
            <span className="text-white/60">infrastructure in web3</span>
          </h2>

          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 border border-white/[0.08] bg-white/[0.03] px-5 py-1.5">
              <span className="h-1.5 w-1.5 bg-white/60 animate-pulse" />
              <span className="text-[11px] font-semibold text-white/50 tracking-[0.18em] uppercase">
                Powered by
              </span>
            </div>
          </div>

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
                    className="inline-flex items-center gap-2 mx-2 border border-white/[0.12] bg-white/[0.04] px-4 py-2 whitespace-nowrap text-sm font-medium text-white/70"
                  >
                    <span className="inline-block h-1.5 w-1.5 flex-shrink-0 bg-white/50" />
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
