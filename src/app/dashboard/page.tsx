"use client";

import { useAccount } from "wagmi";
import useSWR from "swr";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TokenTx {
  hash: string;
  timeStamp: string;
  from: string;
  to: string;
  value: string;
  tokenSymbol?: string;
  tokenDecimal?: string;
}

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

const MULTICALL_CONTRACT = "0x522fAf9A91c41c443c66765030741e4AaCe147D0";

interface NormalTx {
  hash: string;
  to: string;
}

async function fetchBulkPays(wallet: string): Promise<BulkPay[]> {
  const lower = wallet.toLowerCase();
  const base =
    "https://testnet.arcscan.app/api?module=account&address=" +
    wallet +
    "&sort=desc";

  // 1) normal txns to identify which hashes went through the bulk-pay contract
  // 2) token transfers to read the real USDC amounts per recipient
  const [txlistRes, tokentxRes] = await Promise.all([
    fetch(base + "&action=txlist"),
    fetch(base + "&action=tokentx"),
  ]);
  if (!txlistRes.ok || !tokentxRes.ok) {
    throw new Error("Failed to fetch data from ArcScan");
  }
  const txlistJson = await txlistRes.json();
  const tokentxJson = await tokentxRes.json();

  const normalTxs: NormalTx[] = Array.isArray(txlistJson?.result)
    ? txlistJson.result
    : [];
  const list: TokenTx[] = Array.isArray(tokentxJson?.result)
    ? tokentxJson.result
    : [];

  // Only transactions routed through the Multicall3From (bulk-pay) contract
  const bulkPayHashes = new Set(
    normalTxs
      .filter((t) => t?.to?.toLowerCase() === MULTICALL_CONTRACT.toLowerCase())
      .map((t) => t.hash)
  );

  // Keep only outgoing USDC transfers that belong to a real bulk payment
  const outgoing = list.filter(
    (tx) =>
      tx?.hash &&
      tx?.timeStamp &&
      bulkPayHashes.has(tx.hash) &&
      tx?.from?.toLowerCase() === lower &&
      (tx.tokenSymbol ? tx.tokenSymbol.toUpperCase() === "USDC" : true)
  );

  // Group transfers by transaction hash — one hash = one bulk payment
  const groups = new Map<string, TokenTx[]>();
  for (const tx of outgoing) {
    const existing = groups.get(tx.hash);
    if (existing) {
      existing.push(tx);
    } else {
      groups.set(tx.hash, [tx]);
    }
  }

  const bulkPays: BulkPay[] = [];
  groups.forEach((transfers, hash) => {
    const timestampMs = Number(transfers[0].timeStamp) * 1000;
    const decimals = Number(transfers[0].tokenDecimal ?? "6") || 6;
    const divisor = Math.pow(10, decimals);

    const recipients: Recipient[] = transfers.map((t, index) => ({
      name: "Recipient " + (index + 1),
      address: t.to,
      amount: Number(t.value) / divisor,
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

  const swrKey = isConnected && address ? address.toLowerCase() : null;

  const { data: bulkPays, error, isLoading } = useSWR(swrKey, fetchBulkPays, {
    revalidateOnFocus: false,
  });

  const payments = bulkPays ?? [];
  const lastBulkPay = payments[0] ?? null;
  const volumeData = buildVolumeData(payments);

  const totalVolume = payments.reduce((sum, bp) => sum + bp.total, 0);
  const totalRecipients = payments.reduce(
    (sum, bp) => sum + bp.recipients.length,
    0
  );

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
    <main className="min-h-screen bg-[#050508] px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        {/* Header */}
        <header className="flex flex-col gap-2">
          <h1 className="text-balance bg-gradient-to-r from-violet-400 via-[#7c3aed] to-violet-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
            Dashboard
          </h1>
          <p className="text-sm text-gray-400 sm:text-base">
            Payment history and analytics
          </p>
        </header>

        {!isConnected ? (
          <section
            aria-label="Wallet connection required"
            className="rounded-2xl border border-white/10 bg-white/5 px-6 py-16 text-center backdrop-blur-2xl"
          >
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
            <section aria-label="Key statistics">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-2xl"
                  >
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                      {isLoading ? "—" : stat.value}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">{stat.sub}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Volume chart */}
            <section
              aria-label="Volume over the last 7 days"
              className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-2xl sm:p-6"
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
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl"
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
                <div className="px-6 py-12 text-center text-sm text-gray-400">
                  Loading payment history...
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
