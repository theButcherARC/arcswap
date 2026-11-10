"use client";

import { useEffect, useRef } from "react";

type Item = {
  phase: string;
  color: string;
  title: string;
  body: string;
};

const ITEMS: Item[] = [
  { phase: "Next", color: "var(--phase-1)", title: "BatchPay on mainnet", body: "The batch contract built in Arc Studio, tested for 1,000 recipients, goes live on Arc mainnet and the app moves onto it." },
  { phase: "Next", color: "var(--phase-1)", title: "VibeID Registry on mainnet", body: "The identity registry built in Arc Studio, already live on testnet, deploys to mainnet." },
  { phase: "The wallet era", color: "var(--accent)", title: "VibeWallet", body: "A wallet inside the app, created the moment you join with X. No seed phrase to lose, gas handled for you." },
  { phase: "The wallet era", color: "var(--accent)", title: "Pay-in pages and invoice links", body: "Send anyone a link and get paid, whether they hold crypto or not. Built for freelancers first." },
  { phase: "The wallet era", color: "var(--accent)", title: "Earn escrow, live", body: "Bounties with the budget locked in escrow you can verify on the explorer. Approval pays out instantly in USDC." },
  { phase: "Automation", color: "var(--phase-3)", title: "Scheduled payments, automated", body: "Set a payment once with limits and an expiry you control. It executes on its own, and you can revoke it any time." },
  { phase: "Automation", color: "var(--phase-3)", title: "Agent rails", body: "Hire agents inside the hub and let them pay within limits you set. Agentic payments, with your rules." },
  { phase: "Money in and out", color: "var(--phase-4)", title: "CCTP", body: "Native USDC bridging into and out of Arc. Money arrives as USDC, not a wrapped copy." },
  { phase: "Money in and out", color: "var(--phase-4)", title: "Swap", body: "A quiet swap inside your balance: USDC, EURC and cirBTC. No trading screen, no noise." },
  { phase: "Growth", color: "var(--phase-1)", title: "Embeds", body: "VibeSquare tips and pay requests that any site or community can embed." },
  { phase: "Growth", color: "var(--phase-1)", title: "Creator gigs", body: "Campaigns on Earn with apply-first curation: approved creators, escrowed budgets, instant settlement." },
  { phase: "Later", color: "var(--accent)", title: "Mobile app", body: "VibeFlow in your pocket: Android and iOS, with your batches, schedules and balance wherever you are." },
  { phase: "Growth", color: "var(--phase-1)", title: "$VIBE fee discount", body: "Holding $VIBE cuts the batch fee. The token serves the product, not the other way around." },
  { phase: "Later", color: "var(--accent)", title: "Fiat last mile", body: "Bank and card payouts through licensed partners, once volume justifies it. Receiving stays instant on Arc." },
  { phase: "Last", color: "var(--fg-faint)", title: "Prediction markets", body: "Last on this list, and only after a full legal review." },
];

const H = 3970;
const Y0 = 90;
const STEP = 250;
const stopY = (i: number) => Y0 + i * STEP;
const stopX = (i: number) => (i % 2 === 0 ? 320 : 680);

const ROAD_D = (() => {
  let d = `M ${stopX(0)} ${stopY(0)}`;
  for (let i = 1; i < ITEMS.length; i++) {
    d += ` C ${stopX(i - 1)} ${stopY(i - 1) + STEP / 2}, ${stopX(i)} ${stopY(i) - STEP / 2}, ${stopX(i)} ${stopY(i)}`;
  }
  const lx = stopX(ITEMS.length - 1);
  const ly = stopY(ITEMS.length - 1);
  d += ` C ${lx} ${ly + 125}, 500 ${ly + 95}, 500 3810`;
  return d;
})();

