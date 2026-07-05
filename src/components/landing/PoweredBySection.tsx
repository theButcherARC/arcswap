"use client";

import Image from "next/image";

const PARTNERS = [
  {
    name: "Vercel",
    description: "Deployment & Edge",
    logo: (
      <img
        src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/vercel/light.svg"
        alt="Vercel"
        width={28}
        height={28}
        className="object-contain"
      />
    ),
    color: "from-white/[0.08] to-white/[0.03]",
    border: "border-white/[0.1]",
    textColor: "text-white",
  },
  {
    name: "Gemini",
    description: "AI Intelligence",
    logo: (
      <img
        src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/googlegemini/default.svg"
        alt="Gemini"
        width={28}
        height={28}
        className="object-contain"
      />
    ),
    color: "from-blue-500/[0.08] to-transparent",
    border: "border-blue-500/[0.15]",
    textColor: "text-blue-200",
  },
  {
    name: "Circle",
    description: "USDC Stablecoin",
    logo: (
      <img
        src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/circle/default.svg"
        alt="Circle"
        width={28}
        height={28}
        className="object-contain"
      />
    ),
    color: "from-teal-500/[0.08] to-transparent",
    border: "border-teal-500/[0.15]",
    textColor: "text-teal-200",
  },
  {
    name: "Arc Network",
    description: "L1 Blockchain",
    logo: (
      <svg width="28" height="28" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M60 8L108 98H12L60 8Z"
          stroke="white"
          strokeWidth="10"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M38 78L60 36L82 78"
          stroke="white"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
    color: "from-violet-500/[0.08] to-transparent",
    border: "border-violet-500/[0.15]",
    textColor: "text-violet-200",
  },
];

function PartnerCard({ partner }: { partner: typeof PARTNERS[0] }) {
  return (
    <div
      className={`
        relative flex items-center gap-4 rounded-2xl border px-5 py-4 my-3
        bg-gradient-to-br ${partner.color} ${partner.border}
        backdrop-blur-xl transition-all duration-300
        hover:scale-[1.03] hover:shadow-lg
        w-[220px] shrink-0 select-none
      `}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.08]">
        {partner.logo}
      </div>
      <div>
        <p className={`text-sm font-semibold ${partner.textColor} leading-tight`}>
          {partner.name}
        </p>
        <p className="text-xs text-white/35 mt-0.5">{partner.description}</p>
      </div>
    </div>
  );
}

export default function PoweredBySection() {
  // We duplicate the list so the seamless loop works
  const col1 = [...PARTNERS, ...PARTNERS, ...PARTNERS];
  const col2 = [...PARTNERS.slice().reverse(), ...PARTNERS.slice().reverse(), ...PARTNERS.slice().reverse()];

  return (
    <section className="relative z-10 px-4 mb-32 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-violet-600/[0.05] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl">
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
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
            Built on the best
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              infrastructure in web3
            </span>
          </h2>
        </div>

        {/* Animated columns */}
        <div className="flex items-center justify-center gap-6 h-[380px]">
          {/* Left edge fade */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#050508] to-transparent z-10 pointer-events-none" />
          {/* Right edge fade */}
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050508] to-transparent z-10 pointer-events-none" />
          {/* Top fade */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#050508] to-transparent z-10 pointer-events-none" />
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#050508] to-transparent z-10 pointer-events-none" />

          {/* Column 1 — scrolls up */}
          <div className="flex flex-col animate-scroll-up">
            {col1.map((p, i) => (
              <PartnerCard key={i} partner={p} />
            ))}
          </div>

          {/* Divider line */}
          <div className="hidden sm:block w-px h-64 bg-gradient-to-b from-transparent via-white/[0.08] to-transparent shrink-0" />

          {/* Column 2 — scrolls down */}
          <div className="flex flex-col animate-scroll-down">
            {col2.map((p, i) => (
              <PartnerCard key={i} partner={p} />
            ))}
          </div>
        </div>

        {/* Bottom badge strip */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
          {PARTNERS.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-2.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-2 backdrop-blur-xl"
            >
              <div className="h-4 w-4 shrink-0 flex items-center justify-center">
                {p.logo}
              </div>
              <span className="text-xs font-medium text-white/50">{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-33.33%); }
        }
        @keyframes scrollDown {
          0% { transform: translateY(-33.33%); }
          100% { transform: translateY(0); }
        }
        .animate-scroll-up {
          animation: scrollUp 12s linear infinite;
        }
        .animate-scroll-down {
          animation: scrollDown 12s linear infinite;
        }
      `}</style>
    </section>
  );
}
