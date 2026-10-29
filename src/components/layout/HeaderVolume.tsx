"use client";

import { useEffect, useState } from "react";

function fmt(n: number): string {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(1) + "K";
  return "$" + n.toFixed(0);
}

export function HeaderVolume() {
  const [moved, setMoved] = useState<number | null>(null);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const r = await fetch("/api/vibrain");
        if (!r.ok) return;
        const d = await r.json();
        if (!stop && typeof d?.stats?.totalMoved === "number") {
          setMoved(d.stats.totalMoved);
        }
      } catch {
        // keep the last value on a failed refresh
      }
    };
    load();
    const id = setInterval(load, 20000);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div
      className="flex items-center gap-2.5 rounded-full border border-[var(--line)] bg-[var(--glass)] py-2 pl-3.5 pr-4"
      title="USDC moved on Arc in the last ~10 minutes. Live from Arc RPC (Vibrain)."
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
      </span>
      <span className="mono-label hidden lg:inline">Arc live volume</span>
      <span className="font-mono text-sm font-semibold tabular-nums text-[var(--fg)]">
        {moved === null ? "..." : fmt(moved)}
      </span>
      <span className="hidden text-[11px] font-medium text-[var(--fg-faint)] sm:inline">
        USDC · last ~10 min
      </span>
    </div>
  );
}
