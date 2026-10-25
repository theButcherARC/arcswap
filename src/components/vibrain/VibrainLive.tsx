"use client";

import { useEffect, useRef, useState } from "react";

type Block = { number: number; timestamp: number; txCount: number };
type Transfer = {
  from: string;
  to: string;
  amount: number;
  blockNumber: number;
  txHash: string;
};
type VibrainData = {
  latestBlock: number;
  blockTimeSec: number;
  windowBlocks: number;
  blocks: Block[];
  transfers: Transfer[];
  stats: { transferCount: number; totalMoved: number; largest: number };
  fetchedAt: string;
};

const LARGE_USDC = 25000;
const REFRESH_MS = 12000;

function fmtInt(n: number): string {
  return n.toLocaleString("en-US");
}
function fmtUsd(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
function shortAddr(a: string): string {
  return a.slice(0, 6) + "..." + a.slice(-4);
}
function ago(sec: number): string {
  if (sec < 60) return Math.max(1, Math.round(sec)) + "s ago";
  if (sec < 3600) return Math.round(sec / 60) + "m ago";
  return Math.round(sec / 3600) + "h ago";
}

export function VibrainLive() {
  const [data, setData] = useState<VibrainData | null>(null);
  const [failed, setFailed] = useState(false);
  const [updatedAgo, setUpdatedAgo] = useState(0);
  const fetchedAtRef = useRef<number>(0);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch("/api/vibrain", { cache: "no-store" });
        if (!res.ok) throw new Error("bad status");
        const json = (await res.json()) as VibrainData;
        if (!alive) return;
        setData(json);
        setFailed(false);
        fetchedAtRef.current = Date.now();
        setUpdatedAgo(0);
      } catch {
        if (alive) setFailed(true);
      }
    }
    load();
    const id = setInterval(load, REFRESH_MS);
    const tick = setInterval(
      () =>
        setUpdatedAgo(
          fetchedAtRef.current
            ? Math.round((Date.now() - fetchedAtRef.current) / 1000)
            : 0,
        ),
      1000,
    );
    return () => {
      alive = false;
      clearInterval(id);
      clearInterval(tick);
    };
  }, []);

  const nowSec = Math.floor(Date.now() / 1000);

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--fg)] sm:text-4xl">
              VIBRAIN
            </h1>
            <span className="flex items-center gap-1.5 rounded-full border border-[var(--line)] px-2.5 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
              </span>
              <span className="mono-label !text-[var(--accent)]">LIVE</span>
            </span>
          </div>
          <p className="mt-2 text-sm text-[var(--fg-muted)]">
            Live activity on Arc mainnet. Every number on this page is read
            straight from the chain.
          </p>
        </div>
        <p className="mono-label">
          {data
            ? "UPDATED " + updatedAgo + "S AGO"
            : failed
              ? "RECONNECTING"
              : "CONNECTING"}
        </p>
      </div>

      {!data && !failed && (
        <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--glass)] p-10 text-center">
          <p className="text-sm text-[var(--fg-muted)]">
            Reading the chain...
          </p>
        </div>
      )}
      {!data && failed && (
        <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--glass)] p-10 text-center">
          <p className="text-sm text-[var(--fg-muted)]">
            Live data is not answering right now. This page retries on its
            own, nothing is cached or made up here.
          </p>
        </div>
      )}

      {data && (
        <>
          {/* Stats strip */}
          <div className="mb-10 grid grid-cols-2 overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--glass)] lg:grid-cols-4">
            {[
              { label: "LATEST BLOCK", value: fmtInt(data.latestBlock) },
              { label: "BLOCK TIME", value: data.blockTimeSec.toFixed(2) + "s" },
              {
                label: "USDC MOVED, LAST ~10 MIN",
                value: "$" + fmtUsd(data.stats.totalMoved),
              },
              {
                label: "USDC TRANSFERS, LAST ~10 MIN",
                value: fmtInt(data.stats.transferCount),
              },
            ].map((s, i) => (
              <div
                key={s.label}
                className={
                  "px-5 py-4 " +
                  (i > 0 ? "border-l border-[var(--line)] " : "") +
                  (i >= 2 ? "max-lg:border-t max-lg:border-[var(--line)] " : "") +
                  (i === 2 ? "max-lg:border-l-0" : "")
                }
              >
                <p className="mono-label mb-1.5">{s.label}</p>
                <p className="font-mono text-xl font-semibold text-[var(--fg)]">
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-10 lg:grid-cols-5">
            {/* Latest blocks */}
            <section className="lg:col-span-2">
              <h2 className="mono-label mb-4 !text-[var(--fg-muted)]">
                LATEST BLOCKS
              </h2>
              <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {data.blocks.map((b) => (
                  <div
                    key={b.number}
                    className="flex items-center justify-between py-3"
                  >
                    <span className="font-mono text-sm text-[var(--fg)]">
                      #{fmtInt(b.number)}
                    </span>
                    <span className="text-xs text-[var(--fg-faint)]">
                      {b.txCount} tx . {ago(nowSec - b.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* USDC transfers */}
            <section className="lg:col-span-3">
              <h2 className="mono-label mb-4 !text-[var(--fg-muted)]">
                RECENT USDC TRANSFERS
              </h2>
              <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {data.transfers.map((t, i) => (
                  <a
                    key={t.txHash + "-" + i}
                    href={"https://explorer.arc.io/tx/" + t.txHash}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-3 py-3"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-mono text-xs text-[var(--fg-muted)] group-hover:text-[var(--fg)]">
                        {shortAddr(t.from)} {" -> "} {shortAddr(t.to)}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-[var(--fg-faint)]">
                        block #{fmtInt(t.blockNumber)} .{" "}
                        {ago((data.latestBlock - t.blockNumber) * data.blockTimeSec)}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {t.amount >= LARGE_USDC && (
                        <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-semibold text-white">
                          LARGE
                        </span>
                      )}
                      <span className="font-mono text-sm font-semibold text-[var(--fg)]">
                        {fmtUsd(t.amount)}{" "}
                        <span className="text-[var(--data)]">USDC</span>
                      </span>
                    </span>
                  </a>
                ))}
              </div>
              <p className="mt-4 text-xs text-[var(--fg-faint)]">
                Largest in window: ${fmtUsd(data.stats.largest)} USDC. Source:
                Arc mainnet RPC, refreshed every 12 seconds. Window: last{" "}
                {fmtInt(data.windowBlocks)} blocks.
              </p>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
