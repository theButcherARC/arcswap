"use client";

import Link from "next/link";
import { useAccount, useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import { TOKENS } from "@/constants/tokens";
import { ROUTES } from "@/constants/routes";

const ERC20_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

function fmtBal(v: bigint | undefined, decimals: number): string {
  if (v === undefined) return "...";
  const n = Number(formatUnits(v, decimals));
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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
        ]
      : [],
    query: { enabled: !!address, refetchInterval: 20000 },
  });

  const usdc = data?.[0]?.result as bigint | undefined;
  const eurc = data?.[1]?.result as bigint | undefined;

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

      {/* Balance strip */}
      <div className="mb-6 grid grid-cols-2 overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--glass)]">
        <div className="px-5 py-4">
          <p className="mono-label mb-1.5">USDC BALANCE</p>
          <p className="font-mono text-xl font-semibold text-[var(--fg)]">
            {isConnected ? fmtBal(usdc, TOKENS.USDC.decimals) : "Connect wallet"}
          </p>
        </div>
        <div className="border-l border-[var(--line)] px-5 py-4">
          <p className="mono-label mb-1.5">EURC BALANCE</p>
          <p className="font-mono text-xl font-semibold text-[var(--fg)]">
            {isConnected ? fmtBal(eurc, TOKENS.EURC.decimals) : "Connect wallet"}
          </p>
        </div>
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
            className="rounded-full border border-[var(--line)] px-4 py-2 text-sm text-[var(--fg-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--fg)]"
          >
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
