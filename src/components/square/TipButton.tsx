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

export function TipButton({
  to,
  handle,
}: {
  to: string;
  handle: string | null;
}) {
  const { address, isConnected } = useAccount();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("1");
  const [note, setNote] = useState<string | null>(null);
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const isSelf =
    !!address && address.toLowerCase() === to.toLowerCase();
  if (isSelf) return null;

  function send() {
    setNote(null);
    let value: bigint;
    try {
      value = parseUnits(amount.trim(), TOKENS.USDC.decimals);
    } catch {
      setNote("That amount does not look right, try again.");
      return;
    }
    if (value <= 0n) {
      setNote("Amount must be more than zero.");
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
              : "Tip failed, please try again.",
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
          Tipped. View tx
        </a>
      </span>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => {
          if (!isConnected) {
            setNote("Connect your wallet first to tip.");
            setOpen(true);
            return;
          }
          setOpen(true);
        }}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--line)] px-4 py-3 text-xs font-medium text-[var(--fg-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--fg)]"
      >
        <TokenCoin symbol="USDC" size={18} />
        Tip USDC
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5">
        {["1", "5", "10"].map((preset) => (
          <button
            key={preset}
            onClick={() => setAmount(preset)}
            className={`min-h-[44px] rounded-full border px-3.5 font-mono text-xs transition-colors ${
              amount === preset
                ? "border-[var(--accent)] text-[var(--fg)]"
                : "border-[var(--line)] text-[var(--fg-muted)] hover:border-[var(--accent)] hover:text-[var(--fg)]"
            }`}
          >
            {preset}
          </button>
        ))}
      </div>
      <div className="flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--line)] px-3">
        <TokenCoin symbol="USDC" size={20} />
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="decimal"
          className="w-16 bg-transparent font-mono text-base text-[var(--fg)] outline-none"
          aria-label="Tip amount in USDC"
        />
        <span className="text-xs text-[var(--data)]">USDC</span>
      </div>
      <button
        onClick={send}
        disabled={isPending || confirming || !isConnected}
        className="inline-flex min-h-[44px] items-center rounded-full bg-[var(--accent)] px-5 text-xs font-semibold text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPending
          ? "Check your wallet..."
          : confirming
            ? "Settling..."
            : "Send tip" + (handle ? " to @" + handle : "")}
      </button>
      <button
        onClick={() => setOpen(false)}
        className="inline-flex min-h-[44px] items-center px-2 text-xs text-[var(--fg-faint)] hover:text-[var(--fg)]"
      >
        Cancel
      </button>
      {note && (
        <span className="w-full text-xs text-[var(--fg-muted)]">{note}</span>
      )}
    </div>
  );
}
