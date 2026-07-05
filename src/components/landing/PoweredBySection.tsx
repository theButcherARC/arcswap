"use client";

import { useEffect, useRef } from "react";

const PARTNERS = [
  {
    name: "Vercel",
    role: "Deployment & Edge",
    gradient: "from-white/10 to-white/5",
    border: "border-white/[0.15]",
    dot: "bg-white",
    glow: "bg-white/20",
    delay: "0ms",
  },
  {
    name: "Gemini",
    role: "AI Intelligence",
    gradient: "from-blue-500/15 to-indigo-500/5",
    border: "border-blue-400/25",
    dot: "bg-blue-400",
    glow: "bg-blue-400/30",
    delay: "120ms",
  },
  {
    name: "Circle",
    role: "USDC Stablecoin",
    gradient: "from-cyan-500/15 to-teal-500/5",
    border: "border-cyan-400/25",
    dot: "bg-cyan-400",
    glow: "bg-cyan-400/30",
    delay: "240ms",
  },
  {
    name: "Arc Network",
    role: "L1 Blockchain",
    gradient: "from-violet-500/15 to-purple-500/5",
    border: "border-violet-400/25",
    dot: "bg-violet-400",
    glow: "bg-violet-400/30",
    delay: "360ms",
  },
];

export default function PoweredBySection() {
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = cardsRef.current?.querySelectorAll<HTMLElement>("[data-card]");
    if (!cards) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.animationPlayState = "running";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes borderPulse {
          0%, 100% { box-shadow: 0 0 0 0 transparent; }
          50%       { box-shadow: 0 0 18px 2px var(--card-glow); }
        }
        [data-card] {
          opacity: 0;
          animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both paused;
        }
        [data-card]:hover {
          animation: borderPulse 1.6s ease-in-out infinite;
          opacity: 1;
        }
      `}</style>

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
          <div ref={cardsRef} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PARTNERS.map((p) => (
              <div
                key={p.name}
                data-card
                style={{
                  animationDelay: p.delay,
                  // @ts-expect-error css custom property
                  "--card-glow": p.glow.replace("bg-", ""),
                }}
                className={`relative rounded-2xl border ${p.border} bg-gradient-to-br ${p.gradient} backdrop-blur-xl p-6 flex flex-col gap-3 overflow-hidden cursor-default transition-transform duration-300 hover:scale-[1.04] hover:-translate-y-1`}
              >
                {/* Animated glow blob top-right */}
                <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl opacity-0 ${p.glow} transition-opacity duration-500 group-hover:opacity-100`} />

                {/* Pulsing dot */}
                <span className="relative flex h-2 w-2">
                  <span className={`absolute inline-flex h-full w-full rounded-full ${p.dot} opacity-60 animate-ping`} style={{ animationDuration: "2s" }} />
                  <span className={`relative inline-flex h-2 w-2 rounded-full ${p.dot}`} />
                </span>

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
    </>
  );
}
