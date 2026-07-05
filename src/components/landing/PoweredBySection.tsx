"use client";

const PARTNERS = [
  {
    name: "Vercel",
    description: "Deployment & Edge",
    logo: (
      <img
        src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/vercel/light.svg"
        alt="Vercel logo"
        width={22}
        height={22}
        className="object-contain"
      />
    ),
  },
  {
    name: "Gemini",
    description: "AI Intelligence",
    logo: (
      <img
        src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/googlegemini/default.svg"
        alt="Gemini logo"
        width={22}
        height={22}
        className="object-contain"
      />
    ),
  },
  {
    name: "Circle",
    description: "USDC Stablecoin",
    logo: (
      <img
        src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/circle/default.svg"
        alt="Circle logo"
        width={22}
        height={22}
        className="object-contain"
      />
    ),
  },
  {
    name: "Arc Network",
    description: "L1 Blockchain",
    logo: (
      /* Arc "A" mark — inline since it's not in theSVG registry */
      <svg width="22" height="22" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Arc Network logo">
        <path d="M50 6L94 90H6L50 6Z" stroke="white" strokeWidth="9" strokeLinejoin="round" fill="none" />
        <path d="M32 74L50 38L68 74" stroke="white" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    ),
  },
];

/* Duplicate enough times for a seamless loop */
const TRACK = [...PARTNERS, ...PARTNERS, ...PARTNERS, ...PARTNERS];

function PartnerPill({ partner }: { partner: (typeof PARTNERS)[0] }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-white/[0.1] bg-white/[0.04] backdrop-blur-xl px-5 py-3 mx-4 shrink-0 select-none">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.08]">
        {partner.logo}
      </div>
      <div>
        <p className="text-sm font-semibold text-white leading-tight">{partner.name}</p>
        <p className="text-[11px] text-white/35">{partner.description}</p>
      </div>
    </div>
  );
}

export default function PoweredBySection() {
  return (
    <section className="relative z-10 mb-32 overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[200px] bg-violet-600/[0.06] rounded-full blur-[120px]" />

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

      {/* Marquee track — full bleed, edge fades */}
      <div className="relative">
        {/* Left fade */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-[#050508] to-transparent" />
        {/* Right fade */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-[#050508] to-transparent" />

        {/* Row 1 — scrolls left */}
        <div className="flex w-max animate-marquee-left mb-4">
          {TRACK.map((p, i) => (
            <PartnerPill key={i} partner={p} />
          ))}
        </div>

        {/* Row 2 — scrolls right (opposite, slight offset) */}
        <div className="flex w-max animate-marquee-right">
          {[...TRACK].reverse().map((p, i) => (
            <PartnerPill key={i} partner={p} />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marqueeLeft {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeRight {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee-left {
          animation: marqueeLeft 24s linear infinite;
        }
        .animate-marquee-right {
          animation: marqueeRight 28s linear infinite;
        }
      `}</style>
    </section>
  );
}
