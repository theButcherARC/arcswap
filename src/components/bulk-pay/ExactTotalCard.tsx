"use client";

import React from "react";

interface ExactTotalCardProps {
  /** Recipients total in whole token units. */
  total: number;
  /** Protocol fee in whole token units. */
  fee: number;
  count: number;
  symbol: string;
  currencySymbol?: string;
  /** Number of disperse transactions this batch will be sent as. */
  chunkCount: number;
}

/**
 * Exact-total approval card (Requisition + Split pattern, approved
 * 2026-11-12): the review leads with the exact amount leaving the
 * wallet, and states that the token approval is set to exactly that
 * amount, never unlimited.
 */
export default function ExactTotalCard({
  total,
  fee,
  count,
  symbol,
  currencySymbol = "$",
  chunkCount,
}: ExactTotalCardProps) {
  const grandTotal = total + fee;

  return (
    <div className="mb-4 border border-[rgba(39,117,202,0.35)] bg-[var(--accent-soft)] px-4 py-4">
      <span className="mono-label block mb-1.5">You approve exactly</span>
      <p className="text-2xl font-bold tracking-tight text-[var(--fg)]">
        {currencySymbol}
        {grandTotal.toFixed(2)}{" "}
        <span className="text-sm font-semibold text-[var(--fg-muted)]">
          {symbol}
        </span>
      </p>
      <div className="mt-2.5 space-y-1 text-xs text-[var(--fg-muted)] leading-relaxed">
        <p>
          {currencySymbol}
          {total.toFixed(2)} to {count} recipient{count !== 1 ? "s" : ""} +{" "}
          {currencySymbol}
          {fee.toFixed(2)} protocol fee (0.2%, minimum $0.01).
        </p>
        <p>
          Your wallet approval is set to exactly this amount for the
          BatchPay contract, never an unlimited approval.
        </p>
        {chunkCount > 1 ? (
          <p>
            This batch is larger than 250 recipients, so it is sent as{" "}
            {chunkCount} transactions of up to 250. You sign the approval
            once, then each transaction. Each transaction is atomic: if one
            payment in it fails, that transaction reverts in full.
          </p>
        ) : (
          <p>
            One approval, one transaction. The transaction is atomic: if
            any payment in it fails, the whole batch reverts and no one
            gets a partial payment.
          </p>
        )}
      </div>
    </div>
  );
}
