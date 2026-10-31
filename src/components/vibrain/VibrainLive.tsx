"use client";

import { useEffect, useRef, useState } from "react";

type Block = { number: number; timestamp: number; txCount: number };
type Transfer = {
  from: string;
  to: string;
  fromLabel: string | null;
  toLabel: string | null;
  amount: number;
  blockNumber: number;
  txHash: string;
};
type HistoryPoint = { hoursAgo: number; supply: number | null };
type VibrainData = {
  latestBlock: number;
  blockTimeSec: number;
  windowBlocks: number;
  blocks: Block[];
  transfers: Transfer[];
  stats: { transferCount: number; totalMoved: number; largest: number };
  issued: {
    total: number;
    sharePct: number | null;
    hour: { delta: number; pct: number } | null;
    day: { delta: number; pct: number } | null;
    week: { delta: number; pct: number } | null;
    month: { delta: number; pct: number } | null;
  } | null;
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
function fmtBig(n: number): string {
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
  return "$" + fmtUsd(n);
}
function fmtDelta(n: number): string {
  const sign = n >= 0 ? "+" : "-";
  const a = Math.abs(n);
  if (a >= 1e6) return sign + "$" + (a / 1e6).toFixed(1) + "M";
  if (a >= 1e3) return sign + "$" + (a / 1e3).toFixed(1) + "K";
  return sign + "$" + a.toFixed(0);
}
function shortAddr(a: string): string {
  return a.slice(0, 6) + "..." + a.slice(-4);
}
function ago(sec: number): string {
  if (sec < 60) return Math.max(1, Math.round(sec)) + "s ago";
  if (sec < 3600) return Math.round(sec / 60) + "m ago";
  return Math.round(sec / 3600) + "h ago";
}

function TokenCoinIssued() {
  return (
    <span className="hidden items-center gap-2 rounded-full border border-[var(--line)] px-3.5 py-2 sm:flex">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
      </span>
      <span className="mono-label">TOTAL SUPPLY · LIVE</span>
    </span>
  );
}

function Sparkline({ points }: { points: HistoryPoint[] }) {
  const vals = points
    .map((p) => p.supply)
    .filter((s): s is number => s !== null);
  if (vals.length < 2) return null;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const coords = points
    .map((p, i) => {
      if (p.supply === null) return null;
      const x = (i / (points.length - 1)) * 100;
      const y = 26 - ((p.supply - min) / range) * 22;
      return x.toFixed(1) + "," + y.toFixed(1);
    })
    .filter(Boolean)
    .join(" ");
  const first = vals[0];
  const last = vals[vals.length - 1];
  const pct = first > 0 ? ((last - first) / first) * 100 : 0;
  return (
    <div className="mt-6">
      <div className="flex items-baseline justify-between">
        <p className="mono-label">ISSUED, LAST 24 HOURS (HOURLY)</p>
        <p className="font-mono text-xs font-semibold text-emerald-600">
          {(pct >= 0 ? "+" : "") + pct.toFixed(2) + "%"}
        </p>
      </div>
      <svg
        viewBox="0 0 100 28"
        preserveAspectRatio="none"
        className="mt-2 h-14 w-full"
        role="img"
        aria-label="USDC issued on Arc over the last 24 hours"
      >
        <polyline
          points={coords}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.4"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="flex justify-between font-mono text-[10px] text-[var(--fg-faint)]">
        <span>{fmtBig(min)}</span>
        <span>{fmtBig(max)}</span>
      </div>
    </div>
  );
}

function sideText(label: string | null, addr: string): string {
  return label ? label : shortAddr(addr);
}

type GlobalFreezes = {
  asOf: string;
  source: string;
  sourceUrl: string;
  freezes: number;
  unfreezes: number;
  wallets: number;
  chains: number;
  frozenUsd: number;
  monthFreezes: number;
  monthLabel: string;
  biggest: { amount: number; chain: string; date: string; note: string };
};
type ChainFreezes = {
  id: string;
  name: string;
  explorer: string;
  frozenCount: number;
  lockedUsdc: number;
  totalFreezes: number;
  totalUnfreezes: number;
  throughBlock: number;
  events: {
    block: number;
    kind: "freeze" | "unfreeze";
    address: string;
    tx: string;
    ts: number | null;
  }[];
};
type LastFreeze = {
  chain: string;
  chainName: string;
  explorer: string;
  address: string;
  tx: string;
  ts: number | null;
  balance: number;
};
type FreezeData = {
  global: GlobalFreezes;
  chains: { arc?: ChainFreezes; ethereum?: ChainFreezes };
  lastFreeze: LastFreeze | null;
};
type CheckResult = {
  address: string;
  chain: string;
  frozen: boolean;
  balance: number;
};

function fmtDateTime(ts: number): string {
  return new Date(ts * 1000).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ChainEvents({ c }: { c: ChainFreezes }) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-base font-semibold text-[var(--fg)]">
          {c.name}
        </h3>
        <p className="font-mono text-xs text-[var(--fg-faint)]">
          {fmtInt(c.frozenCount)} frozen · ${fmtBig(c.lockedUsdc)} locked
        </p>
      </div>
      <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {c.events.map((e, i) => (
          <div
            key={e.tx + i}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5"
          >
            <span
              className={
                "rounded-full px-2 py-0.5 text-[10px] font-semibold text-white " +
                (e.kind === "freeze" ? "bg-rose-600" : "bg-emerald-600")
              }
            >
              {e.kind === "freeze" ? "FREEZE" : "UNFREEZE"}
            </span>
            <a
              href={c.explorer + "/address/" + e.address}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-[var(--data)] hover:underline"
            >
              {shortAddr(e.address)}
            </a>
            <span className="text-xs text-[var(--fg-faint)]">
              {e.ts ? fmtDateTime(e.ts) : "block " + fmtInt(e.block)}
            </span>
            <a
              href={c.explorer + "/tx/" + e.tx}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[var(--data)] hover:underline"
            >
              view tx
            </a>
          </div>
        ))}
        {c.events.length === 0 && (
          <p className="py-3 text-sm text-[var(--fg-faint)]">
            No events yet.
          </p>
        )}
      </div>
    </div>
  );
}

