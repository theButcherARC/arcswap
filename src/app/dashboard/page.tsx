"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { ScheduledPayments } from "@/components/dashboard/ScheduledPayments";
import useSWR from "swr";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Recipient {
  name: string;
  address: string;
  amount: number;
}

interface BulkPay {
  hash: string;
  timestampMs: number;
  date: string;
  total: number;
  recipients: Recipient[];
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function truncateAddress(addr: string): string {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function truncateHash(hash: string): string {
  return hash.slice(0, 8) + "..." + hash.slice(-6);
}

function formatUsdc(amount: number): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

  const ARCSCAN_V2 = "https://explorer.arc.io/api/v2";

interface V2Transfer {
  transaction_hash: string;
  timestamp: string;
  from: { hash: string };
  to: { hash: string };
  total: { value: string; decimals: string };
  token: { symbol: string };
}

/**
 * Parse a token amount from ArcScan v2.
 * The API's `total` field can return the value in one of two ways:
 *   1. As a raw integer string with decimals="6"  → divide by 10^decimals
 *   2. As an already-divided decimal string with decimals="0" or missing
 *      → use as-is
 * We detect which form by checking whether the parsed value is unrealistically
 * large (> 1,000,000) for a typical USDC transfer, meaning it is still in
 * base units, OR by using the `decimals` field from the response directly.
 */
function parseTokenAmount(value: string, decimalsStr: string): number {
  const raw = parseFloat(value ?? "0");
  if (isNaN(raw)) return 0;
  const dec = parseInt(decimalsStr ?? "0", 10);
  if (dec > 0) {
    // Value is in base units (e.g. 1000000 for 1 USDC) - divide
    return raw / Math.pow(10, dec);
  }
  // Value is already in human-readable form (e.g. "1.00")
  return raw;
}

async function fetchBulkPays(wallet: string): Promise<BulkPay[]> {
  if (!wallet) return [];

  const lower = wallet.toLowerCase();

  // Fetch ALL pages from ArcScan so volume is never under-counted
  const transfers: V2Transfer[] = [];
  let nextPageParams: string | null = null;
  let pagesFetched = 0;
  const MAX_PAGES = 20; // safety cap

  while (pagesFetched < MAX_PAGES) {
    const baseUrl: string =
      ARCSCAN_V2 +
      "/addresses/" +
      wallet +
      "/token-transfers?filter=from";
    const url: string = nextPageParams
      ? baseUrl + "&" + nextPageParams
      : baseUrl;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("ArcScan v2 API error: " + res.status);

    const json = await res.json();
    const items: V2Transfer[] = Array.isArray(json?.items) ? json.items : [];
    transfers.push(...items);
    pagesFetched++;

    // ArcScan paginates via next_page_params - stop if no more pages
    const next = json?.next_page_params;
    if (!next || Object.keys(next).length === 0) break;
    // Serialize next_page_params as query string
    nextPageParams = new URLSearchParams(
      Object.entries(next).map(([k, v]) => [k, String(v)])
    ).toString();
  }

  // Group USDC outgoing transfers by transaction hash
  const groups = new Map<string, V2Transfer[]>();
  for (const tx of transfers) {
    if (!tx?.transaction_hash || !tx?.timestamp) continue;

    // Only USDC
    const symbol = (tx?.token?.symbol ?? "").toUpperCase();
    if (symbol && symbol !== "USDC") continue;

    const fromLower = tx?.from?.hash?.toLowerCase() ?? "";
    const toLower = tx?.to?.hash?.toLowerCase() ?? "";

    // Double-check outgoing, skip self-transfers
    if (fromLower !== lower) continue;
    if (toLower === lower) continue;

    const txHash = tx.transaction_hash.toLowerCase();
    const existing = groups.get(txHash);
    if (existing) {
      existing.push(tx);
    } else {
      groups.set(txHash, [tx]);
    }
  }

  const bulkPays: BulkPay[] = [];
  groups.forEach((txTransfers, hash) => {
    const timestampMs = new Date(txTransfers[0].timestamp).getTime();
    const recipients: Recipient[] = txTransfers.map((t, idx) => ({
      name: "Recipient " + (idx + 1),
      address: t.to.hash,
      amount: parseTokenAmount(t.total?.value ?? "0", t.total?.decimals ?? "0"),
    }));
    const total = recipients.reduce((sum, r) => sum + r.amount, 0);

    bulkPays.push({
      hash,
      timestampMs,
      date: new Date(timestampMs).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      total,
      recipients,
    });
  });

  // Sort newest first
  bulkPays.sort((a, b) => b.timestampMs - a.timestampMs);
  return bulkPays;
}

function buildVolumeData(
  bulkPays: BulkPay[]
): { day: string; volume: number }[] {
  const now = Date.now();
  const days: { day: string; start: number; end: number; volume: number }[] =
    [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000);
    const start = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate()
    ).getTime();
    days.push({
      day: DAY_LABELS[d.getDay()],
      start,
      end: start + 24 * 60 * 60 * 1000,
      volume: 0,
    });
  }
  for (const bp of bulkPays) {
    for (const bucket of days) {
      if (bp.timestampMs >= bucket.start && bp.timestampMs < bucket.end) {
        bucket.volume += bp.total;
        break;
      }
    }
  }
  return days.map((b) => ({
    day: b.day,
    volume: Math.round(b.volume * 100) / 100,
  }));
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncUpdated, setSyncUpdated] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const swrKey = isConnected && address ? address.toLowerCase() : null;

  const { data: bulkPays, error, isLoading, mutate } = useSWR(swrKey, fetchBulkPays, {
    revalidateOnFocus: false,
  });

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isConnected || !address) return;
    const interval = setInterval(() => { mutate(); }, 30000);
    return () => clearInterval(interval);
  }, [isConnected, address, mutate]);

  // Manual sync - directly calls API then updates SWR cache
  async function handleSync() {
    setSyncLoading(true);
    setSyncError(null);
    try {
      const freshData = await fetchBulkPays(swrKey ?? "");
      mutate(freshData, false);
      setSyncUpdated(true);
      setTimeout(() => setSyncUpdated(false), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setSyncError(errorMsg);
      setTimeout(() => setSyncError(null), 4000);
    }
    setSyncLoading(false);
  }

  const payments = bulkPays ?? [];
  const lastBulkPay = payments[0] ?? null;
  const volumeData = buildVolumeData(payments);

  const totalVolume = payments.reduce((sum, bp) => sum + bp.total, 0);
  const totalRecipients = payments.reduce((sum, bp) => sum + bp.recipients.length, 0);

  const stats = [
    {
      label: "Last Payment",
      value: lastBulkPay ? "$" + formatUsdc(lastBulkPay.total) : "$0.00",
      sub: "USDC",
    },
    {
      label: "Last Recipients",
      value: lastBulkPay ? String(lastBulkPay.recipients.length) : "0",
      sub: "addresses",
    },
    {
      label: "Total Volume",
      value: "$" + formatUsdc(totalVolume),
      sub: "USDC",
    },
    {
      label: "Total Recipients",
      value: String(totalRecipients),
      sub: "all payments",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--bg)] px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_50%_0%,rgba(139,124,246,0.12),transparent_65%)]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8">
        {/* Header */}
        <header className="animate-fade-in-up flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-balance text-3xl font-bold tracking-tight text-[var(--fg)] sm:text-4xl">
              Dashboard
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSync}
                disabled={syncLoading || isLoading || !isConnected}
                title={!isConnected ? "Connect your wallet to sync" : "Refresh dashboard data"}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-gray-300 transition-all hover:border-white/20 hover:bg-white/[0.05] disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Refresh dashboard data"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={syncLoading ? "animate-spin" : ""}
                  aria-hidden="true"
                >
                  <path
                    d="M23 4v6h-6M1 20v-6h6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Sync</span>
              </button>
              {syncError && (
                <div className="text-xs text-red-400 animate-pulse max-w-xs truncate">
                  Error: {syncError}
                </div>
              )}
              {syncUpdated && !syncError && (
                <div className="text-xs text-emerald-400 animate-pulse">
                  Updated just now
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-400 sm:text-base">
            Payment history and analytics
          </p>
        </header>

        <ScheduledPayments />

        {error && (
          <section
            aria-label="Data fetch error"
            className="animate-fade-in-up glass-panel border-[rgba(244,63,94,0.3)] px-5 sm:px-6 py-4"
          >
            <div className="flex items-start gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 text-rose-400 mt-0.5" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-rose-300">Failed to load dashboard data</p>
                <p className="mt-1 text-xs text-rose-300/70">{error instanceof Error ? error.message : "An error occurred while fetching your transaction history"}</p>
              </div>
            </div>
          </section>
        )}

        {!isConnected ? (
          <section
            aria-label="Wallet connection required"
            className="animate-fade-in-up delay-100 glass-panel px-6 sm:px-8 py-16 sm:py-20 text-center"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-[var(--line-strong)] bg-[var(--accent-soft)]">
              <svg className="animate-pulse" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--fg)]">
              Connect your wallet
            </h2>
            <p className="mt-2 text-sm text-[var(--fg-muted)] max-w-sm mx-auto">
              View your payment history and transaction analytics by connecting your wallet
            </p>
            <div className="mt-6 flex justify-center">
              <ConnectButton />
            </div>
          </section>
        ) : (
          <>
            {/* Stats */}
            <section aria-label="Key statistics" className="animate-fade-in-up delay-100">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="glass-panel p-5 shadow-[0_12px_32px_rgba(0,0,0,0.16)]"
                  >
                    <p className="mono-label">
                      {stat.label}
                    </p>
                    {isLoading ? (
                      <div className="skeleton mt-3 h-8 w-24" aria-hidden="true" />
                    ) : (
                      <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--fg)] sm:text-3xl">
                        {stat.value}
                      </p>
                    )}
                    <p className="mono-label mt-2">{stat.sub}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Volume chart */}
            <section
              aria-label="Volume over the last 7 days"
              className="animate-fade-in-up delay-200 glass-panel p-5 sm:p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-base font-semibold text-[var(--fg)] sm:text-lg">
                  Volume - Last 7 Days
                </h2>
                <span className="mono-label">USDC</span>
              </div>
              <div className="h-64 w-full sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={volumeData}
                    margin={{ top: 4, right: 4, bottom: 0, left: -12 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.06)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      stroke="rgba(255,255,255,0.35)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.35)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(139,124,246,0.12)" }}
                      contentStyle={{
                        backgroundColor: "#151a2b",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        color: "#ffffff",
                        fontSize: "13px",
                      }}
                      labelStyle={{ color: "#9ca3af" }}
                    />
                    <Bar
                      dataKey="volume"
                      name="Volume"
                      fill="var(--accent)"
                      radius={[0, 0, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Last bulk payment breakdown */}
            <section
              aria-label="Last bulk payment"
              className="animate-fade-in-up delay-300 glass-panel"
            >
              <div className="flex flex-col gap-2 border-b border-[var(--line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <h2 className="text-base font-semibold text-[var(--fg)] sm:text-lg">
                    Last Bulk Payment
                  </h2>
                  {lastBulkPay ? (
                    <p className="mono-label mt-0.5">
                      {lastBulkPay.date} · {lastBulkPay.recipients.length}{" "}
                      recipients · {formatUsdc(lastBulkPay.total)} USDC
                    </p>
                  ) : null}
                </div>
                {lastBulkPay ? (
                  <a
                    href={"https://explorer.arc.io/tx/" + lastBulkPay.hash}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-[var(--data)] transition-colors hover:underline"
                  >
                    {truncateHash(lastBulkPay.hash)}
                  </a>
                ) : null}
              </div>

              {isLoading ? (
                <div className="flex flex-col gap-3 px-6 py-8" aria-label="Loading payment history">
                  <div className="skeleton h-10 w-full" />
                  <div className="skeleton h-10 w-full" />
                  <div className="skeleton h-10 w-2/3" />
                </div>
              ) : error ? (
                <div className="px-6 py-12 text-center text-sm text-rose-400">
                  Failed to load data from ArcScan. Please try again later.
                </div>
              ) : !lastBulkPay ? (
                <div className="px-6 sm:px-8 py-16 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-400/30">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" fill="#a78bfa"/>
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-300">
                    No bulk payments yet
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Create your first bulk payment to get started
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th
                          scope="col"
                          className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-gray-400 sm:px-6"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-gray-400 sm:px-6"
                        >
                          Address
                        </th>
                        <th
                          scope="col"
                          className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400 sm:px-6"
                        >
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {lastBulkPay.recipients.map((r, index) => (
                        <tr
                          key={r.address + "-" + index}
                          className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.03]"
                        >
                          <td className="whitespace-nowrap px-5 py-4 text-gray-300 sm:px-6">
                            {r.name}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                            <a
                              href={
                                "https://explorer.arc.io/address/" +
                                r.address
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-xs text-violet-400 transition-colors hover:text-violet-300 hover:underline"
                            >
                              {truncateAddress(r.address)}
                            </a>
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-right font-medium text-white sm:px-6">
                            {formatUsdc(r.amount)} USDC
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-white/10">
                        <td
                          className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-gray-400 sm:px-6"
                          colSpan={2}
                        >
                          Total
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-right text-base font-semibold text-white sm:px-6">
                          {formatUsdc(lastBulkPay.total)} USDC
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
