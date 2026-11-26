"use client";

import { useEffect, useRef, useState } from "react";
import { Playfair_Display } from "next/font/google";

// Exploded view of a batch (landing only, after the hero batch card).
// As the section travels through the viewport the batch card separates
// into the five parts a sender checks. Progress is driven by scroll
// position (the HeroScroll pattern: scroll listener + rAF + a CSS
// variable), never by observers, and the render applies the sample's
// cubic ease. Under prefers-reduced-motion the batch renders fully
// opened and nothing is scroll-driven. The payslip serif follows the
// PayslipReceipt pattern. All geometry lives in globals.css (.ba-*).
const serifDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-payslip-serif",
  display: "swap",
});

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="ba-row flex items-center justify-between gap-3 border-t border-dashed border-[var(--line)] py-[5px] text-[13px] first:border-t-0">
      {children}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="ba-pill">{children}</span>;
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="ba-chip">{children}</span>;
}

const LABELS = [
  { cls: "ba-l1", fig: "FIG 01", name: "Recipients", note: "Every line checked before signing." },
  { cls: "ba-l2", fig: "FIG 02", name: "Memos", note: "Written into the chain logs." },
  { cls: "ba-l3", fig: "FIG 03", name: "Payslip", note: "Per-line proof after the send." },
  { cls: "ba-l4", fig: "FIG 04", name: "Approval", note: "Exact total only." },
  { cls: "ba-l5", fig: "FIG 05", name: "Fee", note: "One line, stated up front." },
];

