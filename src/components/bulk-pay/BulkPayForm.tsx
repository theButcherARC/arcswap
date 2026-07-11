"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { parseUnits, createPublicClient, http } from "viem";
import type { Address } from "viem";
import { useBulkPay } from "@/hooks/useBulkPay";
import { toChecksumAddress } from "@/utils/address";
import { isValidAddress } from "@/utils/address";
import { parseTokenAmount } from "@/utils/format";
import { TOKENS, BULK_PAY_MAX_RECIPIENTS } from "@/constants/tokens";
import { parsePaymentInstruction } from "@/services/agentService";
import BulkPaySuccess from "./BulkPaySuccess";
import RecipientRow from "./RecipientRow";
import PaymentConfirmDialog from "./PaymentConfirmDialog";
import type { ParsedBulkPay } from "@/services/agentService";
import type { Recipient, InputMode } from "@/types/bulkPay";

/* --------------------------------------------------------------- */
/*  Gas Estimate Hook                                               */
/* --------------------------------------------------------------- */

const arcPublicClient = createPublicClient({
  chain: {
    id: 5042002,
    name: "Arc Testnet",
    nativeCurrency: { name: "USD Coin", symbol: "USDC", decimals: 6 },
    rpcUrls: { default: { http: ["https://rpc.testnet.arc.network"] } },
  } as any,
  transport: http("https://rpc.testnet.arc.network"),
});

const GAS_PER_RECIPIENT = 50_000n;

function useGasEstimate(recipientCount: number) {
  const [gasUsd, setGasUsd] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);
  const abortRef = useRef(false);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (recipientCount === 0) {
      setGasUsd(null);
      return;
    }
    abortRef.current = false;
    setLoading(true);

    arcPublicClient.getGasPrice().then((gasPrice) => {
      if (abortRef.current) return;
      // gasPrice is in wei (18 decimals). Arc native currency is USDC with 6 decimals,
      // but the chain represents 1 USDC as 1e18 at the EVM level.
      // Formula: (gasPrice * GAS_PER_RECIPIENT * count) / 1e18 = USDC value
      const totalWei = gasPrice * GAS_PER_RECIPIENT * BigInt(recipientCount);
      const usd = Number(totalWei) / 1e18;
      setGasUsd(usd);
      setLoading(false);
    }).catch(() => {
      if (abortRef.current) return;
      setGasUsd(null);
      setLoading(false);
    });

    return () => {
      abortRef.current = true;
    };
  }, [recipientCount, tick]);

  return { gasUsd, loading, refresh };
}

