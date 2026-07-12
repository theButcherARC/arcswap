"use client";

import React, { useMemo, useState, useRef } from "react";
import { isValidAddress } from "@/utils/address";
import type { Recipient, InputMode } from "@/types/bulkPay";

interface RecipientRowProps {
  recipient: Recipient;
  index: number;
  inputMode: InputMode;
  totalAmount: number;
  onNameChange: (id: string, value: string) => void;
  onAddressChange: (id: string, value: string) => void;
  onPercentageChange: (id: string, value: string) => void;
  onAmountChange: (id: string, value: string) => void;
  onRemove: (id: string) => void;
  isDisabled: boolean;
}

export default function RecipientRow({
  recipient,
  index,
  inputMode,
  totalAmount,
  onNameChange,
  onAddressChange,
  onPercentageChange,
  onAmountChange,
  onRemove,
  isDisabled,
}: RecipientRowProps) {
  const [handleState, setHandleState] = useState<
    'idle' | 'resolving' | 'resolved' | 'not_found' | 'error'
  >('idle');
  const [handleText, setHandleText] = useState('');
  const resolveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isHandleInput = (val: string) => val.trimStart().startsWith('@') || /^VIBE-/i.test(val.trim());

  async function resolveHandle(raw: string) {
    const trimmed = raw.trim();
    const isVibeId = /^VIBE-/i.test(trimmed);
    const identifier = isVibeId ? trimmed : trimmed.replace(/^@/, '');
    if (!identifier) return;
    setHandleState('resolving');
    try {
      const res = await fetch('/api/social/resolve?username=' + encodeURIComponent(identifier));
      const json = await res.json();
      if (res.ok && json.address) {
        const label = isVibeId
          ? (json.vibeId ?? identifier) + ' \u2192 ' + json.address.slice(0, 6) + '...' + json.address.slice(-4)
          : '@' + json.username + ' \u2192 ' + json.address.slice(0, 6) + '...' + json.address.slice(-4);
        setHandleState('resolved');
        setHandleText(label);
        onAddressChange(recipient.id, json.address);
      } else {
        setHandleState('not_found');
        setHandleText((isVibeId ? identifier : '@' + identifier) + ' is not registered');
      }
    } catch {
      setHandleState('error');
      setHandleText('Lookup failed');
    }
  }

  function handleAddressInput(value: string) {
    // Reset handle state when user edits
    if (handleState !== 'idle') {
      setHandleState('idle');
      setHandleText('');
    }
    onAddressChange(recipient.id, value);

    if (isHandleInput(value)) {
      if (resolveTimer.current) clearTimeout(resolveTimer.current);
      resolveTimer.current = setTimeout(() => resolveHandle(value), 600);
    }
  }

  const addressValid = useMemo(() => {
    if (!recipient.address || recipient.address.trim().length === 0) {
      return false;
    }
    return isValidAddress(recipient.address);
  }, [recipient.address]);

  const addressHasInput = recipient.address.trim().length > 0;

  const percentageHint = useMemo(() => {
    if (inputMode !== "amount") return null;
    if (recipient.amount === null || recipient.amount <= 0) return null;
    if (totalAmount <= 0) return null;
    const pct = (recipient.amount / totalAmount) * 100;
    return pct.toFixed(2) + "%";
  }, [inputMode, recipient.amount, totalAmount]);

  const dollarHint = useMemo(() => {
    if (inputMode !== "percentage") return null;
    if (recipient.percentage === null || recipient.percentage <= 0) return null;
    if (totalAmount <= 0) return null;
    const dollars = (totalAmount * recipient.percentage) / 100;
    return "$" + dollars.toFixed(2);
  }, [inputMode, recipient.percentage, totalAmount]);

  const activeValue =
    inputMode === "amount" ? recipient.amountInput : recipient.percentageInput;

  const activePlaceholder = inputMode === "amount" ? "0.00" : "0.00";

  const handleActiveChange = (value: string) => {
    if (inputMode === "amount") {
      onAmountChange(recipient.id, value);
    } else {
      onPercentageChange(recipient.id, value);
    }
  };

  const inputClasses =
    "w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] transition-all duration-200 hover:border-white/20 hover:bg-white/[0.07] disabled:opacity-40 disabled:cursor-not-allowed";

  const addressClasses =
    "w-full rounded-xl border px-4 py-3 text-sm font-mono placeholder-white/30 focus:outline-none transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed " +
    (addressValid
      ? "border-emerald-500/40 bg-emerald-500/5 text-white focus:border-emerald-500/60"
      : addressHasInput
        ? "border-rose-500/40 bg-rose-500/5 text-white focus:border-rose-500/60"
        : "border-white/10 bg-white/5 text-white focus:border-violet-500/50 hover:border-white/20 hover:bg-white/[0.08]");

  const rowNumber = index + 1;

  return (
    <div className="group animate-slide-in-top rounded-2xl bg-white/5 border border-white/10 p-4 hover:border-violet-500/25 hover:bg-white/[0.08] hover:shadow-[0_0_20px_rgba(124,58,237,0.08)] transition-all duration-200">
      <div className="flex flex-wrap items-start gap-3">
        {/* Row number badge */}
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/20 mt-3">
          <span className="text-[11px] font-bold text-violet-400">
            {rowNumber}
          </span>
        </div>

        {/* Name input */}
        <div className="min-w-[120px] flex-1">
          <label className="block text-[10px] font-medium text-white/30 uppercase tracking-wider mb-1.5">
            Name
          </label>
          <input
            type="text"
            value={recipient.name}
            onChange={(e) => onNameChange(recipient.id, e.target.value)}
            disabled={isDisabled}
            placeholder="Recipient name"
            className={inputClasses}
          />
        </div>

        {/* Address input */}
        <div className="min-w-[180px] flex-[1.5]">
          <label className="block text-[10px] font-medium text-white/30 uppercase tracking-wider mb-1.5">
            Address, @username, or VIBE-ID
          </label>
          <div className="relative">
            <input
              type="text"
              value={recipient.address}
              onChange={(e) => handleAddressInput(e.target.value)}
              disabled={isDisabled}
              placeholder="0x..., @username, or VIBE-XXXXXX"
              className={addressClasses + " pr-9"}
            />
            {addressValid && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
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
                    stroke="#10b981"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M5.5 8L7.5 10L10.5 6"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
            {addressHasInput && !addressValid && handleState === 'idle' && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.5" stroke="#f43f5e" strokeWidth="1.5" />
                  <path d="M6 6L10 10M10 6L6 10" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            )}
          </div>
          {/* Handle resolution feedback */}
          {handleState === 'resolving' && (
            <p className="mt-1.5 text-[11px] text-white/40 animate-pulse">Resolving handle...</p>
          )}
          {handleState === 'resolved' && (
            <p className="mt-1.5 text-[11px] text-emerald-400 font-mono">{handleText}</p>
          )}
          {handleState === 'not_found' && (
            <p className="mt-1.5 text-[11px] text-amber-400">
              {handleText} &mdash;{' '}
              <button
                type="button"
                className="underline hover:text-amber-300 transition-colors"
                onClick={() => {
                  setHandleState('idle');
                  onAddressChange(recipient.id, '');
                }}
              >
                paste address instead
              </button>
            </p>
          )}
          {handleState === 'error' && (
            <p className="mt-1.5 text-[11px] text-rose-400">{handleText}</p>
          )}
        </div>

        {/* Amount / Percentage input */}
        <div className="w-[130px] shrink-0">
          <label className="block text-[10px] font-medium text-white/30 uppercase tracking-wider mb-1.5">
            {inputMode === "amount" ? "Amount" : "Percentage"}
          </label>
          <div className="relative">
            {inputMode === "amount" && (
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/30 pointer-events-none font-medium">
                $               </span>
            )}
            <input
              type="text"
              inputMode="decimal"
              value={activeValue}
              onChange={(e) => handleActiveChange(e.target.value)}
              disabled={isDisabled}
              placeholder={activePlaceholder}
              className={
                "w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 py-3 text-sm text-right focus:outline-none focus:border-violet-500/50 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed " +
                (inputMode === "amount" ? "pl-8 pr-4" : "pl-4 pr-8")
              }
            />
            {inputMode === "percentage" && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-white/30 pointer-events-none font-medium">
                %
              </span>
            )}
          </div>
          {/* Cross-calculation hint */}
          {(percentageHint || dollarHint) && (
            <p className="mt-1.5 text-[11px] text-white/25 text-right font-mono">
              {inputMode === "amount"
                ? "= " + percentageHint
                : "= " + dollarHint}
            </p>
          )}
        </div>

        {/* Remove button */}
        <button
          type="button"
          onClick={() => onRemove(recipient.id)}
          disabled={isDisabled}
          className="mt-5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-white/30 transition-all duration-200 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 active:scale-90 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:border-white/10 disabled:hover:bg-white/[0.02] disabled:hover:text-white/30"
          aria-label={"Remove recipient " + rowNumber}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 4L10 10M10 4L4 10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