function FreezePanel() {
  const [fz, setFz] = useState<FreezeData | null>(null);
  const [addr, setAddr] = useState("");
  const [chain, setChain] = useState<"arc" | "ethereum">("arc");
  const [check, setCheck] = useState<CheckResult | null>(null);
  const [checkErr, setCheckErr] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch("/api/vibrain/freezes", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (alive && json && json.global) setFz(json);
      } catch {
        // panel simply stays absent on failure
      }
    }
    load();
    const id = setInterval(load, 300000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  async function runCheck() {
    const a = addr.trim();
    setCheck(null);
    setCheckErr(null);
    if (!/^0x[0-9a-fA-F]{40}$/.test(a)) {
      setCheckErr(
        "That does not look like an address. Paste a full 0x address.",
      );
      return;
    }
    setChecking(true);
    try {
      const res = await fetch(
        "/api/vibrain/freezes?chain=" +
          chain +
          "&check=" +
          encodeURIComponent(a),
        { cache: "no-store" },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "check failed");
      setCheck(json);
    } catch {
      setCheckErr("The check failed. Try again in a moment.");
    } finally {
      setChecking(false);
    }
  }

  if (!fz) return null;
  const liveChains = [fz.chains.arc, fz.chains.ethereum].filter(
    Boolean,
  ) as ChainFreezes[];
  const frozenNow = liveChains.reduce((s, c) => s + c.frozenCount, 0);
  const lockedNow = liveChains.reduce((s, c) => s + c.lockedUsdc, 0);
  const lf = fz.lastFreeze;

  return (
    <section className="mb-12 border-y border-[var(--line)] py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="mono-label !text-rose-600">USDC FREEZES</p>
        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--glass-strong)] px-3 py-1.5 font-mono text-[11px] font-semibold text-[var(--fg-muted)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
          </span>
          LIVE, ARC + ETHEREUM
        </span>
      </div>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--fg)]">
        Every USDC freeze, counted
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--fg-muted)]">
        Circle can freeze USDC at any address, for law enforcement or
        sanctions. The contract records every freeze and unfreeze on chain.
        Vibrain reads the Arc and Ethereum contracts live, so a new freeze
        appears here minutes after it lands, without waiting for any
        announcement.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)] lg:grid-cols-4">
        <div className="bg-[var(--bg-raised)] p-4">
          <p className="font-mono text-2xl font-semibold text-[var(--fg)]">
            {fmtInt(fz.global.freezes)}
          </p>
          <p className="mt-1 text-xs text-[var(--fg-muted)]">
            total USDC freezes, all {fz.global.chains} chains (record to{" "}
            {fz.global.asOf})
          </p>
        </div>
        <div className="bg-[var(--bg-raised)] p-4">
          <p className="font-mono text-2xl font-semibold text-[var(--fg)]">
            {fmtInt(frozenNow)}
          </p>
          <p className="mt-1 text-xs text-[var(--fg-muted)]">
            addresses frozen right now on Arc + Ethereum, read live
          </p>
        </div>
        <div className="bg-[var(--bg-raised)] p-4">
          <p className="font-mono text-2xl font-semibold text-[var(--fg)]">
            ${fmtBig(lockedNow)}
          </p>
          <p className="mt-1 text-xs text-[var(--fg-muted)]">
            USDC locked at those addresses right now
          </p>
        </div>
        <div className="bg-[var(--bg-raised)] p-4">
          <p className="font-mono text-2xl font-semibold text-[var(--fg)]">
            {fmtInt(fz.global.unfreezes)}
          </p>
          <p className="mt-1 text-xs text-[var(--fg-muted)]">
            unfreezes, all chains (record to {fz.global.asOf})
          </p>
        </div>
      </div>

      {lf && (
        <div className="mt-6 rounded-2xl border border-rose-600/30 bg-rose-600/[0.04] p-5">
          <p className="mono-label !text-rose-600">LAST FREEZE, LIVE</p>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <a
              href={lf.explorer + "/address/" + lf.address}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-lg font-semibold text-[var(--fg)] hover:underline"
            >
              {shortAddr(lf.address)}
            </a>
            <span className="rounded-full bg-[var(--glass-strong)] px-2.5 py-1 text-[11px] font-semibold text-[var(--fg-muted)]">
              {lf.chainName}
            </span>
            <span className="text-sm text-[var(--fg-muted)]">
              {lf.ts ? fmtDateTime(lf.ts) : ""}
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            ${fmtUsd(lf.balance)} USDC is locked at this address.{" "}
            <a
              href={lf.explorer + "/tx/" + lf.tx}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[var(--data)] hover:underline"
            >
              View the freeze transaction
            </a>
          </p>
        </div>
      )}

      <div className="mt-8 max-w-xl">
        <p className="mono-label mb-2">CHECK AN ADDRESS</p>
        <div className="mb-2 flex gap-2">
          {(["arc", "ethereum"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setChain(c)}
              className={
                "min-h-[36px] rounded-full px-4 text-xs font-semibold " +
                (chain === c
                  ? "bg-[var(--accent)] text-white"
                  : "border border-[var(--line)] text-[var(--fg-muted)]")
              }
            >
              {c === "arc" ? "Arc" : "Ethereum"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={addr}
            onChange={(e) => setAddr(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runCheck()}
            placeholder="0x..."
            spellCheck={false}
            className="min-h-[44px] min-w-0 flex-1 rounded-full border border-[var(--line)] bg-[var(--bg-raised)] px-4 font-mono text-base text-[var(--fg)] outline-none focus:border-[var(--accent)] sm:text-sm"
          />
          <button
            onClick={runCheck}
            disabled={checking}
            className="min-h-[44px] shrink-0 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {checking ? "Checking..." : "Check"}
          </button>
        </div>
        {checkErr && <p className="mt-2 text-sm text-rose-600">{checkErr}</p>}
        {check && (
          <div className="mt-3 rounded-2xl border border-[var(--line)] bg-[var(--bg-raised)] p-4">
            <p
              className={
                "text-sm font-semibold " +
                (check.frozen ? "text-rose-600" : "text-emerald-600")
              }
            >
              {check.frozen
                ? "FROZEN on " +
                  (check.chain === "arc" ? "Arc" : "Ethereum") +
                  ". This address is on Circle's blacklist. Its USDC cannot move."
                : "Not frozen on " +
                  (check.chain === "arc" ? "Arc" : "Ethereum") +
                  ". This address is not on the blacklist right now."}
            </p>
            <p className="mt-1 font-mono text-xs text-[var(--fg-muted)]">
              {check.address} · balance ${fmtUsd(check.balance)} USDC · read
              live from the contract
            </p>
          </div>
        )}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        {fz.chains.arc && <ChainEvents c={fz.chains.arc} />}
        {fz.chains.ethereum && <ChainEvents c={fz.chains.ethereum} />}
      </div>

      <div className="mt-8 border-t border-[var(--line)] pt-6">
        <p className="mono-label mb-3">THE FULL RECORD</p>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--fg-muted)]">
          Across every chain, about ${fmtBig(fz.global.frozenUsd)} of USDC
          has been frozen over the years, on {fmtInt(fz.global.wallets)}{" "}
          wallets. {fz.global.monthLabel}: {fmtInt(fz.global.monthFreezes)}{" "}
          freezes. The biggest single freeze: $
          {fmtInt(fz.global.biggest.amount)} on {fz.global.biggest.chain},{" "}
          {fz.global.biggest.date}, {fz.global.biggest.note}.
        </p>
        <p className="mt-2 text-xs text-[var(--fg-faint)]">
          All-chains record:{" "}
          <a
            href={fz.global.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--data)] underline"
          >
            {fz.global.source}
          </a>
          , as of {fz.global.asOf}. Arc and Ethereum figures are read live
          by Vibrain from the USDC contracts on every load.
        </p>
      </div>
    </section>
  );
}

