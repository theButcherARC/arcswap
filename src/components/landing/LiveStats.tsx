"use client";

import { useEffect, useState } from "react";
import AnimatedNumber from "@/components/ui/AnimatedNumber";

type Stats = {
  latestBlock: number;
  stats: { transferCount: number; totalMoved: number };
  issued: { total: number } | null;
};

function fmtInt(n: number): string {
  return n.toLocaleString("en-US");
}
function fmtBig(n: number): string {
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
  return "$" + fmtUsd(n);
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

  const cells: {
    raw: number | null;
    format: (n: number) => string;
    label: string;
  }[] = [
    {
      raw: data?.issued ? data.issued.total : null,
      format: fmtBig,
      label: "USDC Issued on Arc, Live",
    },
    {
      raw: data ? data.latestBlock : null,
      format: (n) => "#" + fmtInt(Math.round(n)),
      label: "Latest Arc Block, Live",
    },
    {
      raw: data ? data.stats.totalMoved : null,
      format: (n) => "$" + fmtUsd(n),
      label: "USDC Moved, Last ~10 Min",
    },
    {
      raw: data ? data.stats.transferCount : null,
      format: (n) => fmtInt(Math.round(n)),
      label: "USDC Transfers, Last ~10 Min",
    },
  ];

  return (
    <section className="relative z-10" aria-label="Live Arc numbers">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden border border-[var(--line)] bg-[var(--line)] grid grid-cols-2 gap-px md:grid-cols-4">
          {cells.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-start justify-center bg-[var(--bg-raised)] px-6 py-10 sm:px-8"
            >
              {s.raw === null ? (
                <span className="font-mono text-3xl font-bold tracking-tight text-[var(--fg)] sm:text-4xl">
                  ...
                </span>
              ) : (
                <AnimatedNumber
                  value={s.raw}
                  format={s.format}
                  className="font-mono text-3xl font-bold tracking-tight text-[var(--fg)] sm:text-4xl"
                />
              )}
              <span className="mono-label mt-3">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