export default function BatchAnatomy() {
  const trackRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<HTMLInputElement>(null);
  const playRaf = useRef(0);
  const progressRef = useRef(0);
  const [blueprint, setBlueprint] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const ease = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const render = (p: number) => {
      const clamped = Math.min(1, Math.max(0, p));
      progressRef.current = clamped;
      track.style.setProperty("--ep", ease(clamped).toFixed(3));
      if (rangeRef.current) {
        rangeRef.current.value = String(Math.round(clamped * 1000));
      }
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      render(1);
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const total = rect.height - vh;
      render(total > 0 ? -rect.top / total : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const scrollTargetFor = (p: number) => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const total = Math.max(0, rect.height - vh);
    return rect.top + window.scrollY + p * total;
  };

  const stopPlay = () => {
    if (playRaf.current) cancelAnimationFrame(playRaf.current);
    playRaf.current = 0;
    setPlaying(false);
  };

  const onPlay = () => {
    if (playing) {
      stopPlay();
      return;
    }
    const to = progressRef.current > 0.6 ? 0 : 1;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, scrollTargetFor(to));
      return;
    }
    setPlaying(true);
    const startY = window.scrollY;
    const targetY = scrollTargetFor(to);
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / 1600, 1);
      window.scrollTo(0, startY + (targetY - startY) * t);
      if (t < 1) {
        playRaf.current = requestAnimationFrame(step);
      } else {
        playRaf.current = 0;
        setPlaying(false);
      }
    };
    playRaf.current = requestAnimationFrame(step);
  };

  const onScrub = () => {
    const input = rangeRef.current;
    if (!input) return;
    stopPlay();
    window.scrollTo(0, scrollTargetFor(Number(input.value) / 1000));
  };

  const toggleBlueprint = () => setBlueprint((v) => !v);

  const btnBase =
    "pressable inline-flex min-h-[44px] items-center rounded-full border px-4 text-[13px]";
  const btnIdle =
    "border-[var(--line)] bg-[var(--bg-raised)] text-[var(--fg)]";
  const btnOn = "border-[var(--fg)] bg-[var(--fg)] text-white";

  return (
    <section
      aria-label="Anatomy of a batch"
      className={`batch-anatomy relative ${serifDisplay.variable}`}
      data-blueprint={blueprint ? "true" : "false"}
    >
      <div ref={trackRef} className="relative h-[240vh]">
        <div
          className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden px-5 py-10 sm:px-8"
          style={{ height: "100svh" }}
        >
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col justify-center">
            <div className="mx-auto max-w-2xl text-center">
              <span className="mono-label !text-[var(--accent)]">
                SYS.BATCH / ANATOMY
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.02em] sm:text-4xl md:text-5xl">
                One batch, taken apart.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[var(--fg-muted)] sm:text-base">
                Scroll and the batch separates into the parts a sender
                actually checks: every recipient, the memos, the exact
                approval, the fee, and the payslip that proves it landed.
              </p>
            </div>

            <div className="ba-stage relative mx-auto mt-6 w-full max-w-5xl flex-1 sm:mt-8" style={{ minHeight: 400 }}>
              <span className="mono-label absolute left-1 top-1 z-[5]">
                FIG · Anatomy of a batch
              </span>

              <svg
                className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {[
                  [50, 50, 17, 31],
                  [50, 50, 83, 31],
                  [50, 50, 83, 70],
                  [50, 50, 17, 70],
                  [50, 50, 50, 84],
                ].map(([x1, y1, x2, y2]) => (
                  <line
                    key={`${x2}-${y2}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="var(--accent)"
                    strokeWidth="0.35"
                    strokeDasharray="1.4 1.2"
                    style={{ opacity: "calc(var(--ep, 0) * 0.85)" }}
                  />
                ))}
              </svg>

              <div className="ba-part ba-center">
                <div className="mono-label">SYS.BATCH · Creator team</div>
                <div className="mt-1.5 text-[22px] font-bold tracking-tight">
                  $1,250.00
                </div>
                <Row>
                  <span>12 recipients</span>
                  <Pill>Ready</Pill>
                </Row>
                <Row>
                  <span>Token</span>
                  <span>USDC on Arc</span>
                </Row>
              </div>

              <div className="ba-part ba-recipients">
                <h3 className="text-sm font-semibold">Recipients</h3>
                <Row>
                  <span>Ali</span>
                  <span>$250.00</span>
                </Row>
                <Row>
                  <span>Sara</span>
                  <span>$250.00</span>
                </Row>
                <Row>
                  <span>Ahmed</span>
                  <span>$250.00</span>
                </Row>
                <Row>
                  <span>+ 9 more</span>
                  <Pill>Checked</Pill>
                </Row>
              </div>

              <div className="ba-part ba-memo">
                <h3 className="text-sm font-semibold">Memos</h3>
                <Row>
                  <span>Batch memo</span>
                  <Chip>creator team</Chip>
                </Row>
                <Row>
                  <span>Per payment</span>
                  <Chip>Test payment</Chip>
                </Row>
                <Row>
                  <span>Onchain</span>
                  <Pill>In the logs</Pill>
                </Row>
              </div>

              <div className="ba-part ba-payslip">
                <div className="mono-label">Payslip · Receipt</div>
                <div
                  className="mt-1 text-[22px] font-bold"
                  style={{
                    fontFamily:
                      "var(--font-payslip-serif), Georgia, serif",
                  }}
                >
                  $1,250.00
                </div>
                <div className="ba-perf">
                  <Row>
                    <span>Ali</span>
                    <Pill>Pass</Pill>
                  </Row>
                  <Row>
                    <span>Sara</span>
                    <Pill>Pass</Pill>
                  </Row>
                  <Row>
                    <span>Ahmed</span>
                    <Pill>Pass</Pill>
                  </Row>
                </div>
              </div>

              <div className="ba-part ba-approval">
                <h3 className="text-sm font-semibold">Exact approval</h3>
                <p className="ba-muted mt-1 text-[13px] leading-relaxed">
                  You approve exactly{" "}
                  <b className="ba-strong font-semibold">$1,252.50</b>.
                  Never unlimited, never more than the batch.
                </p>
              </div>

              <div className="ba-part ba-fee text-center">
                <Chip>Fee 0.2% · $2.50 · first chunk only</Chip>
              </div>

              {LABELS.map((l) => (
                <div key={l.fig} className={`ba-label ${l.cls}`}>
                  <span className="mono-label leading-[1.5]">
                    <b className="block font-semibold text-[var(--accent)]">
                      {l.fig}
                    </b>
                    {l.name}
                  </span>
                  <p className="ba-muted mt-0.5 hidden text-[11px] leading-snug min-[560px]:block">
                    {l.note}
                  </p>
                </div>
              ))}

              <span className="mono-label absolute bottom-1 left-1 z-[5] whitespace-nowrap max-[640px]:bottom-auto max-[640px]:left-auto max-[640px]:right-1 max-[640px]:top-1">
                Scroll · the batch opens
              </span>
            </div>

            <div className="mx-auto mt-5 flex w-full max-w-xl flex-wrap items-center justify-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onPlay}
                className={`${btnBase} ${playing ? btnOn : btnIdle}`}
              >
                {playing ? "Stop" : "Play the opening"}
              </button>
              <button
                type="button"
                onClick={toggleBlueprint}
                aria-pressed={blueprint}
                className={`${btnBase} ${blueprint ? btnOn : btnIdle}`}
              >
                Blueprint
              </button>
              <input
                ref={rangeRef}
                type="range"
                min={0}
                max={1000}
                defaultValue={0}
                onInput={onScrub}
                aria-label="Explode amount"
                className="h-11 min-w-[140px] flex-1 accent-[var(--accent)]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
