"use client";

import { useEffect, useState } from "react";

type Stats = {
  latestBlock: number;
  stats: { transferCount: number; totalMoved: number };
};

function fmtInt(n: number): string {
  return n.toLocaleString("en-US");
}
function fmtUsd(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function LiveStats() {
  const [data, setData] = useState<Stats | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch("/api/vibrain", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as Stats;
        if (alive) setData(json);
      } catch {
        // Landing keeps its layout; numbers simply stay as placeholders.
      }
    }
    load();
    const id = setInterval(load, 30000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const cells = [
    {
      value: data ? "#" + fmtInt(data.latestBlock) : "...",
      label: "Latest Arc Block, Live",
    },
    {
      value: data ? "$" + fmtUsd(data.stats.totalMoved) : "...",
      label: "USDC Moved, Last ~10 Min",
    },
    {
      value: data ? fmtInt(data.stats.transferCount) : "...",
      label: "USDC Transfers, Last ~10 Min",
    },
    { value: "100", label: "Recipients Per Batch" },
  ];

  return (
    <section className="relative z-10 px-5 mb-28 sm:px-8" aria-label="Live Arc numbers">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden border border-[var(--line)] bg-[var(--line)] grid grid-cols-2 gap-px md:grid-cols-4">
          {cells.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-start justify-center bg-[var(--bg-raised)] px-6 py-10 sm:px-8"
            >
              <span className="font-mono text-3xl font-bold tracking-tight text-[var(--fg)] sm:text-4xl">
                {s.value}
              </span>
              <span className="mono-label mt-3">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
