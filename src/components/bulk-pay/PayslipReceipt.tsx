"use client";

import React, { useMemo, useState } from "react";
import { Playfair_Display } from "next/font/google";
import { DEFAULT_CHAIN } from "@/constants/chains";
import ShareSheet from "@/components/ui/ShareSheet";
import { shortAddress } from "@/lib/bulkPayReview";
import { formatTokenAmount } from "@/lib/money";
import type { BatchResult } from "@/types/bulkPay";

/**
 * Payslip receipt (Ooyaa + Valuta pattern, approved 2026-11-12), built
 * on the line-by-line reconciliation output: every line shows what was
 * expected, what the chain shows, and a link to the transaction that
 * carried it. Design borrows, applied on this surface only inside our
 * own theme: serif display for the big amount, mono uppercase labels,
 * a perforated payslip edge, hairline rules, teal PASS pills.
 */

const serifDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-payslip-serif",
});

interface PayslipReceiptProps {
  result: BatchResult;
  tokenSymbol?: string;
}

function fmt(raw: bigint, decimals: number): string {
  return formatTokenAmount(raw, decimals);
}

const PASS_STYLE: React.CSSProperties = {
  color: "#0E7A5F",
  backgroundColor: "rgba(14, 122, 95, 0.12)",
  border: "1px solid rgba(14, 122, 95, 0.35)",
};

