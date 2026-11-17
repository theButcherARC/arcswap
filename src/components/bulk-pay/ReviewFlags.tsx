"use client";

import React, { useMemo } from "react";
import {
  computeReviewFlags,
  shortAddress,
  type ReviewLine,
} from "@/lib/bulkPayReview";

interface ReviewFlagsProps {
  lines: ReviewLine[];
  /** Lowercased addresses this browser has paid before. */
  knownAddresses: Set<string>;
  currencySymbol?: string;
}

/**
 * The review flagging layer (Tommy Famous feedback, approved
 * 2026-11-08): with one signature moving the whole batch, the review
 * screen is the product. Flags sit ABOVE the recipient list so the
 * rows a human would never scroll to are named up front.
 */
export default function ReviewFlags({
  lines,
  knownAddresses,
  currencySymbol = "$",
}: ReviewFlagsProps) {
  const flags = useMemo(
    () => computeReviewFlags(lines, knownAddresses),
    [lines, knownAddresses],
  );

  const hasFlags =
    flags.firstTime.length > 0 ||
    flags.outliers.length > 0 ||
    flags.duplicates.length > 0;

  if (!hasFlags) return null;

  return (
    <div className="mb-4 space-y-2.5">
      {flags.duplicates.length > 0 ? (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/[0.07] px-4 py-3">
          <span className="mono-label block mb-1 !text-rose-600">
            Check before you sign / Duplicate address
          </span>
          {flags.duplicates.map((d) => (
            <p key={d.address} className="text-xs leading-relaxed text-rose-700">
              {shortAddress(d.address)} appears on rows {d.rows.join(", ")}.
              The same person would be paid {d.rows.length} times in this
              batch.
            </p>
          ))}
        </div>
      ) : null}

      {flags.outliers.length > 0 ? (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/[0.07] px-4 py-3">
          <span className="mono-label block mb-1 !text-amber-600">
            Check before you sign / Unusual amount
          </span>
          {flags.outliers.map((l) => (
            <p key={l.row} className="text-xs leading-relaxed text-amber-700">
              Row {l.row} ({l.name || "Recipient"}, {shortAddress(l.address)})
              gets {currencySymbol}
              {l.amount.toFixed(2)}, at least 10x the typical row in this
              batch. If that is not on purpose, fix it before signing.
            </p>
          ))}
        </div>
      ) : null}

      {flags.firstTime.length > 0 ? (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/[0.07] px-4 py-3">
          <span className="mono-label block mb-1 !text-amber-600">
            Check before you sign / First-time recipient
            {flags.firstTime.length !== 1 ? "s" : ""}
          </span>
          <p className="text-xs leading-relaxed text-amber-700">
            {flags.firstTime.length} of {lines.length} recipients have never
            been paid from this browser before:{" "}
            {flags.firstTime
              .slice(0, 6)
              .map((l) => `row ${l.row} (${shortAddress(l.address)})`)
              .join(", ")}
            {flags.firstTime.length > 6
              ? ` and ${flags.firstTime.length - 6} more`
              : ""}
            . Double-check those addresses belong to the right people.
          </p>
        </div>
      ) : null}
    </div>
  );
}