/* --------------------------------------------------------------- */
/*  Helpers                                                        */
/* --------------------------------------------------------------- */

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
    <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-medium text-emerald-400">
            Parsed {result.recipients.length} recipient
            {result.recipients.length !== 1 ? "s" : ""} successfully
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDiscard}
            className="px-3.5 py-1.5 text-xs font-medium text-white/50 hover:text-white/70 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.03] transition-all duration-200 active:scale-95"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={onApply}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-lg shadow-emerald-600/20 transition-all duration-200 active:scale-95"
          >
            Apply All
          </button>
        </div>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {result.recipients.map((r, i) => (
          <div
            key={"ai-preview-" + i}
            className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3"
          >
            <span className="text-[11px] text-white/20 font-mono w-5 shrink-0">
              {i + 1}.
            </span>
            <span className="text-sm text-white/70 flex-1 truncate font-medium">
              {r.name || "Unnamed"}
            </span>
            <span className="text-[11px] text-white/25 font-mono truncate max-w-[120px]">
              {r.address
                ? r.address.slice(0, 6) + "..." + r.address.slice(-4)
                : "No address"}
            </span>
            <span className="text-sm text-violet-400 font-semibold shrink-0">
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
      <span className="text-sm text-white/50">Parsing your instructions...</span>
    </div>
  );
}

/* --------------------------------------------------------------- */
/*  Main Component                                                  */
/* --------------------------------------------------------------- */

export default function BulkPayForm() {
  /* ---- State ---- */
  const [inputMode, setInputMode] = useState<InputMode>("percentage");
  const [totalAmountInput, setTotalAmountInput] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState<"USDC" | "EURC">("USDC");

  const HARDCODED_TOKENS = {
    USDC: { ...TOKENS.USDC, address: "0x3600000000000000000000000000000000000000" as `0x${string}` },
    EURC: { ...TOKENS.EURC, address: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" as `0x${string}`, decimals: 6 },
  };

  const token = HARDCODED_TOKENS[selectedSymbol];
  const [recipients, setRecipients] = useState<Recipient[]>([createRecipient()]);
  const [showAgent, setShowAgent] = useState(true);
  const [agentInput, setAgentInput] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState("");
  const [agentResult, setAgentResult] = useState<ParsedBulkPay | null>(null);

  const [memo, setMemo] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null);

  const { executeBulkPay, status, txHash, error, reset } = useBulkPay();

  const isSending = status === "preparing" || status === "sending";

  /* ---- Total amount for hint calculations ---- */
  const totalAmountForHint = useMemo(() => {
    if (inputMode === "amount") {
      return recipients.reduce((sum, r) => sum + (r.amount || 0), 0);
    }
    return parseFloat(totalAmountInput) || 0;
  }, [recipients, inputMode, totalAmountInput]);

  /* ---- Summary calculations ---- */
  const summaryData = useMemo(() => {
    const count = recipients.length;
    let total: number;
    let allocatedValue: number;
    let allocatedLabel: string;
    let isFullyAllocated: boolean;
    let isOverAllocated: boolean;
    let validCount: number;

    if (inputMode === "amount") {
      total = recipients.reduce((sum, r) => sum + (r.amount || 0), 0);
      allocatedValue = total;
      allocatedLabel = "$" + total.toFixed(2);
      isFullyAllocated = recipients.every(
        (r) => r.amount !== null && r.amount > 0
      );
      isOverAllocated = false;
      validCount = recipients.filter(
        (r) => isValidAddress(r.address) && r.amount !== null && r.amount > 0
      ).length;
    } else {
      total = parseFloat(totalAmountInput) || 0;
      const pctSum = recipients.reduce(
        (sum, r) => sum + (r.percentage || 0),
        0
      );
      allocatedValue = pctSum;
      allocatedLabel = pctSum.toFixed(1) + "%";
      isFullyAllocated = Math.abs(pctSum - 100) < 0.5 && total > 0;
      isOverAllocated = pctSum > 100.5;
      validCount = recipients.filter(
        (r) =>
          isValidAddress(r.address) &&
          r.percentage !== null &&
          r.percentage > 0
      ).length;
    }

    const fee = Math.max(total * 0.002, 0.01);

    return {
      total,
      count,
      validCount,
      fee,
      allocatedValue,
      allocatedLabel,
      isFullyAllocated,
      isOverAllocated,
    };
  }, [recipients, inputMode, totalAmountInput]);

  /* ---- Gas estimate ---- */
  const { gasUsd, loading: gasLoading, refresh: refreshGas } = useGasEstimate(summaryData.validCount);

  /* ---- Can send validation ---- */
  const canSend = useMemo(() => {
    if (isSending) return false;
    if (recipients.length === 0) return false;

    const hasValid = recipients.some((r) => {
      const addrOk = isValidAddress(r.address);
      if (inputMode === "amount") {
        return addrOk && r.amount !== null && r.amount > 0;
      }
      return addrOk && r.percentage !== null && r.percentage > 0;
    });
    if (!hasValid) return false;

    if (inputMode === "percentage") {
      const totalNum = parseFloat(totalAmountInput);
      if (!totalNum || totalNum <= 0) return false;
      const pctSum = recipients.reduce(
        (sum, r) => sum + (r.percentage || 0),
        0
      );
      if (Math.abs(pctSum - 100) > 1) return false;
    } else {
      const sumAmt = recipients.reduce((s, r) => s + (r.amount || 0), 0);
      if (sumAmt <= 0) return false;
    }

    return true;
  }, [recipients, inputMode, totalAmountInput, isSending]);

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

    if (agentResult.totalAmount) {
      setTotalAmountInput(agentResult.totalAmount);
    }

    if (agentResult.recipients.some((r) => r.amount)) {
      setInputMode("amount");
    }

    setAgentResult(null);
    setAgentInput("");
    setShowAgent(false);
  }, [agentResult]);

  const handleDiscardAgent = useCallback(() => {
    setAgentResult(null);
  }, []);

  const handleExampleClick = useCallback((prompt: string) => {
    setAgentInput(prompt);
    setAgentError("");
    setAgentResult(null);
  }, []);

  /* ---- Form submit ---- */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSend) return;

      const validRecipients = recipients.filter((r) => {
        const addrOk = isValidAddress(r.address);
        if (inputMode === "amount") {
          return addrOk && r.amount !== null && r.amount > 0;
        }
        return addrOk && r.percentage !== null && r.percentage > 0;
      });

      if (validRecipients.length === 0) return;

      let totalAmountRaw: bigint;

      if (inputMode === "amount") {
        const totalNum = validRecipients.reduce(
          (sum, r) => sum + (r.amount || 0),
          0
        );
        try {
          totalAmountRaw = parseUnits(
            totalNum.toFixed(token.decimals),
            token.decimals
          );
        } catch {
          return;
        }
      } else {
        const parsed = parseTokenAmount(totalAmountInput, token.decimals);
        if (parsed === null) return;
        totalAmountRaw = parsed;
      }

      const transfers = validRecipients.map((r) => {
        let amount: bigint;

        if (inputMode === "amount") {
          try {
            amount = parseUnits(
              (r.amount || 0).toFixed(token.decimals),
              token.decimals
            );
          } catch {
            amount = 0n;
          }
        } else {
          const basisPoints = Math.round((r.percentage || 0) * 100);
          amount =
            (totalAmountRaw * BigInt(basisPoints)) / 10_000n;
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

      // Store payload and show confirmation dialog
      setPendingPayload({
        totalAmount: totalAmountRaw,
        token,
        recipients: transfers,
        memo: memo.trim() || undefined,
      });
      setShowConfirmDialog(true);
    },
    [canSend, recipients, inputMode, totalAmountInput, token]
  );

  // Handler for dialog confirmation
  const handleConfirmPayment = async () => {
    if (!pendingPayload) return;
    setShowConfirmDialog(false);
    await executeBulkPay(pendingPayload);
    setPendingPayload(null);
  };

  // Handler for dialog cancel
  const handleCancelPayment = () => {
    setShowConfirmDialog(false);
    setPendingPayload(null);
  };

  const atMaxRecipients = recipients.length >= BULK_PAY_MAX_RECIPIENTS;

  /* ================================================================ */
  /*  RENDER - single return, ternary for success state               */
  /* ================================================================ */
  return (
    <div className="min-h-screen bg-[#050508] pt-24 pb-12 px-4">
      {/* Payment Confirmation Dialog */}
      {pendingPayload && (
        <PaymentConfirmDialog
          isOpen={showConfirmDialog}
          recipients={pendingPayload.recipients}
          totalAmount={Number(pendingPayload.totalAmount) / Math.pow(10, pendingPayload.token.decimals)}
          symbol={selectedSymbol}
          gasEstimate={gasUsd || 0}
          onConfirm={handleConfirmPayment}
          onCancel={handleCancelPayment}
        />
      )}

      {status === "success" ? (
        <BulkPaySuccess
          txHash={txHash || ""}
          onReset={reset}
          tokenSymbol={selectedSymbol}
        />
      ) : (
        <div className="mx-auto max-w-4xl px-2 sm:px-4 [&>form]:rounded-2xl sm:[&>form]:rounded-3xl [&>form]:shadow-[0_0_80px_rgba(124,58,237,0.08),0_0_160px_rgba(99,102,241,0.04)]">
          {/* ===================== SECTION 1: PAGE HEADER ===================== */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-10">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                  Bulk Pay
                </span>
              </h1>
              <p className="text-sm text-white/40 mt-2 max-w-md">
                {selectedSymbol === "USDC"
                  ? "Send USDC to your entire team in one transaction"
                  : "Send EURC to your entire team in one transaction"}
              </p>
              {/* Token selector pills */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setSelectedSymbol("USDC")}
                  className={
                    "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 border active:scale-95 " +
                    (selectedSymbol === "USDC"
                      ? "animate-pill-active bg-violet-600/25 border-violet-500/60 text-violet-300 shadow-[0_0_16px_rgba(124,58,237,0.35)]"
                      : "bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/70 hover:border-violet-500/30 hover:bg-violet-500/[0.06]")
                  }
                >
                  <span>$</span>
                  <span>USDC</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSymbol("EURC")}
                  className={
                    "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 border active:scale-95 " +
                    (selectedSymbol === "EURC"
                      ? "animate-pill-active bg-violet-600/25 border-violet-500/60 text-violet-300 shadow-[0_0_16px_rgba(124,58,237,0.35)]"
                      : "bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/70 hover:border-violet-500/30 hover:bg-violet-500/[0.06]")
                  }
                >
                  {selectedSymbol === "EURC" && <span>€</span>}
                  <span>EURC</span>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Quick Pay / CSV Upload tabs */}
              <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.03] p-1 gap-1">
                <span className="rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white bg-white/[0.08] border border-white/10">
                  Quick Pay
                </span>
                <Link
                  href="/bulk-pay/upload"
                  className="rounded-lg px-3.5 py-1.5 text-xs font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all duration-200"
                >
                  CSV Upload
                </Link>
              </div>

              {/* Recipient counter badge */}
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl px-3.5 py-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="7"
                    cy="5"
                    r="2.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    className="text-white/40"
                  />
                  <path
                    d="M2 12.5C2 10.29 4.24 8.5 7 8.5C9.76 8.5 12 10.29 12 12.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    className="text-white/40"
                  />
                </svg>
                <span className="text-xs font-medium text-white/60">
                  {summaryData.validCount}/{recipients.length}
                </span>
              </div>

              {/* Token display */}
              <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl px-3.5 py-2">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/20">
                  <span className="text-white text-[10px] font-bold">
                    {selectedSymbol === "EURC" ? "€" : "$"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white leading-none">
                    {selectedSymbol}
                  </span>
                  <span className="text-[10px] text-white/30 mt-0.5">
                    Arc Network
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* ===================== SECTION 2: AI AGENT ===================== */}
            <div className="mb-8 relative rounded-2xl p-[1px] shadow-[0_0_40px_rgba(124,58,237,0.12)]"
              style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.35) 0%, rgba(99,102,241,0.15) 35%, rgba(139,92,246,0.08) 60%, rgba(124,58,237,0.3) 100%)",
                backgroundSize: "300% 300%",
                animation: "gradient-border-flow 5s ease infinite",
              }}
            >
            <div className="rounded-2xl bg-[#0c0c16]/95 backdrop-blur-2xl p-6">
              {/* Agent header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Animated VibeAI logo mark */}
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden"
                    style={{ background: "linear-gradient(135deg, #5b21b6 0%, #4f46e5 100%)" }}
                  >
                    {/* Rotating ring */}
                    <svg
                      className="absolute inset-0 w-full h-full animate-spin"
                      viewBox="0 0 36 36"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ animationDuration: "4s" }}
                    >
                      <circle
                        cx="18" cy="18" r="14"
                        stroke="rgba(167,139,250,0.35)"
                        strokeWidth="1.5"
                        strokeDasharray="22 66"
                        strokeLinecap="round"
                      />
                    </svg>
                    {/* Counter-rotating inner ring */}
                    <svg
                      className="absolute inset-0 w-full h-full animate-spin"
                      viewBox="0 0 36 36"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ animationDuration: "2.5s", animationDirection: "reverse" }}
                    >
                      <circle
                        cx="18" cy="18" r="9"
                        stroke="rgba(196,181,253,0.4)"
                        strokeWidth="1"
                        strokeDasharray="10 48"
                        strokeLinecap="round"
                      />
                    </svg>
                    {/* V mark — VibeFlow brand initial */}
                    <svg
                      width="14" height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="relative z-10"
                    >
                      <path
                        d="M2 2.5L7 11.5L12 2.5"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="7" cy="7" r="1.5" fill="rgba(196,181,253,0.8)" />
                    </svg>
                    {/* Pulse glow */}
                    <div
                      className="absolute inset-0 rounded-xl animate-pulse"
                      style={{
                        background: "radial-gradient(circle at center, rgba(139,92,246,0.4) 0%, transparent 70%)",
                      }}
                    />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      AI Payment Agent
                    </h2>
                    <p className="text-[11px] text-white/30">
                      Describe payments in natural language
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* VibeAI badge */}
                  <div className="flex items-center gap-1.5 rounded-lg border border-violet-500/20 bg-violet-500/[0.08] px-2.5 py-1">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 0.5L6.25 3.75L9.5 5L6.25 6.25L5 9.5L3.75 6.25L0.5 5L3.75 3.75L5 0.5Z"
                        fill="#8b5cf6"
                      />
                    </svg>
                    <span className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider">
                      VibeAI
                    </span>
                  </div>

                  {/* Collapse toggle */}
                  <button
                    type="button"
                    onClick={() => setShowAgent((prev) => !prev)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/40 hover:text-white/60 hover:border-white/20 transition-all duration-200"
                    aria-label={showAgent ? "Collapse agent" : "Expand agent"}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={
                        "transition-transform duration-200 " +
                        (showAgent ? "rotate-180" : "")
                      }
                    >
                      <path
                        d="M3.5 5.25L7 8.75L10.5 5.25"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Expanded agent content */}
              {showAgent ? (
                <div>
                  <textarea
                    value={agentInput}
                    onChange={(e) => {
                      setAgentInput(e.target.value);
                      setAgentError("");
                    }}
                    disabled={agentLoading}
                    placeholder="Pay Alice 500 USDC at 0x... and Bob 300 USDC at 0x..."
                    rows={3}
                    className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08] resize-none disabled:opacity-40 disabled:cursor-not-allowed"
                  />

                  {/* Example chips */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {EXAMPLE_PROMPTS.map((prompt, i) => (
                      <button
                        key={"example-" + i}
                        type="button"
                        onClick={() => handleExampleClick(prompt)}
                        disabled={agentLoading}
                        className="text-[11px] text-white/35 hover:text-white/60 border border-white/[0.06] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.05] rounded-lg px-3 py-1.5 transition-all duration-200 truncate max-w-[260px] disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {prompt.slice(0, 50)}
                        {prompt.length > 50 ? "..." : ""}
                      </button>
                    ))}
                  </div>

                  {/* Parse button */}
                  <button
                    type="button"
                    onClick={handleParseAgent}
                    disabled={agentLoading || !agentInput.trim()}
                    className={
                      "w-full mt-4 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] " +
                      (agentLoading || !agentInput.trim()
                        ? "bg-white/[0.06] text-white/25 cursor-not-allowed"
                        : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40 hover:scale-[1.01]")
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
                    <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-4 py-3">
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
                        <p className="text-xs text-rose-400/90 leading-relaxed">
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
              ) : null}
            </div>
            </div>

            {/* ===================== SECTION 3: INPUT MODE TOGGLE ===================== */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
                Distribution Mode
              </span>
              <div className="inline-flex rounded-xl bg-white/[0.04] border border-white/[0.08] p-1">
                <button
                  type="button"
                  onClick={() => setInputMode("percentage")}
                  disabled={isSending}
                  className={
                    "px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 " +
                    (inputMode === "percentage"
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                      : "text-white/60 hover:text-white hover:bg-white/[0.04]")
                  }
                >
                  % Split
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("amount")}
                  disabled={isSending}
                  className={
                    "px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 " +
                    (inputMode === "amount"
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                      : "text-white/60 hover:text-white hover:bg-white/[0.04]")
                  }
                >
                  $ Amount
                </button>
              </div>
            </div>

            {/* ===================== SECTION 4: TOTAL AMOUNT (percentage mode) ===================== */}
            {inputMode === "percentage" ? (
              <div className="mb-8 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 p-6">
                <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2.5">
                  Total Amount to Distribute
                </label>
                <div className="flex items-stretch gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-white/30 font-medium pointer-events-none">
                      $                     </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={totalAmountInput}
                      onChange={(e) => setTotalAmountInput(e.target.value)}
                      disabled={isSending}
                      placeholder="0.00"
                      className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 pl-9 pr-4 py-4 text-xl font-semibold focus:outline-none focus:border-violet-500/50 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.03] px-4 shrink-0">
                    <span className="text-sm font-semibold text-white/70">
                      USDC
                    </span>
                  </div>
                </div>
                {/* Fee estimate */}
                {parseFloat(totalAmountInput) > 0 ? (
                  <div className="flex items-center gap-2 mt-3">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="6"
                        cy="6"
                        r="5"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-white/25"
                      />
                      <path
                        d="M6 3V6.5L8.5 8"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        className="text-white/25"
                      />
                    </svg>
                    <span className="text-[11px] text-white/25">
                      Protocol fee: {summaryData.fee.toFixed(2)} USDC (0.2%)
                    </span>
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* ===================== SECTION 5: RECIPIENTS ===================== */}
            <div className="mb-6">
              {/* Column headers */}
              <div className="flex items-center gap-3 px-4 mb-3">
                <div className="w-7 shrink-0" />
                <div className="min-w-[120px] flex-1">
                  <span className="text-[10px] font-medium text-white/20 uppercase tracking-wider">
                    Recipient
                  </span>
                </div>
                <div className="min-w-[180px] flex-[1.5]">
                  <span className="text-[10px] font-medium text-white/20 uppercase tracking-wider">
                    Address
                  </span>
                </div>
                <div className="w-[130px] shrink-0 text-right">
                  <span className="text-[10px] font-medium text-white/20 uppercase tracking-wider">
                    {inputMode === "amount" ? "Amount" : "Percentage"}
                  </span>
                </div>
                <div className="w-8 shrink-0" />
              </div>

              {/* Recipient rows */}
              <div className="space-y-3">
                {recipients.map((recipient, i) => (
                  <RecipientRow
                    key={recipient.id}
                    recipient={recipient}
                    index={i}
                    inputMode={inputMode}
                    totalAmount={totalAmountForHint}
                    onNameChange={handleNameChange}
                    onAddressChange={handleAddressChange}
                    onPercentageChange={handlePercentageChange}
                    onAmountChange={handleAmountChange}
                    onRemove={removeRecipient}
                    isDisabled={isSending}
                  />
                ))}
              </div>

              {/* Payroll memo input */}
              <div className="mt-6">
                <label className="block text-xs font-medium text-white/40 mb-1.5">
                  Payroll Label <span className="text-white/20">(optional)</span>
                </label>
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value.slice(0, 100))}
                  disabled={isSending}
                  placeholder="e.g. July Salary, Freelancer Batch, Marketing Team"
                  maxLength={100}
                  className={
                    "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 " +
                    "text-sm text-white placeholder:text-white/20 " +
                    "focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.05] " +
                    "transition-all duration-200 " +
                    (isSending ? "opacity-50 cursor-not-allowed" : "")
                  }
                />
                <p className="mt-1.5 text-[11px] text-white/25">
                  Stored onchain with your transaction
                  {memo.length > 0 && (
                    <span className="ml-2 text-white/20">{memo.length}/100</span>
                  )}
                </p>
              </div>

              {/* Add recipient button */}
              <button
                type="button"
                onClick={addRecipient}
                disabled={atMaxRecipients || isSending}
                className={
                  "w-full mt-3 rounded-2xl border border-dashed py-4 " +
                  "text-sm font-medium transition-all duration-300 " +
                  (atMaxRecipients || isSending
                    ? "border-white/10 bg-white/[0.02] text-white/15 cursor-not-allowed"
                    : "animate-add-btn-pulse border-violet-500/25 bg-white/[0.02] text-white/50 hover:text-violet-300 hover:bg-violet-500/[0.06] hover:border-violet-500/50 hover:shadow-[0_0_20px_rgba(124,58,237,0.15)] active:scale-[0.99]")
                }
              >
                {atMaxRecipients ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
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
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M7 4.5V9.5M4.5 7H9.5"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Maximum {BULK_PAY_MAX_RECIPIENTS} recipients
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7 1V13M1 7H13"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    Add Recipient
                  </span>
                )}
              </button>
            </div>

            {/* ===================== SECTION 6 + 7: SUMMARY + SEND (sticky) ===================== */}
            <div className="sticky bottom-4 z-30 mt-10">
              {/* Summary + send card */}
              <div
                className={
                  "rounded-2xl border p-5 shadow-2xl shadow-black/60 backdrop-blur-2xl transition-all duration-300 " +
                  (summaryData.isFullyAllocated && !summaryData.isOverAllocated
                    ? "border-emerald-500/25 bg-[#0a1010]/95"
                    : summaryData.isOverAllocated
                      ? "border-rose-500/25 bg-[#14090d]/95"
                      : "border-white/10 bg-[#0b0b12]/95")
                }
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 flex-1">
                  {/* Total */}
                  <div>
                    <span className="block text-[10px] font-medium text-white/30 uppercase tracking-wider mb-1.5">
                      Total
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {inputMode === "amount"
                        ? "$" + summaryData.total.toFixed(2)
                        : totalAmountInput
                          ? "$" + (parseFloat(totalAmountInput) || 0).toFixed(2)
                          : "$0.00"}
                      <span className="text-white/30 font-normal ml-1">
                        USDC
                      </span>
                    </span>
                  </div>

                  {/* Valid Recipients */}
                  <div>
                    <span className="block text-[10px] font-medium text-white/30 uppercase tracking-wider mb-1.5">
                      Valid Recipients
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {summaryData.validCount}
                      <span className="text-white/30 font-normal ml-1">
                        of {summaryData.count}
                      </span>
                    </span>
                  </div>

                  {/* Protocol Fee */}
                  <div>
                    <span className="block text-[10px] font-medium text-white/30 uppercase tracking-wider mb-1.5">
                      Protocol Fee
                    </span>
                    <span className="text-sm font-semibold text-white/60">
                      ${summaryData.fee.toFixed(2)}
                      <span className="text-white/25 font-normal ml-1">
                        (0.2%)
                      </span>
                    </span>
                  </div>

                  {/* Allocated */}
                  <div>
                    <span className="block text-[10px] font-medium text-white/30 uppercase tracking-wider mb-1.5">
                      {inputMode === "percentage" ? "Allocated" : "Sum"}
                    </span>
                    <span
                      className={
                        "text-sm font-semibold " +
                        (inputMode === "percentage"
                          ? summaryData.isFullyAllocated &&
                            !summaryData.isOverAllocated
                            ? "text-emerald-400"
                            : summaryData.isOverAllocated
                              ? "text-rose-400"
                              : "text-white/40"
                          : "text-white")
                      }
                    >
                      {inputMode === "percentage"
                        ? summaryData.allocatedLabel
                        : "$" + summaryData.total.toFixed(2)}
                      {inputMode === "percentage" &&
                      summaryData.isFullyAllocated &&
                      !summaryData.isOverAllocated ? (
                        <svg
                          className="inline ml-1.5 -mt-0.5"
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle
                            cx="7"
                            cy="7"
                            r="5.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M4.5 7L6.5 9L9.5 5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : null}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:w-72 lg:shrink-0">

              {/* Error display */}
              {status === "error" && error ? (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-4 py-3.5">
                  <div className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 shrink-0"
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
                        stroke="#f43f5e"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M8 5V8.5"
                        stroke="#f43f5e"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <circle cx="8" cy="11" r="0.75" fill="#f43f5e" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-rose-400">
                        Transaction Failed
                      </p>
                      <p className="text-xs text-rose-400/70 mt-0.5 leading-relaxed">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Stats bar */}
              <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 flex-wrap text-xs">
                {/* Gas */}
                <span className="text-white/40 whitespace-nowrap">
                  {"Gas: "}
                  <span key={gasUsd?.toFixed(4)} className="text-violet-300 font-medium animate-value-flash">
                    {gasLoading ? "..." : gasUsd !== null ? "~$" + gasUsd.toFixed(4) : "—"}
                  </span>
                  {" USDC"}
                </span>
                <span className="text-white/20">|</span>
                {/* Recipients */}
                <span className="text-white/40 whitespace-nowrap">
                  {"Recipients: "}
                  <span key={summaryData.validCount} className="text-white/60 font-medium animate-value-flash">
                    {summaryData.validCount}
                  </span>
                </span>
                <span className="text-white/20">|</span>
                {/* Total */}
                <span className="text-white/40 whitespace-nowrap">
                  {"Total: "}
                  <span key={summaryData.total.toFixed(2)} className="text-white/70 font-medium animate-value-flash">
                    {(selectedSymbol === "EURC" ? "€" : "$") + summaryData.total.toFixed(2)}
                  </span>
                  {" " + selectedSymbol}
                </span>
                <span className="text-white/20">|</span>
                {/* Powered by Arc */}
                <span className="text-white/20 whitespace-nowrap">Powered by Arc</span>
                {/* Refresh — pushed to the right */}
                <button
                  type="button"
                  onClick={refreshGas}
                  title="Refresh gas estimate"
                  className="ml-auto shrink-0 flex items-center justify-center w-5 h-5 rounded hover:bg-white/[0.06] transition-colors duration-150"
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={gasLoading ? "animate-spin text-violet-400" : "text-white/30"}
                  >
                    <path d="M10.5 6A4.5 4.5 0 1 1 6 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    <path d="M6 1.5L8 3.5M6 1.5L8 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* Send button */}
              <button
                type="submit"
                disabled={!canSend}
                className={
                  "w-full rounded-xl px-6 py-3.5 text-sm font-semibold transition-all duration-300 active:scale-[0.98] " +
                  (canSend
                    ? "animate-send-pulse bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 hover:scale-[1.01]"
                    : "bg-white/[0.06] text-white/20 cursor-not-allowed")
                }
              >
                {isSending ? (
                  <span className="flex items-center justify-center gap-3">
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
                        strokeOpacity="0.2"
                      />
                      <path
                        d="M10 2A8 8 0 0118 10"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    {status === "preparing"
                      ? "Preparing Transaction..."
                      : "Confirm in MetaMask..."}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2.5">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 9H15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M10 4L15 9L10 14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Send {summaryData.validCount} Payment
                    {summaryData.validCount !== 1 ? "s" : ""}
                  </span>
                )}
              </button>
                </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
