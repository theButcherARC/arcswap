"use client";

import { useState } from "react";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { parseUnits } from "viem";
import { TOKENS } from "@/constants/tokens";
import { TokenCoin } from "@/components/TokenCoin";

const ERC20_ABI = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

/**
 * Pays one Square pay request: the exact requested USDC amount,
 * straight to the requester's wallet. No platform fee, no escrow.
 * The requester closes the request once the money lands.
 */
export function PayRequestButton({
  to,
  amount,
  handle,
}: {
  to: string;
  amount: string;
  handle: string | null;
}) {
  const { address, isConnected } = useAccount();
  const [note, setNote] = useState<string | null>(null);
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const isSelf = !!address && address.toLowerCase() === to.toLowerCase();
  if (isSelf) return null;

  function pay() {
    setNote(null);
    if (!isConnected) {
      setNote("Connect your wallet first to pay.");
      return;
    }
    let value: bigint;
    try {
      value = parseUnits(amount, TOKENS.USDC.decimals);
    } catch {
      setNote("That amount does not look right.");
      return;
    }
    writeContract(
      {
        address: TOKENS.USDC.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [to as `0x${string}`, value],
      },
      {
        onError: (e) =>
          setNote(
            e.message.includes("rejected")
              ? "Cancelled in the wallet."
              : "Payment failed, please try again.",
          ),
      },
    );
  }

  if (isSuccess && hash) {
    return (
      <span className="inline-flex min-h-[44px] items-center gap-2">
        <TokenCoin symbol="USDC" size={18} />
        <a
          href={"https://explorer.arc.io/tx/" + hash}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-[var(--accent)]"
        >
          Paid. View tx
        </a>
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        onClick={pay}
        disabled={isPending || confirming}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--accent)] px-5 text-xs font-semibold text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <TokenCoin symbol="USDC" size={18} />
        {isPending
          ? "Check your wallet..."
          : confirming
            ? "Settling..."
            : "Pay " + amount + " USDC" + (handle ? " to @" + handle : "")}
      </button>
      {note && <span className="text-xs text-[var(--fg-muted)]">{note}</span>}
    </span>
  );
}
