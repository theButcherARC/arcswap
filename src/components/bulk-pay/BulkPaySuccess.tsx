"use client";

import React from "react";
import { DEFAULT_CHAIN } from "@/constants/chains";
import PayslipReceipt from "./PayslipReceipt";
import type { BatchResult } from "@/types/bulkPay";

interface BulkPaySuccessProps {
  txHash: string;
  onReset: () => void;
  tokenSymbol?: string;
  /** Full batch result (reconciliation + totals) for the payslip receipt. */
  result?: BatchResult | null;
}

export default function BulkPaySuccess({ txHash, onReset, tokenSymbol = "USDC", result }: BulkPaySuccessProps) {
  const explorerUrl = `${DEFAULT_CHAIN.blockExplorers.default.url}/tx/${txHash}`;

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Success card */}
        <div className="animate-settle-in border border-[var(--line)] bg-[var(--bg-raised)] p-8 sm:p-10 text-center">
          {/* Animated checkmark circle */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-[rgba(18,128,92,0.3)] bg-[var(--success-soft)] text-[var(--success)]">
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="18"
                cy="18"
                r="16"
                stroke="currentColor"
                strokeWidth="2"
                strokeOpacity="0.3"
              />
              <path
                d="M11 18L16 23L25 13"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--fg)] tracking-tight mb-2">
            Payments Sent
          </h2>
          <p className="text-sm text-[var(--fg-faint)] mb-5">
            Your batch transaction has been submitted to Arc
          </p>

          {/* Settlement speed badge */}
          <div className="mb-2 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(18,128,92,0.3)] bg-[var(--success-soft)] px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] animate-pulse" />
              <span className="text-xs font-semibold text-[var(--success)] tracking-wide">
                Settled in {"<"}1s
              </span>
            </span>
          </div>

          {/* Comparison text */}
          <p className="text-xs text-[var(--fg-faint)] mb-8">
            {"Ethereum L1: ~13 min\u2002|\u2002L2s: up to 7 days"}
          </p>

          {/* Transaction hash */}
          <div className="border border-[var(--line)] bg-[var(--bg)] p-4 mb-6">
            <span className="block text-[0.625rem] font-medium text-[var(--fg-faint)] uppercase tracking-wider mb-2">
              Transaction Hash
            </span>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--accent)] hover:opacity-80 font-mono break-all transition-colors duration-200"
            >
              {txHash}
            </a>
          </div>

          {/* Info rows */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="border border-[var(--line)] bg-[var(--bg)] p-3.5">
              <span className="block text-[0.625rem] text-[var(--fg-faint)] uppercase tracking-wider mb-1">
                Network
              </span>
              <span className="text-sm font-medium text-[var(--fg-muted)]">Arc</span>
            </div>
            <div className="border border-[var(--line)] bg-[var(--bg)] p-3.5">
              <span className="block text-[0.625rem] text-[var(--fg-faint)] uppercase tracking-wider mb-1">
                Asset
              </span>
              <span className="text-sm font-medium text-[var(--fg-muted)]">{tokenSymbol}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 border border-[var(--line)] bg-[var(--bg)] px-5 py-3.5 text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] hover:border-[var(--line-strong)] hover:bg-[var(--glass-strong)] pressable"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 2H11C11.5523 2 12 2.44772 12 3V13C12 13.5523 11.5523 14 11 14H6M6 2H5C4.44772 2 4 2.44772 4 3V13C4 13.5523 4.44772 14 5 14H6M6 2V14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              View on Arc Explorer
            </a>
            <button
              type="button"
              onClick={onReset}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[var(--fg)] text-[var(--bg)] px-5 py-3.5 text-sm font-semibold text-[var(--fg)] pressable"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M8 5V8.5L10.5 10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              New Payment
            </button>
          </div>
        </div>

        {/* Payslip receipt: per-line verification read from the chain */}
        {result ? (
          <PayslipReceipt result={result} tokenSymbol={tokenSymbol} />
        ) : null}
      </div>
    </div>
  );
}