export default function PayslipReceipt({
  result,
  tokenSymbol = "USDC",
}: PayslipReceiptProps) {
  const [copied, setCopied] = useState(false);
  const explorerBase = DEFAULT_CHAIN.blockExplorers.default.url;
  const decimals = result.token.decimals;
  const summary = result.summary;
  const grandTotal = result.totalRaw + result.feeRaw;

  const dateLabel = useMemo(
    () =>
      new Date(result.sentAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [result.sentAt],
  );

  const copyText = useMemo(() => {
    const lines: string[] = [
      "VIBEFLOW PAYSLIP",
      `Date: ${dateLabel}`,
      `From: ${result.sender}`,
      result.batchMemo ? `Batch memo: ${result.batchMemo}` : "",
      "",
    ].filter(Boolean) as string[];
    if (summary) {
      for (const l of summary.lines) {
        lines.push(
          `${l.row}. ${l.name || "Recipient"} ${shortAddress(l.address)}  ${fmt(l.amount, decimals)} ${tokenSymbol}  ${l.status.toUpperCase()}${l.txHash ? `  ${explorerBase}/tx/${l.txHash}` : ""}`,
        );
      }
      lines.push("");
      lines.push(
        `Verified onchain: ${summary.matchedCount} of ${summary.lines.length} lines matched`,
      );
    }
    lines.push(`Total paid: ${fmt(result.totalRaw, decimals)} ${tokenSymbol}`);
    lines.push(`Protocol fee: ${fmt(result.feeRaw, decimals)} ${tokenSymbol}`);
    lines.push(`Grand total: ${fmt(grandTotal, decimals)} ${tokenSymbol}`);
    return lines.join("\n");
  }, [result, summary, dateLabel, decimals, tokenSymbol, explorerBase, grandTotal]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be unavailable (permissions); the receipt stays
      // on screen to screenshot instead.
    }
  };

  return (
    <div
      className={
        "relative mt-8 animate-settle-in bg-[var(--bg-raised)] text-left " + serifDisplay.variable
      }
      style={{ border: "1px solid var(--line)" }}
    >
      {/* Perforated top edge */}
      <div
        aria-hidden="true"
        className="relative border-b border-dashed"
        style={{ borderColor: "var(--line-strong, var(--line))" }}
      >
        <span className="absolute -left-[11px] -bottom-[10px] h-5 w-5 rounded-full bg-[var(--bg)]" style={{ border: "1px solid var(--line)" }} />
        <span className="absolute -right-[11px] -bottom-[10px] h-5 w-5 rounded-full bg-[var(--bg)]" style={{ border: "1px solid var(--line)" }} />
        <div className="px-6 pt-6 pb-4 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="mono-label block">VibeFlow / Payslip</span>
              <p
                className="mt-2 text-3xl leading-none text-[var(--fg)]"
                style={{ fontFamily: "var(--font-payslip-serif), Georgia, serif", fontWeight: 700 }}
              >
                {fmt(grandTotal, decimals)}{" "}
                <span className="text-base align-middle text-[var(--fg-muted)]">
                  {tokenSymbol}
                </span>
              </p>
              <p className="mt-2 text-[0.6875rem] text-[var(--fg-faint)]">
                Total out, including the protocol fee
              </p>
            </div>
            <div className="text-right">
              <span className="mono-label block">Date</span>
              <p className="mt-1.5 text-xs text-[var(--fg-muted)]">{dateLabel}</p>
              <span className="mono-label block mt-3">From</span>
              <p className="mt-1.5 font-mono text-xs text-[var(--fg-muted)]">
                {shortAddress(result.sender)}
              </p>
            </div>
          </div>
          {result.batchMemo ? (
            <p className="mt-3 text-xs text-[var(--fg-muted)]">
              <span className="mono-label mr-2">Batch memo</span>
              {result.batchMemo}
            </p>
          ) : null}
        </div>
      </div>

      {/* Verification summary */}
      <div className="px-6 pt-4 sm:px-8">
        {summary ? (
          summary.complete ? (
            <p className="text-xs leading-relaxed" style={{ color: "#0E7A5F" }}>
              Every line below was matched to a transfer onchain:{" "}
              {summary.matchedCount} of {summary.lines.length} lines
              verified, each with its transaction link.
            </p>
          ) : (
            <p className="text-xs leading-relaxed text-[var(--warn)]">
              {summary.matchedCount} of {summary.lines.length} lines matched
              a transfer onchain. {summary.missingCount} missing,{" "}
              {summary.mismatchCount} mismatched. Check the flagged lines on
              the explorer before treating this batch as fully paid.
            </p>
          )
        ) : (
          <p className="text-xs leading-relaxed text-[var(--fg-faint)]">
            Line-by-line verification was not available for this batch.
            Use the transaction links to check each payment on the
            explorer.
          </p>
        )}
      </div>

      {/* Lines */}
      {summary ? (
        <div className="mt-3 max-h-96 overflow-y-auto px-6 sm:px-8">
          <div className="divide-y" style={{ borderColor: "var(--line)" }}>
            {summary.lines.map((l) => (
              <div key={l.row} className="flex items-center gap-3 py-2.5" style={{ borderColor: "var(--line)" }}>
                <span className="w-7 shrink-0 font-mono text-[0.6875rem] text-[var(--fg-faint)]">
                  {String(l.row).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-[var(--fg)]" title={l.name || "Recipient"}>
                    {l.name || "Recipient"}
                  </p>
                  <p className="font-mono text-[0.6875rem] text-[var(--fg-faint)]">
                    {shortAddress(l.address)}
                    {l.status === "mismatch" && l.observedAmount !== undefined
                      ? ` / chain shows ${fmt(l.observedAmount, decimals)}`
                      : ""}
                  </p>
                </div>
                <span className="whitespace-nowrap text-sm font-semibold text-[var(--fg)]">
                  {fmt(l.amount, decimals)}
                </span>
                {l.status === "matched" ? (
                  <span
                    className="shrink-0 px-2 py-0.5 font-mono text-[0.625rem] font-semibold uppercase tracking-wider"
                    style={PASS_STYLE}
                  >
                    Pass
                  </span>
                ) : l.status === "mismatch" ? (
                  <span className="shrink-0 border border-[color-mix(in_srgb,var(--warn)_40%,transparent)] bg-[color-mix(in_srgb,var(--warn)_10%,transparent)] px-2 py-0.5 font-mono text-[0.625rem] font-semibold uppercase tracking-wider text-[var(--warn)]">
                    Check
                  </span>
                ) : (
                  <span className="shrink-0 border border-[color-mix(in_srgb,var(--danger)_40%,transparent)] bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-2 py-0.5 font-mono text-[0.625rem] font-semibold uppercase tracking-wider text-[var(--danger)]">
                    Missing
                  </span>
                )}
                {l.txHash ? (
                  <a
                    href={`${explorerBase}/tx/${l.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 font-mono text-[0.6875rem] text-[var(--accent)] hover:opacity-80"
                  >
                    TX
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Totals, split by hairlines */}
      <div className="px-6 pb-6 pt-4 sm:px-8">
        <div className="space-y-1.5 border-t pt-4 text-xs" style={{ borderColor: "var(--line)" }}>
          <div className="flex justify-between">
            <span className="mono-label">Paid to recipients</span>
            <span className="font-mono text-[var(--fg)]">
              {fmt(result.totalRaw, decimals)} {tokenSymbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="mono-label">Protocol fee</span>
            <span className="font-mono text-[var(--fg-muted)]">
              {fmt(result.feeRaw, decimals)} {tokenSymbol}
            </span>
          </div>
          <div className="flex justify-between border-t pt-2" style={{ borderColor: "var(--line)" }}>
            <span className="mono-label">Grand total</span>
            <span className="font-mono font-semibold text-[var(--fg)]">
              {fmt(grandTotal, decimals)} {tokenSymbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="mono-label">Transactions</span>
            <span className="font-mono text-[var(--fg-muted)]">
              {result.txHashes.length}
            </span>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="min-h-[44px] flex-1 border border-[var(--line)] bg-black/[0.03] px-4 py-3 text-sm font-medium text-[var(--fg-muted)] pressable hover:border-[var(--line-strong)] hover:text-[var(--fg)]"
          >
            {copied ? "Receipt copied" : "Copy receipt"}
          </button>
          {result.txHashes.length > 0 ? (
            <ShareSheet
              url={`${explorerBase}/tx/${result.txHashes[0]}`}
              title="Batch payment proof"
              text={
                summary
                  ? `Paid ${fmt(grandTotal, decimals)} ${tokenSymbol} to ${summary.lines.length} recipient${summary.lines.length === 1 ? "" : "s"} on Arc via VibeFlow. Onchain proof:`
                  : `Batch payment of ${fmt(grandTotal, decimals)} ${tokenSymbol} settled on Arc via VibeFlow. Onchain proof:`
              }
              triggerLabel="Share proof"
              triggerClassName="min-h-[44px] rounded-none border-[var(--line)] bg-black/[0.03] px-4 py-3 text-sm font-medium text-[var(--fg-muted)] hover:border-[var(--line-strong)] hover:text-[var(--fg)]"
            />
          ) : null}
        </div>
        <p className="mt-3 text-center text-[0.6875rem] text-[var(--fg-faint)]">
          Settled on Arc through the VibeFlow BatchPay contract. Memos and
          amounts on this payslip are read from the chain, not typed in.
        </p>
      </div>
    </div>
  );
}