export function VibrainLive() {
  const [data, setData] = useState<VibrainData | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
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
    async function loadHistory() {
      try {
        const res = await fetch("/api/vibrain/history", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (alive && Array.isArray(json.points)) setHistory(json.points);
      } catch {
        // sparkline simply stays absent on failure
      }
    }
    loadHistory();
    const hid = setInterval(loadHistory, 300000);
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
      clearInterval(hid);
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
          {/* USDC issued on Arc: live total supply (usdc.cool-style panel) */}
          {data.issued && (
            <div className="mb-10 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--glass)] px-6 py-7 sm:px-8">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="mono-label mb-2">USDC ISSUED ON ARC</p>
                  <p className="font-mono text-5xl font-bold tracking-tight text-[var(--fg)] sm:text-6xl">
                    {fmtBig(data.issued.total)}
                  </p>
                  <p className="mt-2 font-mono text-sm text-[var(--fg-muted)]">
                    {"$" + fmtInt(Math.floor(data.issued.total))} exactly
                  </p>
                  <p className="mt-3 max-w-md text-sm text-[var(--fg-muted)]">
                    Total supply of native USDC on Arc, read live from the
                    USDC contract. Growth compares against the supply at the
                    block closest to that time.
                    {data.issued.sharePct !== null &&
                      " That is about " +
                        data.issued.sharePct.toFixed(2) +
                        "% of all USDC in circulation (global total: DefiLlama)."}
                  </p>
                  <a
                    href={
                      "https://twitter.com/intent/tweet?text=" +
                      encodeURIComponent(
                        "USDC issued on Arc: $" +
                          fmtInt(Math.floor(data.issued.total)) +
                          " and counting. Vibrain reads it live, straight from the USDC contract: ",
                      ) +
                      encodeURIComponent("https://arcswap-lac.vercel.app/vibrain")
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--line)] px-4 text-sm font-semibold text-[var(--fg)] transition-colors hover:bg-[var(--glass-strong)]"
                  >
                    Share on X
                  </a>
                </div>
                <TokenCoinIssued />
              </div>
              <div className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--line)] sm:grid-cols-4">
                {(
                  [
                    ["PAST HOUR", data.issued.hour],
                    ["PAST 24 HOURS", data.issued.day],
                    ["PAST WEEK", data.issued.week],
                    ["PAST MONTH", data.issued.month],
                  ] as const
                )
                  .filter(([, w]) => w !== null)
                  .map(([label, w]) => (
                    <div key={label} className="bg-[var(--bg-raised)] px-4 py-3.5">
                      <p className="mono-label mb-1">{label}</p>
                      <p className="font-mono text-base font-semibold text-emerald-600">
                        {(w!.pct >= 0 ? "+" : "") + w!.pct.toFixed(2) + "%"}
                      </p>
                      <p className="font-mono text-xs text-[var(--fg-muted)]">
                        {fmtDelta(w!.delta)}
                      </p>
                    </div>
                  ))}
              </div>
              <Sparkline points={history} />
            </div>
          )}

          <FreezePanel />

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

          {/* Notable moves: the window's biggest transfers as one-line stories */}
          {data.transfers.length > 0 && (
            <section className="mb-10">
              <h2 className="mono-label mb-4 !text-[var(--fg-muted)]">
                NOTABLE MOVES, LAST ~10 MIN
              </h2>
              <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {[...data.transfers]
                  .sort((a, b) => b.amount - a.amount)
                  .slice(0, 3)
                  .map((t, i) => (
                    <a
                      key={"nm" + i}
                      href={"https://explorer.arc.io/tx/" + t.txHash}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3"
                    >
                      <span className="font-mono text-base font-semibold text-[var(--fg)]">
                        ${fmtUsd(t.amount)}
                      </span>
                      <span className="text-sm text-[var(--fg-muted)] group-hover:text-[var(--fg)]">
                        {sideText(t.fromLabel, t.from)} {" -> "}{" "}
                        {sideText(t.toLabel, t.to)}
                      </span>
                      <span className="text-xs text-[var(--fg-faint)]">
                        {ago(
                          (data.latestBlock - t.blockNumber) *
                            data.blockTimeSec,
                        )}
                      </span>
                    </a>
                  ))}
              </div>
            </section>
          )}

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
                        {sideText(t.fromLabel, t.from)} {" -> "}{" "}
                        {sideText(t.toLabel, t.to)}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-[var(--fg-faint)]">
                        block #{fmtInt(t.blockNumber)} .{" "}
                        {ago((data.latestBlock - t.blockNumber) * data.blockTimeSec)}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {t.fromLabel === "New USDC (mint)" && (
                        <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                          ISSUED
                        </span>
                      )}
                      {t.toLabel === "USDC (burn)" && (
                        <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                          BURN
                        </span>
                      )}
                      {(t.fromLabel?.startsWith("VibeFlow") ||
                        t.toLabel?.startsWith("VibeFlow")) && (
                        <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-semibold text-white">
                          VIBEFLOW
                        </span>
                      )}
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
              <p className="mt-6 border-t border-[var(--line)] pt-4 text-xs leading-relaxed text-[var(--fg-faint)]">
                How to check this yourself: every figure on this page is read
                live from the Arc mainnet RPC when you load it. Issued is the
                totalSupply of the{" "}
                <a
                  href="https://explorer.arc.io/token/0x3600000000000000000000000000000000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--data)] underline"
                >
                  native USDC contract
                </a>
                ; growth windows compare against the supply at the block
                closest to that time; the 24 hour line uses hourly archive
                reads. Nothing on this page is stored, cached or edited by
                hand.
              </p>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
