"use client";

import React, { useCallback, useRef, useState } from "react";
import Papa from "papaparse";
import { isAddress, parseUnits } from "viem";
import Link from "next/link";
import { useAccount } from "wagmi";
import BulkPaySuccess from "@/components/bulk-pay/BulkPaySuccess";
import { useBulkPay } from "@/hooks/useBulkPay";
import { TOKENS } from "@/constants/tokens";
import { useArcNetwork } from "@/hooks/useArcNetwork";
import { useTokenBalance } from "@/hooks/useTokenBalance";

// ─── Types ─────────────────────────────────────────────────────────────────

interface ParsedRow {
  name: string;
  address: string;
  amount: string;
  rawAmount: number;
}

interface ParseError {
  row: number;
  message: string;
}

type TokenSymbol = "USDC" | "EURC";

// ─── Helpers ────────────────────────────────────────────────────────────────

function validateRow(
  raw: string[],
  rowIndex: number,
): { ok: true; row: ParsedRow } | { ok: false; error: ParseError } {
  if (raw.length < 2) {
    return { ok: false, error: { row: rowIndex, message: "Fewer than 2 columns — expected name, address, amount" } };
  }

  // Support both 2-column (address, amount) and 3-column (name, address, amount)
  let name: string;
  let address: string;
  let amountStr: string;

  if (raw.length === 2) {
    name = "Recipient";
    address = (raw[0] ?? "").trim();
    amountStr = (raw[1] ?? "").trim();
  } else {
    name = (raw[0] ?? "").trim() || "Recipient";
    address = (raw[1] ?? "").trim();
    amountStr = (raw[2] ?? "").trim();
  }

  if (!isAddress(address)) {
    return { ok: false, error: { row: rowIndex, message: `Row ${rowIndex}: "${address}" is not a valid address` } };
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { ok: false, error: { row: rowIndex, message: `Row ${rowIndex}: amount "${amountStr}" must be a number > 0` } };
  }

  return { ok: true, row: { name, address, rawAmount: amount, amount: amountStr } };
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function CSVUploadForm() {
  const { address } = useAccount();
  const { isCorrectNetwork, switchToArc: switchToArcNetwork } = useArcNetwork();
  const { status, txHash, error: txError, executeBulkPay, reset } = useBulkPay();

  const [selectedSymbol, setSelectedSymbol] = useState<TokenSymbol>("USDC");
  const [memo, setMemo] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [parseErrors, setParseErrors] = useState<ParseError[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");
  const [pasteContent, setPasteContent] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = TOKENS[selectedSymbol]!;
  const usdcBalance = useTokenBalance(TOKENS.USDC);
  const eurcBalance = useTokenBalance(TOKENS.EURC);
  const balance = selectedSymbol === "USDC" ? usdcBalance.formatted : eurcBalance.formatted;

  const totalAmount = rows.reduce((s, r) => s + r.rawAmount, 0);
  const PREVIEW_LIMIT = 10;
  const previewRows = showAll ? rows : rows.slice(0, PREVIEW_LIMIT);

  // ── CSV parser ────────────────────────────────────────────────────────────

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      setParseErrors([{ row: 0, message: "Only .csv files are accepted." }]);
      return;
    }
    setFileName(file.name);
    setRows([]);
    setParseErrors([]);
    setShowAll(false);

    Papa.parse<string[]>(file, {
      skipEmptyLines: true,
      complete(results) {
        const validRows: ParsedRow[] = [];
        const errors: ParseError[] = [];

        results.data.forEach((raw, i) => {
          const result = validateRow(raw, i + 1);
          if (result.ok) validRows.push(result.row);
          else errors.push(result.error);
        });

        setRows(validRows);
        setParseErrors(errors);
      },
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // reset input so same file can be re-uploaded
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const parseCSVText = (text: string) => {
    setRows([]);
    setParseErrors([]);
    setShowAll(false);
    setPasteContent(text);

    Papa.parse<string[]>(text, {
      skipEmptyLines: true,
      complete(results) {
        const validRows: ParsedRow[] = [];
        const errors: ParseError[] = [];

        results.data.forEach((raw, i) => {
          const result = validateRow(raw, i + 1);
          if (result.ok) validRows.push(result.row);
          else errors.push(result.error);
        });

        setRows(validRows);
        setParseErrors(errors);
      },
    });
  };

  const handlePaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setPasteContent(text);
    if (text.trim()) {
      parseCSVText(text);
    } else {
      setRows([]);
      setParseErrors([]);
    }
  };

  // ── Send ──────────────────────────────────────────────────────────────────

  const handleSend = async () => {
    if (!rows.length) return;

    const decimals = token.decimals;
    const recipients = rows.map((r) => ({
      address: r.address as `0x${string}`,
      amount: parseUnits(r.amount, decimals),
      name: r.name,
    }));

    const totalAmountBig = recipients.reduce((s, r) => s + r.amount, 0n);

    await executeBulkPay({
      token,
      totalAmount: totalAmountBig,
      recipients,
      memo: memo.trim() || undefined,
    });
  };

  // ── Success screen ────────────────────────────────────────────────────────

  if (status === "success") {
    return (
      <BulkPaySuccess
        txHash={txHash || ""}
        onReset={() => {
          reset();
          setRows([]);
          setFileName(null);
          setParseErrors([]);
          setMemo("");
          setShowAll(false);
        }}
        tokenSymbol={selectedSymbol}
      />
    );
  }

  const isSending = status === "preparing" || status === "sending";
  const canSend = !!address && isCorrectNetwork && rows.length > 0 && !isSending;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#050508] text-white px-4 sm:px-6 lg:px-8 py-12">
      <div className="mx-auto max-w-4xl">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                CSV Upload
              </span>
            </h1>
            <p className="text-sm text-white/40 mt-2 max-w-md">
              Upload a CSV to pay 100+ recipients in one transaction
            </p>
            {/* Token pills */}
            <div className="flex items-center gap-2 mt-4">
              {(["USDC", "EURC"] as TokenSymbol[]).map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => setSelectedSymbol(sym)}
                  className={
                    "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 border active:scale-95 " +
                    (selectedSymbol === sym
                      ? "animate-pill-active bg-violet-600/25 border-violet-500/60 text-violet-300 shadow-[0_0_16px_rgba(124,58,237,0.35)]"
                      : "bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/70 hover:border-violet-500/30 hover:bg-violet-500/[0.06]")
                  }
                >
                  {sym === "USDC" ? "$" : "€"} {sym}
                </button>
              ))}
            </div>
          </div>

          {/* Right side: balance + nav tab */}
          <div className="flex items-center gap-3">
            {address && (
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl px-3.5 py-2">
                <span className="text-xs font-medium text-white/40">Balance</span>
                <span className="text-xs font-semibold text-white/70">
                  {balance} {selectedSymbol}
                </span>
              </div>
            )}
            <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.03] p-1 gap-1">
              <Link
                href="/bulk-pay"
                className="rounded-lg px-3.5 py-1.5 text-xs font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all duration-200"
              >
                Quick Pay
              </Link>
              <span className="rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white bg-white/[0.08] border border-white/10">
                CSV Upload
              </span>
            </div>
          </div>
        </div>

        {/* ── Main card ──────────────────────────────────────────────────── */}
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl shadow-[0_0_80px_rgba(124,58,237,0.08),0_0_160px_rgba(99,102,241,0.04)] overflow-hidden">

          {/* ── Input mode tabs ────────────────────────────────────────── */}
          <div className="px-6 sm:px-8 pt-6 pb-0 flex items-center gap-1 border-b border-white/[0.06]">
            <button
              type="button"
              onClick={() => setInputMode("upload")}
              className={
                "rounded-t-2xl px-5 py-3 text-xs font-semibold transition-all duration-200 border-b-2 " +
                (inputMode === "upload"
                  ? "border-violet-500/60 text-white bg-white/[0.04]"
                  : "border-transparent text-white/40 hover:text-white/70")
              }
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setInputMode("paste")}
              className={
                "rounded-t-2xl px-5 py-3 text-xs font-semibold transition-all duration-200 border-b-2 " +
                (inputMode === "paste"
                  ? "border-violet-500/60 text-white bg-white/[0.04]"
                  : "border-transparent text-white/40 hover:text-white/70")
              }
            >
              Paste CSV
            </button>
          </div>

          {/* ── Drop zone / Paste mode ─────────────────────────────────── */}
          <div className="p-6 sm:p-8 border-b border-white/[0.06]">
            {inputMode === "upload" ? (
              <>
                {/* Upload file mode */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={[
                    "w-full rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-4 py-14 px-6 cursor-pointer group",
                    isDragging
                      ? "border-violet-500/60 bg-violet-500/[0.07] shadow-[0_0_30px_rgba(124,58,237,0.15)]"
                      : fileName
                        ? "border-emerald-500/40 bg-emerald-500/[0.04] hover:border-emerald-500/60"
                        : "border-white/10 bg-white/[0.02] hover:border-violet-500/35 hover:bg-violet-500/[0.04]",
                  ].join(" ")}
                >
                  {/* Icon */}
                  <div className={[
                    "flex h-14 w-14 items-center justify-center rounded-2xl border transition-colors duration-300",
                    fileName ? "border-emerald-500/30 bg-emerald-500/[0.08]" : "border-white/10 bg-white/[0.04] group-hover:border-violet-500/30 group-hover:bg-violet-500/[0.06]",
                  ].join(" ")}>
                    {fileName ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12.75L11.25 15 15 9.75" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="9" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.4"/>
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 16V8M12 8L9 11M12 8L15 11" stroke="rgba(255,255,255,0.4)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 16.5V18.75C3 19.9926 4.00736 21 5.25 21H18.75C19.9926 21 21 19.9926 21 18.75V16.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.75" strokeLinecap="round"/>
                      </svg>
                    )}
                  </div>

                  {/* Label */}
                  {fileName ? (
                    <div className="text-center">
                      <p className="text-sm font-semibold text-emerald-400">{fileName}</p>
                      <p className="text-xs text-white/35 mt-1">
                        {rows.length} valid recipient{rows.length !== 1 ? "s" : ""} loaded
                        {parseErrors.length > 0 && `, ${parseErrors.length} row${parseErrors.length !== 1 ? "s" : ""} skipped`}
                        {" · "}
                        <span className="text-violet-400 hover:underline">Change file</span>
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm font-semibold text-white/70 group-hover:text-white/90 transition-colors">
                        Upload CSV &mdash; Add 100+ Recipients
                      </p>
                      <p className="text-xs text-white/30 mt-1">
                        Drag & drop or click to browse &mdash; .csv files only
                      </p>
                      <p className="text-[11px] text-white/20 mt-3 font-mono">
                        Alice, 0x1234...abcd, 100.50
                      </p>
                    </div>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="sr-only"
                  aria-label="Upload CSV file"
                />

                {/* Format hint */}
                <p className="mt-4 text-[11px] text-white/25 text-center leading-relaxed">
                  Columns: <span className="font-mono text-white/35">name, address, amount</span>
                  &nbsp;&mdash;&nbsp;or just&nbsp;
                  <span className="font-mono text-white/35">address, amount</span>
                  &nbsp;&mdash;&nbsp;no header row required
                </p>
              </>
            ) : (
              <>
                {/* Paste mode */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-white/70">CSV Content</label>
                  <textarea
                    value={pasteContent}
                    onChange={handlePaste}
                    placeholder="Paste CSV content here — name, address, amount per line"
                    className="w-full h-48 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/30 px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] transition-all duration-200 font-mono hover:border-white/20 hover:bg-white/[0.07] resize-none"
                  />
                  <p className="text-[11px] text-white/25 leading-relaxed">
                    Format: <span className="font-mono text-white/35">name, address, amount</span> or <span className="font-mono text-white/35">address, amount</span> — one row per line, no header required
                  </p>
                </div>
              </>
            )}
          </div>

          {/* ── Parse errors ───────────────────────────────────────────── */}
          {parseErrors.length > 0 && (
            <div className="px-6 sm:px-8 py-4 border-b border-white/[0.06] bg-amber-500/[0.03]">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M5 3V5.5M5 7H5.005" stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-amber-400 mb-1.5">
                    {parseErrors.length} row{parseErrors.length !== 1 ? "s" : ""} skipped &mdash; continuing with valid recipients
                  </p>
                  <ul className="space-y-0.5">
                    {parseErrors.slice(0, 5).map((e, i) => (
                      <li key={i} className="text-[11px] text-white/30 font-mono truncate">{e.message}</li>
                    ))}
                    {parseErrors.length > 5 && (
                      <li className="text-[11px] text-white/20">…and {parseErrors.length - 5} more</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ── Preview table ──────────────────────────────────────────── */}
          {rows.length > 0 && (
            <div className="px-6 sm:px-8 py-6 border-b border-white/[0.06]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-semibold text-white/80">
                    Recipients
                  </h2>
                  <span className="inline-flex items-center rounded-full border border-violet-500/25 bg-violet-500/[0.08] px-2.5 py-0.5 text-[11px] font-semibold text-violet-400">
                    {rows.length} loaded
                  </span>
                </div>
                <span className="text-xs text-white/30">
                  Total: <span className="text-white/60 font-medium">
                    {selectedSymbol === "USDC" ? "$" : "€"}{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {selectedSymbol}
                  </span>
                </span>
              </div>

              <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[1fr_2fr_auto] gap-0 border-b border-white/[0.07] bg-white/[0.02]">
                  <div className="px-4 py-2.5 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Name</div>
                  <div className="px-4 py-2.5 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Address</div>
                  <div className="px-4 py-2.5 text-[10px] font-semibold text-white/30 uppercase tracking-wider text-right">Amount</div>
                </div>

                {/* Rows */}
                <div className={showAll ? "max-h-[480px] overflow-y-auto" : ""}>
                  {previewRows.map((row, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[1fr_2fr_auto] gap-0 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors duration-150"
                    >
                      <div className="px-4 py-3 text-xs text-white/70 truncate">{row.name}</div>
                      <div className="px-4 py-3 text-xs text-white/50 font-mono truncate">
                        {row.address.slice(0, 6)}…{row.address.slice(-4)}
                      </div>
                      <div className="px-4 py-3 text-xs font-semibold text-violet-300 text-right whitespace-nowrap">
                        {selectedSymbol === "USDC" ? "$" : "€"}{Number(row.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show more / less */}
                {rows.length > PREVIEW_LIMIT && (
                  <button
                    type="button"
                    onClick={() => setShowAll((v) => !v)}
                    className="w-full py-3 text-xs text-white/35 hover:text-white/60 hover:bg-white/[0.03] transition-all duration-200 border-t border-white/[0.06]"
                  >
                    {showAll
                      ? "Show less"
                      : `…and ${rows.length - PREVIEW_LIMIT} more row${rows.length - PREVIEW_LIMIT !== 1 ? "s" : ""} — click to expand`}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Memo field ─────────────────────────────────────────────── */}
          <div className="px-6 sm:px-8 py-6 border-b border-white/[0.06]">
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
              Payroll Label <span className="normal-case font-normal text-white/25">(optional)</span>
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              maxLength={120}
              placeholder="e.g. July Salary, Q3 Bonus, Contractor Batch"
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/25 px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] transition-all duration-200 hover:border-white/20"
            />
            {memo.length > 0 && (
              <p className="mt-1.5 text-[11px] text-white/25 text-right">{memo.length}/120 · stored onchain</p>
            )}
          </div>

          {/* ── Footer: error + wallet state + send ────────────────────── */}
          <div className="px-6 sm:px-8 py-6">
            {/* Tx error */}
            {txError && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-xs text-red-400">
                {txError}
              </div>
            )}

            {/* Not connected */}
            {!address && (
              <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-white/40 text-center">
                Connect your wallet to send payments
              </div>
            )}

            {/* Wrong network */}
            {address && !isCorrectNetwork && (
              <button
                type="button"
                onClick={switchToArcNetwork}
                className="w-full mb-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 text-xs font-semibold text-amber-400 hover:bg-amber-500/10 transition-all duration-200"
              >
                Switch to Arc Testnet
              </button>
            )}

            {/* Stats bar */}
            {rows.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
                <span className="text-[11px] text-white/40 whitespace-nowrap">
                  Recipients: <span className="text-white/60 font-medium">{rows.length}</span>
                </span>
                <span className="text-white/20 text-[11px]">|</span>
                <span className="text-[11px] text-white/40 whitespace-nowrap">
                  Total: <span className="text-white/70 font-medium">
                    {selectedSymbol === "USDC" ? "$" : "€"}{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {selectedSymbol}
                  </span>
                </span>
                {parseErrors.length > 0 && (
                  <>
                    <span className="text-white/20 text-[11px]">|</span>
                    <span className="text-[11px] text-amber-500/70 whitespace-nowrap">
                      {parseErrors.length} row{parseErrors.length !== 1 ? "s" : ""} skipped
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Send button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              className={
                "w-full rounded-xl px-6 py-3.5 text-sm font-semibold transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2.5 " +
                (canSend
                  ? "animate-send-pulse bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 hover:scale-[1.01]"
                  : "bg-white/[0.06] text-white/20 cursor-not-allowed")
              }
            >
              {isSending ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white/70" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  <span>{status === "preparing" ? "Preparing…" : "Sending…"}</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8h10.5M9 4.5L13.5 8 9 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>
                    {rows.length > 0
                      ? `Send ${rows.length} Payment${rows.length !== 1 ? "s" : ""}`
                      : "Upload a CSV to continue"}
                  </span>
                </>
              )}
            </button>

            <p className="mt-3 text-center text-[11px] text-white/20">
              One MetaMask popup &mdash; all {rows.length > 0 ? rows.length : ""} transfers execute atomically via Multicall3From
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
