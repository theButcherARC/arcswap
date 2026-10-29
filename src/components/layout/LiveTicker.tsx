"use client";

import { useEffect, useState } from "react";

type Transfer = {
  from: string;
  to: string;
  amount: number;
  blockNumber: number;
  txHash: string;
};

function short(addr: string): string {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function money(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: n < 100 ? 2 : 0 });
}

export function LiveTicker() {
  const [items, setItems] = useState<Transfer[]>([]);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const r = await fetch("/api/vibrain");
        if (!r.ok) return;
        const d = await r.json();
        if (!stop && Array.isArray(d?.transfers)) setItems(d.transfers);
      } catch {
        // keep the last transfers on a failed refresh
      }
    };
    load();
    const id = setInterval(load, 30000);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, []);

  const row = (keyPrefix: string) => (
    <div className="flex shrink-0 items-center" aria-hidden={keyPrefix === "b"}>
      {items.map((t, i) => (
        <a
          key={keyPrefix + i}
          href={"https://explorer.arc.io/tx/" + t.txHash}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-5 font-mono text-[11.5px] text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
          tabIndex={keyPrefix === "b" ? -1 : 0}
        >
          <span className="font-semibold text-[var(--fg)]">${money(t.amount)}</span>
          <span>USDC</span>
          <span className="text-[var(--fg-faint)]">
            {short(t.from)} {"->"} {short(t.to)}
          </span>
          <span className="text-[var(--fg-faint)]">#{t.blockNumber.toLocaleString("en-US")}</span>
          <span className="ml-3 h-1 w-1 rounded-full bg-[var(--accent)]" />
        </a>
      ))}
    </div>
  );

  return (
    <div className="relative flex h-[38px] items-center overflow-hidden border-b border-[var(--line)] bg-[var(--glass)]">
      <style>{`
        @keyframes vf-ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .vf-ticker-track { animation: vf-ticker 90s linear infinite; }
        .vf-ticker-track:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .vf-ticker-track { animation: none; } }
      `}</style>

      <div className="absolute inset-y-0 left-0 z-10 flex items-center gap-2 bg-[var(--bg)] pl-4 pr-3 sm:pl-5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
        </span>
        <span className="mono-label whitespace-nowrap">Live transfers</span>
      </div>

      {items.length === 0 ? (
        <span className="pl-36 font-mono text-[11.5px] text-[var(--fg-faint)] sm:pl-44">
          Reading Arc mainnet...
        </span>
      ) : (
        <div className="vf-ticker-track flex whitespace-nowrap pl-32 sm:pl-40">
          {row("a")}
          {row("b")}
        </div>
      )}

      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--bg)] to-transparent" />
    </div>
  );
}
