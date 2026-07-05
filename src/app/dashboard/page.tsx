"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const STATS = [
  { label: "Total Volume", value: "$12,450", sub: "USDC" },
  { label: "Transactions", value: "24", sub: "all time" },
  { label: "Recipients", value: "87", sub: "unique" },
  { label: "Fees Paid", value: "$24.90", sub: "USDC" },
];

const VOLUME_DATA = [
  { day: "Mon", volume: 1200 },
  { day: "Tue", volume: 2400 },
  { day: "Wed", volume: 800 },
  { day: "Thu", volume: 3100 },
  { day: "Fri", volume: 1950 },
  { day: "Sat", volume: 1400 },
  { day: "Sun", volume: 1600 },
];

type TxStatus = "confirmed" | "pending" | "failed";

interface Transaction {
  date: string;
  recipients: number;
  amount: string;
  status: TxStatus;
  txHash: string;
}

const TRANSACTIONS: Transaction[] = [
  {
    date: "Jul 4, 2026",
    recipients: 12,
    amount: "2,400.00 USDC",
    status: "confirmed",
    txHash: "0x8f3ac2e91b47d5a6e0c1f92384bd7e615a29c8d40f6b3712ea95d80c4b16f3a7",
  },
  {
    date: "Jul 3, 2026",
    recipients: 8,
    amount: "1,150.50 USDC",
    status: "confirmed",
    txHash: "0x2b7de104c8a3f5962d41e80b7c5a9f3061d4e82c95ab07f318c6d24e90a5b1c8",
  },
  {
    date: "Jul 2, 2026",
    recipients: 25,
    amount: "5,000.00 USDC",
    status: "pending",
    txHash: "0x6a1fc8e340b2d795a8e3c60d19f4b2871e05a3d6c48b92f057ea1d38c72e04b9",
  },
  {
    date: "Jul 1, 2026",
    recipients: 5,
    amount: "780.25 USDC",
    status: "confirmed",
    txHash: "0xd40b92a7c1e58f36094ab2d8e67c30f512b8a94e06d1c75f38a2e60b9d41c5a2",
  },
  {
    date: "Jun 30, 2026",
    recipients: 3,
    amount: "320.00 USDC",
    status: "failed",
    txHash: "0x95c3e70a2d84b1f6538ea9c04d72b6e801f5a2c397d40e86b1a53f92c08d67e4",
  },
];

const STATUS_STYLES: Record<TxStatus, string> = {
  confirmed: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
  pending: "border-amber-500/25 bg-amber-500/10 text-amber-400",
  failed: "border-rose-500/25 bg-rose-500/10 text-rose-400",
};

const STATUS_LABELS: Record<TxStatus, string> = {
  confirmed: "Confirmed",
  pending: "Pending",
  failed: "Failed",
};

function truncateHash(hash: string): string {
  return hash.slice(0, 8) + "..." + hash.slice(-6);
}

export default function DashboardPage() {
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

        {/* Stats */}
        <section aria-label="Key statistics">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-2xl"
              >
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                  {stat.value}
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
                data={VOLUME_DATA}
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
                    Recipients
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
                {TRANSACTIONS.map((tx) => (
                  <tr
                    key={tx.txHash}
                    className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.03]"
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-gray-300 sm:px-6">
                      {tx.date}
                    </td>
                    <td className="px-5 py-4 text-gray-300 sm:px-6">
                      {tx.recipients}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-white sm:px-6">
                      {tx.amount}
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
                        href={"https://testnet.arcscan.app/tx/" + tx.txHash}
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
        </section>
      </div>
    </main>
  );
}
