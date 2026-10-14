"use client";

import React, { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Static data                                                         */
/* ------------------------------------------------------------------ */

const LAYERS = [
  {
    id: "input",
    label: "01  INPUT",
    accentColor: "rgba(148,163,184,0.9)",
    borderColor: "rgba(148,163,184,0.15)",
    bgColor: "rgba(148,163,184,0.04)",
    nodes: [
      {
        icon: "👤",
        title: "Team Lead / Operator",
        subtitle: "Connects MetaMask",
        tags: ["MetaMask", "Arc"],
      },
      {
        icon: "📋",
        title: "Recipient List",
        subtitle: "Manual or CSV",
        tags: ["Up to 100 addresses"],
      },
    ],
  },
  {
    id: "frontend",
    label: "02  FRONTEND",
    accentColor: "rgba(139,92,246,0.9)",
    borderColor: "rgba(139,92,246,0.2)",
    bgColor: "rgba(139,92,246,0.04)",
    nodes: [
      {
        icon: "⬡",
        title: "Next.js 14",
        subtitle: "App Router, SSR",
        tags: ["TypeScript", "Tailwind CSS"],
      },
      {
        icon: "◈",
        title: "Wagmi v2 + Viem",
        subtitle: "Wallet & chain interaction",
        tags: ["useWriteContract", "simulateContract"],
      },
      {
        icon: "◉",
        title: "BulkPayForm",
        subtitle: "Token select, recipients, memo",
        tags: ["USDC / EURC", "Gas Estimator"],
      },
    ],
  },
  {
    id: "ai",
    label: "03  AI LAYER",
    accentColor: "rgba(6,182,212,0.9)",
    borderColor: "rgba(6,182,212,0.2)",
    bgColor: "rgba(6,182,212,0.04)",
    nodes: [
      {
        icon: "◆",
        title: "Groq LLM",
        subtitle: "llama-3.3-70b-versatile",
        tags: ["500 req/day free"],
      },
      {
        icon: "◇",
        title: "Natural Language Parser",
        subtitle: '"pay Alice $50, Bob $100"',
        tags: ["JSON output", "Structured extraction"],
      },
    ],
  },
  {
    id: "blockchain",
    label: "04  BLOCKCHAIN",
    accentColor: "rgba(52,211,153,0.9)",
    borderColor: "rgba(52,211,153,0.2)",
    bgColor: "rgba(52,211,153,0.04)",
    nodes: [
      {
        icon: "⬡",
        title: "Arc",
        subtitle: "Chain ID: 5042",
        tags: ["Sub-second finality", "Gas in USDC"],
      },
      {
        icon: "◈",
        title: "Multicall3From",
        subtitle: "0x522f...47D0",
        tags: ["Preserves msg.sender", "Atomic batch"],
      },
      {
        icon: "◉",
        title: "Memo Contract",
        subtitle: "0x5294...505",
        tags: ["sendMemo(string)", "Onchain label"],
      },
      {
        icon: "◆",
        title: "USDC / EURC",
        subtitle: "Circle stablecoins",
        tags: ["6 decimals", "ERC-20"],
      },
    ],
  },
  {
    id: "output",
    label: "05  OUTPUT",
    accentColor: "rgba(251,191,36,0.9)",
    borderColor: "rgba(251,191,36,0.15)",
    bgColor: "rgba(251,191,36,0.04)",
    nodes: [
      {
        icon: "◉",
        title: "100+ Recipients",
        subtitle: "Receive USDC/EURC",
        tags: ["All wallets funded atomically"],
      },
      {
        icon: "◈",
        title: "Arc Explorer Confirmation",
        subtitle: "explorer.arc.io",
        tags: ["Settled in < 1s"],
      },
    ],
  },
];

const ARROW_LABELS = [
  "JSON instruction",
  "Parsed recipients",
  "writeContract()",
  "tx receipt",
];

/* ------------------------------------------------------------------ */
/*  Sub-components (plain functions, no JSX vars)                       */
/* ------------------------------------------------------------------ */

function NodeCard({
  icon,
  title,
  subtitle,
  tags,
  accentColor,
  borderColor,
  bgColor,
  visible,
  delay,
}: {
  icon: string;
  title: string;
  subtitle: string;
  tags: string[];
  accentColor: string;
  borderColor: string;
  bgColor: string;
  visible: boolean;
  delay: number;
}) {
  return (
    <div
      style={{
        border: `1px solid ${borderColor}`,
        background: bgColor,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
      className="rounded-xl px-4 py-3 backdrop-blur-xl flex-1 min-w-0"
    >
      <div className="flex items-start gap-2.5 mb-2">
        <span
          className="text-base leading-none mt-0.5 opacity-70"
          aria-hidden="true"
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white/90 leading-tight">
            {title}
          </p>
          <p className="text-[11px] text-white/40 mt-0.5 leading-tight">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {tags.map((tag) => (
          <span
            key={tag}
            style={{ color: accentColor, borderColor: borderColor }}
            className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-white/[0.03]"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function AnimatedArrow({
  label,
  accentFrom,
  accentTo,
  visible,
  delay,
}: {
  label: string;
  accentFrom: string;
  accentTo: string;
  visible: boolean;
  delay: number;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const timeout = setTimeout(() => {
      let start: number | null = null;
      const duration = 800;
      const step = (ts: number) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        setProgress(p);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timeout);
  }, [visible, delay]);

  return (
    <div
      className="flex flex-col items-center gap-1 py-1"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity 0.4s ease ${delay}ms`,
      }}
    >
      {/* Label */}
      <span
        className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-white/30"
      >
        {label}
      </span>

      {/* Animated line + arrow */}
      <div className="relative w-0.5 h-10 bg-white/[0.06] overflow-hidden rounded-full">
        <div
          className="absolute top-0 left-0 w-full rounded-full"
          style={{
            height: `${progress * 100}%`,
            background: `linear-gradient(to bottom, ${accentFrom}, ${accentTo})`,
            boxShadow: `0 0 8px ${accentTo}`,
            transition: "height 0.05s linear",
          }}
        />
      </div>

      {/* Arrowhead */}
      <svg
        width="10"
        height="6"
        viewBox="0 0 10 6"
        style={{
          opacity: progress,
          transform: `scale(${0.5 + progress * 0.5})`,
          transition: "opacity 0.2s, transform 0.2s",
        }}
      >
        <path
          d="M0 0 L5 6 L10 0"
          fill="none"
          stroke={accentTo}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function LayerBlock({
  layer,
  visible,
  baseDelay,
}: {
  layer: (typeof LAYERS)[number];
  visible: boolean;
  baseDelay: number;
}) {
  return (
    <div
      style={{
        borderColor: layer.borderColor,
        background: layer.bgColor,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-8px)",
        transition: `opacity 0.5s ease ${baseDelay}ms, transform 0.5s ease ${baseDelay}ms`,
      }}
      className="rounded-2xl border p-4 backdrop-blur-xl"
    >
      {/* Layer label */}
      <p
        className="text-[10px] font-bold tracking-widest mb-3"
        style={{ color: layer.accentColor }}
      >
        {layer.label}
      </p>

      {/* Node cards in a row */}
      <div className="flex gap-3 flex-wrap">
        {layer.nodes.map((node, i) => (
          <NodeCard
            key={node.title}
            {...node}
            accentColor={layer.accentColor}
            borderColor={layer.borderColor}
            bgColor="transparent"
            visible={visible}
            delay={baseDelay + i * 80}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main exported component                                             */
/* ------------------------------------------------------------------ */

export default function ArchitectureDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative rounded-3xl overflow-hidden border border-white/[0.06] bg-[#050508]"
    >
      {/* Ambient glow orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-15"
        style={{
          background:
            "radial-gradient(circle, rgba(52,211,153,0.4) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <div className="px-8 pt-8 pb-2 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">System Architecture</h2>
          <p className="text-sm text-white/30 mt-0.5">
            VibeFlow — Programmable Payroll on Arc
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Arc Mainnet
          </span>
          <span className="text-[11px] font-medium text-violet-400 bg-violet-400/10 border border-violet-400/20 rounded-full px-3 py-1">
            Circle USDC / EURC
          </span>
        </div>
      </div>

      {/* Layers + arrows */}
      <div className="px-8 pb-8 pt-4 flex flex-col gap-0">
        {LAYERS.map((layer, i) => (
          <React.Fragment key={layer.id}>
            <LayerBlock
              layer={layer}
              visible={visible}
              baseDelay={i * 120}
            />
            {i < LAYERS.length - 1 && (
              <div className="flex justify-center">
                <AnimatedArrow
                  label={ARROW_LABELS[i]}
                  accentFrom={LAYERS[i].accentColor}
                  accentTo={LAYERS[i + 1].accentColor}
                  visible={visible}
                  delay={i * 120 + 300}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Footer stats bar */}
      <div className="border-t border-white/[0.05] px-8 py-4 flex items-center gap-8 flex-wrap">
        {[
          { label: "Finality", value: "< 1 second" },
          { label: "Max recipients", value: "100+ per tx" },
          { label: "Gas token", value: "USDC" },
          { label: "AI model", value: "llama-3.3-70b" },
          { label: "Contract calls", value: "1 popup, N transfers" },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col">
            <span className="text-[10px] text-white/25 uppercase tracking-wider">
              {stat.label}
            </span>
            <span className="text-sm font-semibold text-white/80 mt-0.5">
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
