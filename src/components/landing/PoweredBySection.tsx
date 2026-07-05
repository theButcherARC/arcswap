"use client";

const NAMES = ["Vercel", "Gemini", "Circle", "Arc Network"];

/* Duplicate 6× for a seamless infinite loop */
const TRACK = [...NAMES, ...NAMES, ...NAMES, ...NAMES, ...NAMES, ...NAMES];

export default function PoweredBySection() {
  return (
    <section className="relative z-10 mb-32 overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-4">
        {/* Heading */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl px-6 py-2 mb-6">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-400" />
            </span>
            <span className="text-xs font-semibold text-white/50 tracking-widest uppercase">
              Powered by
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight text-balance">
            Built on the best{" "}
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              infrastructure in web3
            </span>
          </h2>
        </div>
      </div>

      {/* Single-row marquee — full bleed */}
      <div className="relative">
        {/* Left fade */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-[#050508] to-transparent" />
        {/* Right fade */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-[#050508] to-transparent" />

        <div className="flex w-max items-center marquee-left">
          {TRACK.map((name, i) => (
            <span key={i} className="inline-flex items-center gap-4 mx-8 shrink-0 select-none">
              <span className="text-xl font-semibold text-white/80 tracking-tight whitespace-nowrap">
                {name}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20 shrink-0" />
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marqueeLeft {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-left {
          animation: marqueeLeft 30s linear infinite;
        }
      `}</style>
    </section>
  );
}
