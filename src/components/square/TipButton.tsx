"use client";

import { useEffect, useRef, useState } from "react";
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
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const [amount, setAmount] = useState("1");
  const [note, setNote] = useState<string | null>(null);
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    return () => {
      if (closeTimer.current !== null) {
        window.clearTimeout(closeTimer.current);
      }
    };
  }, []);

  const isSelf =
    !!address && address.toLowerCase() === to.toLowerCase();
  if (isSelf) return null;

  // The composer leaves along the path it entered (drawer pattern):
  // it stays mounted through the pop-out, and reopening mid-exit
  // clears the pending unmount so it never vanishes under the user.
  const clearCloseTimer = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openComposer = () => {
    clearCloseTimer();
    setClosing(false);
    setOpen(true);
  };

  const closeComposer = () => {
    setClosing(true);
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      setOpen(false);
      setClosing(false);
    }, 200);
  };

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
            openComposer();
            return;
          }
          openComposer();
        }}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--line)] px-4 py-3 text-xs font-medium text-[var(--fg-muted)] pressable hover:border-[var(--accent)] hover:text-[var(--fg)]"
      >
        <TokenCoin symbol="USDC" size={18} />
        Tip USDC
      </button>
    );
  }

  return (
    <div
      className={
        "flex flex-wrap items-center gap-2 " +
        (closing ? "animate-pop-out" : "animate-pop-in")
      }
    >
      <div className="flex items-center gap-1.5">
        {["1", "5", "10"].map((preset) => (
          <button
            key={preset}
            onClick={() => setAmount(preset)}
            className={`min-h-[44px] rounded-full border px-3.5 font-mono text-xs pressable ${
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
        className="inline-flex min-h-[44px] items-center rounded-full bg-[var(--accent)] px-5 text-xs font-semibold text-white pressable hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPending
          ? "Check your wallet..."
          : confirming
            ? "Settling..."
            : "Send tip" + (handle ? " to @" + handle : "")}
      </button>
      <button
        onClick={closeComposer}
        className="inline-flex min-h-[44px] items-center px-2 text-xs text-[var(--fg-faint)] transition-opacity hover:text-[var(--fg)] active:opacity-60"
      >
        Cancel
      </button>
      {note && (
        <span className="w-full text-xs text-[var(--fg-muted)]">{note}</span>
      )}
    </div>
  );
}
