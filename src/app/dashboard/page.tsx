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

type TxStatus = "confirmed" | "failed";

interface ArcScanTx {
  hash: string;
  timeStamp: string;
  value: string;
  isError: string;
  from?: string;
  to?: string;
}

interface Transaction {
  date: string;
  timestampMs: number;
  amount: number;
  status: TxStatus;
  txHash: string;
}

const STATUS_STYLES: Record<TxStatus, string> = {
  confirmed: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
  failed: "border-rose-500/25 bg-rose-500/10 text-rose-400",
};

const STATUS_LABELS: Record<TxStatus, string> = {
  confirmed: "Confirmed",
  failed: "Failed",
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function truncateHash(hash: string): string {
  return hash.slice(0, 8) + "..." + hash.slice(-6);
}

function formatUsdc(amount: number): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

async function fetchTransactions(url: string): Promise<Transaction[]> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch transactions from ArcScan");
  }
  const json = await res.json();
  const list: ArcScanTx[] = Array.isArray(json?.result) ? json.result : [];
  return list
    .filter((tx) => tx?.hash && tx?.timeStamp)
    .map((tx) => {
      const timestampMs = Number(tx.timeStamp) * 1000;
      return {
        date: new Date(timestampMs).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        timestampMs,
        amount: Number(tx.value) / 1e6,
        status: (tx.isError === "1" ? "failed" : "confirmed") as TxStatus,
        txHash: tx.hash,
      };
    });
}

function buildVolumeData(
  transactions: Transaction[]
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
  for (const tx of transactions) {
    if (tx.status !== "confirmed") continue;
    for (const bucket of days) {
      if (tx.timestampMs >= bucket.start && tx.timestampMs < bucket.end) {
        bucket.volume += tx.amount;
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

  const apiUrl =
    isConnected && address
      ? "https://testnet.arcscan.app/api?module=account&action=txlist&address=" +
        address +
        "&sort=desc"
      : null;

  const { data: transactions, error, isLoading } = useSWR(
    apiUrl,
    fetchTransactions,
    { revalidateOnFocus: false }
  );

  const txs = transactions ?? [];
  const confirmedTxs = txs.filter((tx) => tx.status === "confirmed");
  const totalVolume = confirmedTxs.reduce((sum, tx) => sum + tx.amount, 0);
  const volumeData = buildVolumeData(txs);
  const recentTxs = txs.slice(0, 10);

  const stats = [
    {
      label: "Total Volume",
      value: "$" + formatUsdc(totalVolume),
      sub: "USDC",
    },
    { label: "Transactions", value: String(txs.length), sub: "all time" },
    {
      label: "Confirmed",
      value: String(confirmedTxs.length),
      sub: "successful",
    },
    {
      label: "Failed",
      value: String(txs.length - confirmedTxs.length),
      sub: "reverted",
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

            {/* Transactions table */}
            <section
              aria-label="Recent transactions"
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl"
            >
              <div className="border-b border-white/10 px-5 py-4 sm:px-6">
                <h2 className="text-base font-semibold text-white sm:text-lg">
                  Recent Transactions
                </h2>
              </div>
              {isLoading ? (
                <div className="px-6 py-12 text-center text-sm text-gray-400">
                  Loading transactions...
                </div>
              ) : error ? (
                <div className="px-6 py-12 text-center text-sm text-rose-400">
                  Failed to load transactions from ArcScan. Please try again
                  later.
                </div>
              ) : recentTxs.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-gray-400">
                  No transactions found for this wallet.
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
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-gray-400 sm:px-6"
                        >
                          Amount
                        </th>
                        <th
                          scope="col"
                          className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-gray-400 sm:px-6"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-gray-400 sm:px-6"
                        >
                          Tx Hash
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTxs.map((tx) => (
                        <tr
                          key={tx.txHash}
                          className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.03]"
                        >
                          <td className="whitespace-nowrap px-5 py-4 text-gray-300 sm:px-6">
                            {tx.date}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 font-medium text-white sm:px-6">
                            {formatUsdc(tx.amount)} USDC
                          </td>
                          <td className="px-5 py-4 sm:px-6">
                            <span
                              className={
                                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium " +
                                STATUS_STYLES[tx.status]
                              }
                            >
                              {STATUS_LABELS[tx.status]}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                            <a
                              href={
                                "https://testnet.arcscan.app/tx/" + tx.txHash
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-xs text-violet-400 transition-colors hover:text-violet-300 hover:underline"
                            >
                              {truncateHash(tx.txHash)}
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
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
