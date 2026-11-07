"use client";

import React, { useState, useMemo, useCallback } from "react";
import { parseUnits } from "viem";
import type { Address } from "viem";
import { useAccount } from "wagmi";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { LogoTile } from "@/components/brand/Logo";
import { useBulkPay } from "@/hooks/useBulkPay";
import { TOKENS, BULK_PAY_MAX_RECIPIENTS } from "@/constants/tokens";
import { isValidAddress, toChecksumAddress } from "@/utils/address";
import { parsePaymentInstruction } from "@/services/agentService";
import type { ParsedBulkPay } from "@/services/agentService";
import BulkPaySuccess from "./BulkPaySuccess";
import RecipientRow from "./RecipientRow";
import type { Recipient } from "@/types/bulkPay";

function createRecipient(): Recipient {
  return {
    id: crypto.randomUUID(),
    name: "",
    address: "",
    percentageInput: "",
    percentage: null,
    amountInput: "",
    amount: null,
  };
}

const EXAMPLE_PROMPTS = [
  "Pay Alice 500 USDC at 0x742d35Cc6634C0532925a3b844Bc9e7595f2bD38 and Bob 300 USDC at 0x8ba1f109551bD432803012645Ac136ddd64DBA72",
  "Split 1000 USDC equally between 3 team members: Alex at 0x742d35Cc6634C0532925a3b844Bc9e7595f2bD38, Sarah at 0x8ba1f109551bD432803012645Ac136ddd64DBA72, Mike at 0xdD870fA1b7C4700F2BD7f44238821C26f7392148",
  "Pay 200 USDC to 0x742d35Cc6634C0532925a3b844Bc9e7595f2bD38 for March consulting and 150 USDC to 0x8ba1f109551bD432803012645Ac136ddd64DBA72 for design work",
];

/* --------------------------------------------------------------- */
/*  Extracted child: AI Agent Preview                               */
/* --------------------------------------------------------------- */

