"use client";

import React from "react";
import { DEFAULT_CHAIN } from "@/constants/chains";

interface BulkPaySuccessProps {
  txHash: string;
  onReset: () => void;
  tokenSymbol?: string;
}

export default function BulkPaySuccess({ txHash, onReset, tokenSymbol = "USDC" }: BulkPaySuccessProps) {
  const explorerUrl = `${DEFAULT_CHAIN.blockExplorers.default.url}/tx/${txHash}`;

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Success card */}
        <div className="border border-emerald-500/20 bg-black/[0.03] backdrop-blur-2xl p-8 sm:p-10 text-center shadow-[0_0_60px_rgba(16,185,129,0.08)]">
          {/* Animated checkmark circle */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-500/30 bg-emerald-500/[0.08]">
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
                stroke="#10b981"
                strokeWidth="2"
                strokeOpacity="0.3"
              />
              <path
                d="M11 18L16 23L25 13"
                stroke="#10b981"
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
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 shadow-[0_0_14px_rgba(52,211,153,0.25)]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-300 tracking-wide">
                Settled in {"<"}1s
              </span>
            </span>
          </div>

          {/* Comparison text */}
          <p className="text-[11px] text-[var(--fg-faint)] mb-8">
            {"Ethereum L1: ~13 min\u2002|\u2002L2s: up to 7 days"}
          </p>

          {/* Transaction hash */}
          <div className="border border-[var(--line)] bg-black/[0.03] p-4 mb-6">
            <span className="block text-[10px] font-medium text-[var(--fg-faint)] uppercase tracking-wider mb-2">
              Transaction Hash
            </span>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-violet-400 hover:text-violet-300 font-mono break-all transition-colors duration-200"
            >
              {txHash}
            </a>
          </div>

          {/* Info rows */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="border border-[var(--line)] bg-black/[0.03] p-3.5">
              <span className="block text-[10px] text-[var(--fg-faint)] uppercase tracking-wider mb-1">
                Network
              </span>
              <span className="text-sm font-medium text-[var(--fg-muted)]">Arc</span>
            </div>
            <div className="border border-[var(--line)] bg-black/[0.03] p-3.5">
              <span className="block text-[10px] text-[var(--fg-faint)] uppercase tracking-wider mb-1">
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
              className="flex-1 inline-flex items-center justify-center gap-2 border border-[var(--line)] bg-black/[0.03] px-5 py-3.5 text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] hover:border-[var(--line-strong)] hover:bg-black/[0.04] transition-all duration-200"
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
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[var(--fg)] text-[var(--bg)] px-5 py-3.5 text-sm font-semibold text-[var(--fg)] transition-all duration-200"
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
      </div>
    </div>
  );
}