export default function RoadJourney() {
  const deskRef = useRef<HTMLDivElement>(null);
  const mobRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<SVGRectElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const updateBox = (box: HTMLElement | null, apply: (p: number) => void) => {
      if (!box) return;
      const rect = box.getBoundingClientRect();
      const line = window.innerHeight * 0.62;
      const p = Math.min(1, Math.max(0, (line - rect.top) / rect.height));
      const prog = reduced ? 1 : p;
      apply(prog);
      box.querySelectorAll<HTMLElement>("[data-stop]").forEach((el) => {
        const frac = Number(el.dataset.stop || "0");
        if (prog >= frac - 0.012) el.classList.add("on");
      });
    };

    let ticking = false;
    const update = () => {
      ticking = false;
      updateBox(deskRef.current, (p) => {
        clipRef.current?.setAttribute("height", String(p * H));
      });
      updateBox(mobRef.current, (p) => {
        if (fillRef.current) fillRef.current.style.height = `${p * 100}%`;
      });
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const titleColor = (item: Item) =>
    item.title === "Prediction markets" ? "var(--fg-muted)" : item.color;

  return (
    <div>
      {/* Desktop: winding road */}
      <div
        ref={deskRef}
        className="relative mx-auto hidden w-full max-w-5xl md:block"
        style={{ aspectRatio: `1000 / ${H}` }}
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 1000 ${H}`}
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <clipPath id="roadClip">
              <rect ref={clipRef} x="0" y="0" width="1000" height="0" />
            </clipPath>
          </defs>
          <path d={ROAD_D} stroke="var(--fg)" strokeOpacity="0.13" strokeWidth="46" strokeLinecap="round" />
          <g clipPath="url(#roadClip)">
            <path d={ROAD_D} stroke="var(--fg)" strokeWidth="46" strokeLinecap="round" />
            <path
              d={ROAD_D}
              stroke="#ffffff"
              strokeWidth="5"
              strokeDasharray="16 22"
              className="road-dash-anim"
            />
          </g>
          <polygon points="500,3876 476,3816 524,3816" fill="var(--fg)" />
        </svg>

        {ITEMS.map((item, i) => {
          const leftSide = stopX(i) === 320;
          const topPct = (stopY(i) / H) * 100;
          const leftPct = (stopX(i) / 1000) * 100;
          return (
            <div key={item.title}>
              <div
                className="absolute z-10"
                style={{ top: `${topPct}%`, left: `${leftPct}%`, transform: "translate(-50%, -50%)" }}
              >
                <div
                  data-stop={stopY(i) / H}
                  className="rj-pin flex h-11 w-11 items-center justify-center rounded-[14px] border-[3px] border-white font-mono text-sm font-bold text-white"
                  style={{ background: item.color }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
              </div>
              <div
                data-stop={stopY(i) / H}
                className={`rj-banner absolute w-[30%] bg-[var(--bg-raised)] px-6 py-5 ${
                  leftSide
                    ? "[clip-path:polygon(0_0,calc(100%-20px)_0,100%_50%,calc(100%-20px)_100%,0_100%)]"
                    : "[clip-path:polygon(20px_0,100%_0,100%_100%,20px_100%,0_50%)]"
                }`}
                style={{
                  top: `${topPct}%`,
                  ...(leftSide ? { left: "0.5%" } : { right: "0.5%" }),
                }}
              >
                <p className="mono-label mb-2" style={{ color: item.color }}>
                  {item.phase}
                </p>
                <h3 className="text-lg font-bold leading-snug tracking-tight" style={{ color: titleColor(item) }}>
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--fg-muted)]">{item.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: straight road, cards on the right */}
      <div ref={mobRef} className="relative md:hidden">
        <div className="absolute bottom-2 left-[17px] top-2 w-[10px] rounded-full bg-[var(--fg)] opacity-[0.13]" />
        <div
          ref={fillRef}
          className="absolute left-[17px] top-2 w-[10px] rounded-full bg-[var(--fg)]"
          style={{ height: "0%" }}
        />
        <div className="space-y-4">
          {ITEMS.map((item, i) => (
            <div key={item.title} className="relative flex gap-4">
              <div
                data-stop={(i + 0.5) / ITEMS.length}
                className="rj-pin relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border-[3px] border-white font-mono text-sm font-bold text-white"
                style={{ background: item.color }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div
                data-stop={(i + 0.5) / ITEMS.length}
                className="rj-card flex-1 rounded-2xl border border-[var(--line)] bg-[var(--bg-raised)] p-4"
              >
                <p className="mono-label mb-1.5" style={{ color: item.color }}>
                  {item.phase}
                </p>
                <h3 className="text-base font-bold leading-snug tracking-tight" style={{ color: titleColor(item) }}>
                  {item.title}
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-[var(--fg-muted)]">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Destination */}
      <div className="mx-auto mt-16 max-w-xl text-center">
        <p className="mono-label mb-3">THE DESTINATION</p>
        <p className="text-2xl font-bold tracking-tight">A dollar sent is a dollar received.</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">
          Stablecoin payments for everyone, everywhere. That is where this road ends.
        </p>
      </div>
    </div>
  );
}
