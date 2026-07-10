"use client";

import { useAccount } from "wagmi";
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

const ARCSCAN_V2 = "https://testnet.arcscan.app/api/v2";

interface V2Transfer {
  transaction_hash: string;
  timestamp: string;
  from: { hash: string };
  to: { hash: string };
  total: { value: string; decimals: string };
  token: { symbol: string };
}

const USDC_DIVISOR = Math.pow(10, 6);

async function fetchBulkPays(wallet: string): Promise<BulkPay[]> {
  if (!wallet) return [];

  const lower = wallet.toLowerCase();
  // filter=from returns only outgoing transfers — no token/limit/sort params (422 on those)
  const url =
    ARCSCAN_V2 +
    "/addresses/" +
    wallet +
    "/token-transfers?filter=from";

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("ArcScan v2 API error: " + res.status);
  }

  const json = await res.json();
  const transfers: V2Transfer[] = Array.isArray(json?.items) ? json.items : [];

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
      // Always divide by 10^6 for USDC — v2 total.value is in base units
      amount: Number(t.total?.value ?? "0") / USDC_DIVISOR,
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

  // Manual sync — directly calls API then updates SWR cache
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
    <main className="relative min-h-screen overflow-hidden bg-[#050508] px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      {/* Ambient background depth */}
      <div className="pointer-events-none absolute top-0 left-1/4 h-[400px] w-[500px] rounded-full bg-violet-600/[0.05] blur-[130px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-0 h-[350px] w-[400px] rounded-full bg-indigo-600/[0.04] blur-[120px]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8">
        {/* Header */}
        <header className="animate-fade-in-up flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-balance bg-gradient-to-r from-violet-400 via-[#7c3aed] to-violet-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
              Dashboard
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSync}
                disabled={syncLoading || isLoading}
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

        {error && (
          <section
            aria-label="Data fetch error"
            className="animate-fade-in-up rounded-2xl border border-red-500/20 bg-red-500/[0.08] px-6 py-4 backdrop-blur-2xl"
          >
            <div className="flex items-start gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 text-red-400 mt-0.5" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div>
                <p className="text-sm font-medium text-red-300">Failed to load dashboard data</p>
                <p className="mt-1 text-xs text-red-300/70">{error instanceof Error ? error.message : "An error occurred while fetching your transaction history"}</p>
              </div>
            </div>
          </section>
        )}

        {!isConnected ? (
          <section
            aria-label="Wallet connection required"
            className="animate-fade-in-up delay-100 rounded-2xl border border-white/10 bg-white/5 px-6 py-16 text-center backdrop-blur-2xl"
          >
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/[0.08]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-base text-gray-300 sm:text-lg">
              Connect wallet to see your transactions
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Use the Connect Wallet button in the top right to get started.
            </p>
          </section>
        ) : (
          <>
            {/* Stats */}
            <section aria-label="Key statistics" className="animate-fade-in-up delay-100">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="hover-lift rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-2xl"
                  >
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                      {stat.label}
                    </p>
                    {isLoading ? (
                      <div className="skeleton mt-3 h-8 w-24" aria-hidden="true" />
                    ) : (
                      <p className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                        {stat.value}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">{stat.sub}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Volume chart */}
            <section
              aria-label="Volume over the last 7 days"
              className="animate-fade-in-up delay-200 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-2xl sm:p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-base font-semibold text-white sm:text-lg">
                  Volume — Last 7 Days
                </h2>
                <span className="text-xs text-gray-500">USDC</span>
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
                      cursor={{ fill: "rgba(124,58,237,0.08)" }}
                      contentStyle={{
                        backgroundColor: "#0b0b12",
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
                      fill="#7c3aed"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Last bulk payment breakdown */}
            <section
              aria-label="Last bulk payment"
              className="animate-fade-in-up delay-300 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-2xl"
            >
              <div className="flex flex-col gap-2 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <h2 className="text-base font-semibold text-white sm:text-lg">
                    Last Bulk Payment
                  </h2>
                  {lastBulkPay ? (
                    <p className="mt-0.5 text-xs text-gray-500">
                      {lastBulkPay.date} · {lastBulkPay.recipients.length}{" "}
                      recipients · {formatUsdc(lastBulkPay.total)} USDC
                    </p>
                  ) : null}
                </div>
                {lastBulkPay ? (
                  <a
                    href={"https://testnet.arcscan.app/tx/" + lastBulkPay.hash}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-violet-400 transition-colors hover:text-violet-300 hover:underline"
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
                <div className="px-6 py-12 text-center text-sm text-gray-400">
                  No bulk payments found for this wallet.
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
                                "https://testnet.arcscan.app/address/" +
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
