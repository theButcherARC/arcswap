"use client";

import { useState, useCallback, useMemo } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { RecipientRow } from "./RecipientRow";
import { TokenSelector } from "@/components/swap/TokenSelector";
import { useBulkPay } from "@/hooks/useBulkPay";
import { toChecksumAddress } from "@/utils/address";
import { parseTokenAmount } from "@/utils/format";
import { TOKENS, BULK_PAY_MAX_RECIPIENTS } from "@/constants/tokens";
import type { Recipient } from "@/types/bulkPay";
import type { Token } from "@/types/token";
import type { Address } from "viem";
import { BulkPaySuccess } from "./BulkPaySuccess";

function createRecipient(): Recipient {
  return {
    id: crypto.randomUUID(),
    name: "",
    address: "",
    percentageInput: "",
    percentage: null,
  };
}

export function BulkPayForm() {
  const [totalAmountInput, setTotalAmountInput] = useState("");
  const [token, setToken] = useState<Token>(TOKENS.USDC);
  const [recipients, setRecipients] = useState<Recipient[]>([createRecipient()]);

  const { status, txHash, error, executeBulkPay, reset } = useBulkPay();

  const isLoading = status === "preparing" || status === "sending";

  const totalAmountRaw = parseTokenAmount(totalAmountInput, token.decimals) ?? 0n;

  const totalPercentage = useMemo(
    () => recipients.reduce((sum, r) => sum + (r.percentage ?? 0), 0),
    [recipients]
  );

  const percentageError = totalPercentage > 100 ? "Percentages exceed 100%" : undefined;

  const feeEstimate = "≈ $0.10";

  const handleAddRecipient = useCallback(() => {
    if (recipients.length >= BULK_PAY_MAX_RECIPIENTS) return;
    setRecipients((prev) => [...prev, createRecipient()]);
  }, [recipients.length]);

  const handleRemove = useCallback((id: string) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const handleNameChange = useCallback((id: string, value: string) => {
    setRecipients((prev) =>
      prev.map((r) => (r.id === id ? { ...r, name: value } : r))
    );
  }, []);

  const handleAddressChange = useCallback((id: string, value: string) => {
    setRecipients((prev) =>
      prev.map((r) => (r.id === id ? { ...r, address: value as Address | "" } : r))
    );
  }, []);

  const handlePercentageChange = useCallback((id: string, value: string) => {
    const parsed = value === "" ? null : Number(value);
    setRecipients((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, percentageInput: value, percentage: parsed !== null && !isNaN(parsed) ? parsed : null }
          : r
      )
    );
  }, []);

  function handleSubmit() {
    const validRecipients = recipients
      .filter((r) => {
        const addr = toChecksumAddress(r.address);
        return addr && r.percentage !== null && r.percentage > 0;
      })
      .map((r) => ({
        address: toChecksumAddress(r.address) as `0x${string}`,
        amount: (totalAmountRaw * BigInt(Math.round((r.percentage ?? 0) * 100))) / 10_000n,
        name: r.name || r.address.slice(0, 8),
      }));

    if (validRecipients.length === 0 || totalAmountRaw === 0n || totalPercentage > 100) return;

    executeBulkPay({ totalAmount: totalAmountRaw, token, recipients: validRecipients });
  }

return (
    <Card className="mx-auto max-w-2xl w-full">
      <CardHeader>
        <CardTitle>Bulk Pay</CardTitle>
        {!(status === "success" && txHash) && (
          <Badge variant="info">
            {recipients.length} / {BULK_PAY_MAX_RECIPIENTS}
          </Badge>
        )}
      </CardHeader>

      {status === "success" && txHash ? (
        <BulkPaySuccess txHash={txHash} onReset={reset} />
      ) : (
        <>
          <div className="mb-5 flex items-end gap-3">
            <div className="flex-1">
              <Input
                label="Total amount"
                type="number"
                min="0"
                placeholder="0.00"
                value={totalAmountInput}
                onChange={(e) => setTotalAmountInput(e.target.value)}
                rightSlot={
                  <TokenSelector selected={token} onChange={setToken} disabled={isLoading} />
                }
              />
            </div>
            <div className="shrink-0 rounded-2xl border border-surface-100 bg-surface-25 px-4 py-3 text-right">
              <p className="text-xs text-surface-300">Fee estimate</p>
              <p className="text-sm font-semibold text-arc-900">{feeEstimate}</p>
            </div>
          </div>

          <div className="mb-2 grid grid-cols-[auto_1fr_1.4fr_auto_auto] gap-3 px-3 text-xs font-medium text-surface-300">
            <span className="w-4" />
            <span>Recipient</span>
            <span>Address</span>
            <span className="w-20">Share</span>
            <span />
          </div>

          <div className="space-y-2">
            {recipients.map((r, i) => (
              <RecipientRow
                key={r.id}
                recipient={r}
                index={i}
                onNameChange={handleNameChange}
                onAddressChange={handleAddressChange}
                onPercentageChange={handlePercentageChange}
                onRemove={handleRemove}
                isDisabled={isLoading}
              />
            ))}
          </div>

          {recipients.length < BULK_PAY_MAX_RECIPIENTS && (
            <button
              type="button"
              onClick={handleAddRecipient}
              disabled={isLoading}
              className="mt-4 w-full rounded-2xl border border-dashed border-surface-200 py-3 text-sm font-medium text-surface-300 hover:border-arc-300 hover:text-arc-600 transition-colors disabled:cursor-not-allowed"
            >
              + Add recipient
            </button>
          )}

          <div className="mt-5 flex items-center justify-between rounded-2xl bg-arc-50 px-4 py-3 text-sm">
            <span className="text-arc-700">Allocated</span>
            <span className={`font-semibold ${percentageError ? "text-rose-500" : "text-arc-900"}`}>
              {totalPercentage}% {percentageError && `· ${percentageError}`}
            </span>
          </div>

          {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}

          <Button
            className="mt-5 w-full"
            size="lg"
            isLoading={isLoading}
            onClick={handleSubmit}
            disabled={!totalAmountInput || totalPercentage > 100 || isLoading}
          >
            {status === "preparing" ? "Preparing..." : status === "sending" ? "Confirm in MetaMask..." : "Send Payments"}
          </Button>
        </>
      )}
    </Card>
  );
}