function AgentPreview({
  result,
  onApply,
  onDiscard,
}: {
  result: ParsedBulkPay;
  onApply: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="mt-4 border border-[rgba(39,117,202,0.25)] bg-[rgba(39,117,202,0.05)] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
          <span className="text-sm font-medium text-[var(--data)]">
            Parsed {result.recipients.length} recipient
            {result.recipients.length !== 1 ? "s" : ""} successfully
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDiscard}
            className="px-3.5 py-1.5 text-xs font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] border border-[var(--line)] hover:border-[var(--line-strong)] bg-black/[0.03] transition-colors duration-200 active:scale-95"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={onApply}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-[var(--accent)] hover:opacity-90 transition-colors duration-200 active:scale-95"
          >
            Apply All
          </button>
        </div>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {result.recipients.map((r, i) => (
          <div
            key={"ai-preview-" + i}
            className="flex items-center gap-3 bg-black/[0.03] border border-[var(--line)] px-4 py-3"
          >
            <span className="text-[11px] text-[var(--fg-faint)] font-mono w-5 shrink-0">
              {i + 1}.
            </span>
            <span className="text-sm text-[var(--fg-muted)] flex-1 truncate font-medium">
              {r.name || "Unnamed"}
            </span>
            <span className="text-[11px] text-[var(--fg-faint)] font-mono truncate max-w-[120px]">
              {r.address
                ? r.address.slice(0, 6) + "..." + r.address.slice(-4)
                : "No address"}
            </span>
            <span className="text-sm text-[var(--accent)] font-semibold shrink-0">
              {r.amount ? "$" + r.amount : "---"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- */
/*  Extracted child: Agent Loading Spinner                          */
/* --------------------------------------------------------------- */

function AgentSpinner() {
  return (
    <div className="flex items-center justify-center gap-3 py-6">
      <svg
        className="animate-spin"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="10"
          cy="10"
          r="8"
          stroke="currentColor"
          strokeWidth="2"
          strokeOpacity="0.15"
        />
        <path
          d="M10 2A8 8 0 0118 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-sm text-[var(--fg-muted)]">Parsing your instructions...</span>
    </div>
  );
}

/* --------------------------------------------------------------- */
/*  Main Component: AI (dedicated page)                            */
/* --------------------------------------------------------------- */

export default function AIPayForm() {
  const [selectedSymbol, setSelectedSymbol] = useState<"USDC" | "EURC">("USDC");

  const HARDCODED_TOKENS = {
    USDC: { ...TOKENS.USDC, address: "0x3600000000000000000000000000000000000000" as `0x${string}` },
    EURC: { ...TOKENS.EURC, address: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" as `0x${string}`, decimals: 6 },
  };

  const token = HARDCODED_TOKENS[selectedSymbol];
  const [agentInput, setAgentInput] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState("");
  const [agentResult, setAgentResult] = useState<ParsedBulkPay | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [memo, setMemo] = useState("");
  const [showReview, setShowReview] = useState(false);

  const { executeBulkPay, status, txHash, error, reset } = useBulkPay();
  const isSending = status === "preparing" || status === "sending";
  const { isConnected } = useAccount();

  /* ---- Agent handlers ---- */
  const handleParseAgent = useCallback(async () => {
    if (!agentInput.trim() || agentLoading) return;
    setAgentLoading(true);
    setAgentError("");
    setAgentResult(null);
    try {
      const result = await parsePaymentInstruction(agentInput.trim());
      if (result.error) {
        setAgentError(result.error);
      } else if (result.recipients.length === 0) {
        setAgentError("Could not parse any recipients from your description. Try being more specific with names, amounts, and addresses.");
      } else {
        setAgentResult(result);
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to parse instructions. Please try again.";
      setAgentError(msg);
    } finally {
      setAgentLoading(false);
    }
  }, [agentInput, agentLoading]);

  const handleApplyAgent = useCallback(() => {
    if (!agentResult) return;

    const newRecipients = agentResult.recipients.map((r) => {
      const parsedAmt = r.amount ? parseFloat(r.amount) : null;
      return {
        id: crypto.randomUUID(),
        name: r.name || "",
        address: (r.address || "") as Recipient["address"],
        percentageInput: "",
        percentage: null,
        amountInput: r.amount || "",
        amount: isNaN(parsedAmt as number) ? null : (parsedAmt as number),
      };
    });

    setRecipients(newRecipients);
    setAgentResult(null);
    setAgentInput("");
    setShowReview(false);
  }, [agentResult]);

  const handleDiscardAgent = useCallback(() => {
    setAgentResult(null);
  }, []);

  const handleExampleClick = useCallback((prompt: string) => {
    setAgentInput(prompt);
    setAgentError("");
    setAgentResult(null);
  }, []);

  /* ---- Recipient handlers ---- */
  const addRecipient = useCallback(() => {
    setRecipients((prev) => {
      if (prev.length >= BULK_PAY_MAX_RECIPIENTS) return prev;
      return [...prev, createRecipient()];
    });
  }, []);

  const removeRecipient = useCallback((id: string) => {
    setRecipients((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((r) => r.id !== id);
    });
  }, []);

  const handleNameChange = useCallback((id: string, value: string) => {
    setRecipients((prev) =>
      prev.map((r) => (r.id === id ? { ...r, name: value } : r))
    );
  }, []);

  const handleAddressChange = useCallback((id: string, value: string) => {
    setRecipients((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, address: value as Recipient["address"] } : r
      )
    );
  }, []);

  const handlePercentageChange = useCallback(
    (id: string, value: string) => {
      setRecipients((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          const parsed = parseFloat(value);
          return {
            ...r,
            percentageInput: value,
            percentage: isNaN(parsed) || value.trim() === "" ? null : parsed,
          };
        })
      );
    },
    []
  );

  const handleAmountChange = useCallback((id: string, value: string) => {
    setRecipients((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const parsed = parseFloat(value);
        return {
          ...r,
          amountInput: value,
          amount: isNaN(parsed) || value.trim() === "" ? null : parsed,
        };
      })
    );
  }, []);

  /* ---- Derived totals (amount mode) ---- */
  const total = useMemo(
    () => recipients.reduce((sum, r) => sum + (r.amount || 0), 0),
    [recipients]
  );

  const validRecipients = useMemo(
    () =>
      recipients.filter(
        (r) => isValidAddress(r.address) && r.amount !== null && r.amount > 0
      ),
    [recipients]
  );

  const fee = Math.max(total * 0.002, 0.01);
  const atMaxRecipients = recipients.length >= BULK_PAY_MAX_RECIPIENTS;

  const canSend = useMemo(() => {
    if (isSending) return false;
    if (validRecipients.length === 0) return false;
    if (total <= 0) return false;
    return true;
  }, [isSending, validRecipients, total]);

  /* ---- Confirm and send ---- */
  const handleConfirm = useCallback(async () => {
    if (!canSend) return;

    const totalNum = validRecipients.reduce((sum, r) => sum + (r.amount || 0), 0);

    let totalAmountRaw: bigint;
    try {
      totalAmountRaw = parseUnits(totalNum.toFixed(token.decimals), token.decimals);
    } catch {
      return;
    }

    const transfers = validRecipients.map((r) => {
      let amount: bigint;
      try {
        amount = parseUnits((r.amount || 0).toFixed(token.decimals), token.decimals);
      } catch {
        amount = 0n;
      }

      let checksumAddr: string;
      try {
        checksumAddr = toChecksumAddress(r.address) || r.address;
      } catch {
        checksumAddr = r.address;
      }

      return {
        address: checksumAddr as Address,
        amount,
        name: r.name,
      };
    });

    await executeBulkPay({
      totalAmount: totalAmountRaw,
      token,
      recipients: transfers,
      memo: memo.trim() || undefined,
    });
  }, [canSend, validRecipients, token, executeBulkPay, memo]);

  /* ================================================================ */
  /*  RENDER                                                          */
  /* ================================================================ */
  return (
    <div className="relative min-h-screen bg-[var(--bg)] pt-10 pb-16 px-4">
      {status === "success" ? (
        <BulkPaySuccess
          txHash={txHash || ""}
          onReset={reset}
          tokenSymbol={selectedSymbol}
        />
      ) : (
        <div className="mx-auto max-w-3xl px-2 sm:px-4">
          {/* ===================== PAGE HEADER ===================== */}
          <div className="rule-tick mb-7 pt-5 sm:mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="mono-label mb-2 block">SYS.PAY / AI.PARSE</span>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--fg)]">
                  AI
                </h1>
                <p className="text-sm text-[var(--fg-muted)] mt-2 max-w-md">
                  Describe your payments in plain words. The AI drafts the
                  batch, you review every row, then sign once.
                </p>
              </div>

{/* Single quiet control row: token switch + CSV link */}
              <div className="flex items-center gap-4">
                <div
className="flex items-center rounded-lg border border-[var(--line)] bg-[var(--glass)] p-1"
                  role="group"
                  aria-label="Select token"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedSymbol("USDC")}
                    aria-pressed={selectedSymbol === "USDC"}
                    className={
                      "px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 " +
                      (selectedSymbol === "USDC"
                        ? "bg-[var(--fg)] text-[var(--bg)]"
                        : "text-[var(--fg-muted)] hover:text-[var(--fg)]")
                    }
                  >
                    USDC
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSymbol("EURC")}
                    aria-pressed={selectedSymbol === "EURC"}
                    className={
                      "px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 " +
                      (selectedSymbol === "EURC"
                        ? "bg-[var(--fg)] text-[var(--bg)]"
                        : "text-[var(--fg-muted)] hover:text-[var(--fg)]")
                    }
                  >
                    EURC
                  </button>
                </div>
              </div>
            </div>
          </div>

{/* Wallet requirement banner (shown until connected) */}
          {!isConnected ? (
            <div className="mb-7 flex flex-col gap-3 border border-[rgba(39,117,202,0.3)] bg-[var(--accent-soft)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--fg-muted)]">
                <span className="font-semibold text-[var(--fg)]">Connect your wallet to send.</span>{" "}
                MetaMask on Arc Mainnet is required before you can submit a batch.
              </p>
              <div className="shrink-0">
                <ConnectButton />
              </div>
            </div>
          ) : null}

          {/* ===================== AI AGENT ===================== */}
          <div className="relative mb-7 border-y border-[var(--line)]">
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <LogoTile size={28} />
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--fg)]">
                      AI
                    </h2>
                    <p className="mono-label mt-0.5">
                      Describe payments in natural language
                    </p>
                  </div>
                </div>
              </div>

              <div>
{/* How it works */}
                  <div className="mb-4 grid gap-2 sm:grid-cols-3">
                    <div className="border border-[var(--line)] bg-black/[0.03] px-3.5 py-3">
                      <p className="font-mono text-[11px] font-semibold text-[var(--accent)]">01</p>
                      <p className="mt-1 text-xs font-semibold text-[var(--fg)]">Describe it</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--fg-faint)]">Write who gets paid and how much, in plain words.</p>
                    </div>
                    <div className="border border-[var(--line)] bg-black/[0.03] px-3.5 py-3">
                      <p className="font-mono text-[11px] font-semibold text-[var(--accent)]">02</p>
                      <p className="mt-1 text-xs font-semibold text-[var(--fg)]">The agent drafts it</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--fg-faint)]">It fills the batch below for you. Nothing is sent.</p>
                    </div>
                    <div className="border border-[var(--line)] bg-black/[0.03] px-3.5 py-3">
                      <p className="font-mono text-[11px] font-semibold text-[var(--accent)]">03</p>
                      <p className="mt-1 text-xs font-semibold text-[var(--fg)]">You review and sign</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--fg-faint)]">Check every row, then sign once in your wallet.</p>
                    </div>
                  </div>
                  <textarea
                    value={agentInput}
                    onChange={(e) => {
                      setAgentInput(e.target.value);
                      setAgentError("");
                    }}
                    disabled={agentLoading}
                    placeholder="Pay Alice 500 USDC at 0x... and Bob 300 USDC at 0x..."
                    rows={3}
                    className="w-full min-h-24 border border-[var(--line)] bg-transparent px-4 py-3 text-base leading-relaxed text-[var(--fg)] placeholder:text-[var(--fg-faint)] focus:outline-none focus:border-[var(--fg-muted)] transition-colors resize-none disabled:opacity-40 disabled:cursor-not-allowed"
                  />

                  {/* Example chips */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {EXAMPLE_PROMPTS.map((prompt, i) => (
                      <button
                        key={"example-" + i}
                        type="button"
                        onClick={() => handleExampleClick(prompt)}
                        disabled={agentLoading}
                        className="text-[11px] text-[var(--fg-faint)] hover:text-[var(--fg)] border border-[var(--line)] hover:border-[var(--line-strong)] bg-black/[0.03] hover:bg-black/[0.04] px-3 py-1.5 transition-colors duration-200 truncate max-w-[260px] disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {prompt.slice(0, 50)}
                        {prompt.length > 50 ? "..." : ""}
                      </button>
                    ))}
                  </div>

                  <p className="mt-3 text-[11px] leading-relaxed text-[var(--fg-faint)]">
                    The AI drafts the batch from your text. Nothing is sent until you review and sign.
                  </p>

                  {/* Parse button */}
                  <button
                    type="button"
                    onClick={handleParseAgent}
                    disabled={agentLoading || !agentInput.trim()}
                    className={
                      "w-full mt-4 px-6 py-3.5 text-sm font-semibold transition-colors duration-200 " +
                      (agentLoading || !agentInput.trim()
                        ? "bg-black/[0.04] text-[var(--fg-faint)] cursor-not-allowed"
                        : "bg-[var(--fg)] text-[var(--bg)]")
                    }
                  >
                    {agentLoading ? (
                      <span className="flex items-center justify-center gap-2.5">
                        <svg
                          className="animate-spin"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle
                            cx="8"
                            cy="8"
                            r="6.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeOpacity="0.2"
                          />
                          <path
                            d="M8 1.5A6.5 6.5 0 0114.5 8"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        Parsing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9 2L11 6.5L16 7.5L12.5 11L13.5 16L9 13.5L4.5 16L5.5 11L2 7.5L7 6.5L9 2Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Parse with AI
                      </span>
                    )}
                  </button>

                  {/* Loading state */}
                  {agentLoading ? <AgentSpinner /> : null}

                  {/* Error state */}
                  {agentError && !agentLoading ? (
                    <div className="mt-4 border border-rose-500/20 bg-rose-500/[0.06] px-4 py-3">
                      <div className="flex items-start gap-2.5">
                        <svg
                          className="mt-0.5 shrink-0"
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle
                            cx="7"
                            cy="7"
                            r="6"
                            stroke="#f43f5e"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M7 4V7.5"
                            stroke="#f43f5e"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                          <circle cx="7" cy="10" r="0.75" fill="#f43f5e" />
                        </svg>
                        <p className="text-xs text-rose-600/90 leading-relaxed">
                          {agentError}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {/* Success preview */}
                  {agentResult && !agentLoading ? (
                    <AgentPreview
                      result={agentResult}
                      onApply={handleApplyAgent}
                      onDiscard={handleDiscardAgent}
                    />
                  ) : null}
              </div>
            </div>
          </div>

          {/* ===================== RECIPIENTS EDITOR ===================== */}
          {recipients.length > 0 ? (
            <div className="mb-7">
              <div className="flex items-center justify-between mb-4 px-1">
                <span className="mono-label">Recipients</span>
                <span className="text-xs text-[var(--fg-faint)]">
                  {recipients.length} in this batch
                </span>
              </div>

              <div className="divide-y divide-[var(--line)] border border-[var(--line)] bg-[var(--bg-raised)]">
                {recipients.map((recipient, i) => (
                  <RecipientRow
                    key={recipient.id}
                    recipient={recipient}
                    index={i}
                    inputMode="amount"
                    totalAmount={total}
                    onNameChange={handleNameChange}
                    onAddressChange={handleAddressChange}
                    onPercentageChange={handlePercentageChange}
                    onAmountChange={handleAmountChange}
                    onRemove={removeRecipient}
                    isDisabled={isSending}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={addRecipient}
                disabled={atMaxRecipients || isSending}
                className={
                  "w-full mt-3 border border-dashed py-4 " +
                  "text-sm font-medium transition-colors duration-300 " +
                  (atMaxRecipients || isSending
                    ? "border-[var(--line)] bg-black/[0.03] text-[var(--fg-faint)] cursor-not-allowed"
                    : "border-[rgba(39,117,202,0.3)] bg-black/[0.03] text-[var(--fg-muted)] hover:text-[var(--data)] hover:bg-[var(--accent-soft)] hover:border-[var(--accent)] active:scale-[0.99]")
                }
              >
                {atMaxRecipients ? "Recipient limit reached" : "Add recipient"}
              </button>

              {/* Memo */}
              <div className="mt-5">
                <label className="mono-label block mb-2" htmlFor="ai-memo">
                  Memo (optional)
                </label>
                <input
                  id="ai-memo"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  maxLength={100}
                  placeholder="e.g. March payroll"
                  className="w-full border border-[var(--line)] bg-transparent px-4 py-3 text-base text-[var(--fg)] placeholder:text-[var(--fg-faint)] focus:outline-none focus:border-[var(--fg-muted)] transition-colors"
                />
              </div>

              {/* Summary + actions */}
              <div className="mt-6 border border-[var(--line)] bg-[var(--glass)] p-5">
                <div className="flex flex-wrap gap-x-10 gap-y-3">
                  <div>
                    <span className="mono-label block mb-1">Total</span>
                    <span className="text-sm font-semibold text-[var(--fg)]">
                      {"$" + total.toFixed(2)}
                      <span className="text-[var(--fg-faint)] font-normal ml-1">
                        {selectedSymbol}
                      </span>
                    </span>
                  </div>
                  <div>
                    <span className="mono-label block mb-1">Protocol Fee</span>
                    <span className="text-sm font-semibold text-[var(--fg-muted)]">
                      {"$" + fee.toFixed(2)}
                      <span className="text-[var(--fg-faint)] font-normal ml-1">
                        (0.2%)
                      </span>
                    </span>
                  </div>
                  <div>
                    <span className="mono-label block mb-1">Valid Recipients</span>
                    <span className="text-sm font-semibold text-[var(--fg)]">
                      {validRecipients.length}
                      <span className="text-[var(--fg-faint)] font-normal ml-1">
                        of {recipients.length}
                      </span>
                    </span>
                  </div>
                </div>

                {status === "error" && error ? (
                  <div className="mt-4 border border-rose-500/20 bg-rose-500/[0.06] px-4 py-3">
                    <p className="text-xs text-rose-600/90 leading-relaxed">{error}</p>
                  </div>
                ) : null}

                {!showReview ? (
                  <button
                    type="button"
                    onClick={() => setShowReview(true)}
                    disabled={!canSend}
                    className={
                      "w-full mt-5 px-6 py-3.5 text-sm font-semibold transition-colors duration-200 " +
                      (!canSend
                        ? "bg-black/[0.04] text-[var(--fg-faint)] cursor-not-allowed"
                        : "bg-[var(--fg)] text-[var(--bg)]")
                    }
                  >
                    Review batch
                  </button>
                ) : (
                  <div className="mt-5 border-t border-[var(--line)] pt-5">
                    <p className="mono-label mb-3">Review before you sign</p>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {validRecipients.map((r, i) => (
                        <div
                          key={"ai-review-" + r.id}
                          className="flex items-center gap-3 bg-black/[0.03] border border-[var(--line)] px-4 py-3"
                        >
                          <span className="text-[11px] text-[var(--fg-faint)] font-mono w-5 shrink-0">
                            {i + 1}.
                          </span>
                          <span className="text-sm text-[var(--fg-muted)] flex-1 truncate font-medium">
                            {r.name || "Unnamed"}
                          </span>
                          <span className="text-[11px] text-[var(--fg-faint)] font-mono truncate max-w-[120px]">
                            {typeof r.address === "string" && r.address.length > 10
                              ? r.address.slice(0, 6) + "..." + r.address.slice(-4)
                              : r.address}
                          </span>
                          <span className="text-sm text-[var(--accent)] font-semibold shrink-0">
                            {"$" + (r.amount || 0).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-5">
                      <button
                        type="button"
                        onClick={() => setShowReview(false)}
                        disabled={isSending}
                        className="px-5 py-3 text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] border border-[var(--line)] hover:border-[var(--line-strong)] transition-colors duration-200 disabled:opacity-40"
                      >
                        Back to edit
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isSending || !canSend}
                        className={
                          "flex-1 px-6 py-3 text-sm font-semibold transition-colors duration-200 " +
                          (isSending || !canSend
                            ? "bg-black/[0.04] text-[var(--fg-faint)] cursor-not-allowed"
                            : "bg-[var(--accent)] text-white hover:opacity-90")
                        }
                      >
                        {status === "preparing"
                          ? "Preparing..."
                          : status === "sending"
                            ? "Sending..."
                            : "Confirm & Send"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
