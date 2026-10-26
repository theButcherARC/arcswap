"use client";

import Link from "next/link";
import { useAccount, useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import { TOKENS } from "@/constants/tokens";
import { ROUTES } from "@/constants/routes";
import { TokenCoin } from "@/components/TokenCoin";

const ERC20_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

function fmtBal(
  v: bigint | undefined,
  decimals: number,
  maxFrac = 2,
): string {
  if (v === undefined) return "...";
  const n = Number(formatUnits(v, decimals));
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxFrac,
  });
}

export function HomeTop() {
  const { address, isConnected } = useAccount();

  const { data } = useReadContracts({
    contracts: address
      ? [
          {
            address: TOKENS.USDC.address as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "balanceOf",
            args: [address],
          },
          {
            address: TOKENS.EURC.address as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "balanceOf",
            args: [address],
          },
          {
            address: TOKENS.cirBTC.address as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "balanceOf",
            args: [address],
          },
        ]
      : [],
    query: { enabled: !!address, refetchInterval: 20000 },
  });

  const balances = [
    {
      symbol: "USDC",
      label: "USDC BALANCE",
      value: fmtBal(data?.[0]?.result as bigint | undefined, TOKENS.USDC.decimals),
    },
    {
      symbol: "EURC",
      label: "EURC BALANCE",
      value: fmtBal(data?.[1]?.result as bigint | undefined, TOKENS.EURC.decimals),
    },
    {
      symbol: "cirBTC",
      label: "CIRBTC BALANCE",
      value: fmtBal(
        data?.[2]?.result as bigint | undefined,
        TOKENS.cirBTC.decimals,
        6,
      ),
    },
  ];

  return (
    <div className="mb-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--fg)] sm:text-4xl">
          HOME
        </h1>
        <p className="mt-2 text-sm text-[var(--fg-muted)]">
          Your money and your people, in one place.
        </p>
      </div>

      {/* Balance cards: one coin per token */}
      <div className="mb-6 grid grid-cols-1 overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--glass)] sm:grid-cols-3">
        {balances.map((b, i) => (
          <div
            key={b.symbol}
            className={`flex items-center gap-3.5 px-5 py-4 ${
              i > 0
                ? "border-t border-[var(--line)] sm:border-l sm:border-t-0"
                : ""
            }`}
          >
            <TokenCoin symbol={b.symbol} size={40} />
            <div className="min-w-0">
              <p className="mono-label mb-1">{b.label}</p>
              {isConnected ? (
                <p className="truncate font-mono text-xl font-semibold text-[var(--fg)]">
                  {b.value}
                </p>
              ) : (
                <p className="text-sm text-[var(--fg-muted)]">Connect wallet</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2.5">
        {[
          { label: "Send a batch", href: ROUTES.BULK_PAY },
          { label: "Describe it to the agent", href: ROUTES.BULK_PAY },
          { label: "Schedule a payment", href: ROUTES.SCHEDULED },
          { label: "Watch Arc live", href: ROUTES.VIBRAIN },
        ].map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="rounded-full border border-[var(--line)] px-4 py-3 text-sm text-[var(--fg-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--fg)]"
          >
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
