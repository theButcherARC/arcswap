"use client";

import { useState, useCallback } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RecipientRow } from "./RecipientRow";
import { useBulkPay } from "@/hooks/useBulkPay";
import { parseTokenAmount } from "@/utils/format";
import { toChecksumAddress } from "@/utils/address";
import { TOKENS, BULK_PAY_MAX_RECIPIENTS } from "@/constants/tokens";
import type { Recipient } from "@/types/bulkPay";
import type { Token } from "@/types/token";
import type { Address } from "viem";

function createRecipient(): Recipient {
  return {
    id: crypto.randomUUID(),
    address: "",
    amountInput: "",
    amountParsed: null,
    token: TOKENS.USDC,
  };
}

/**
 * Bulk pay form shell.
 *
 * Manages a list of up to BULK_PAY_MAX_RECIPIENTS recipients.
 * Delegates execution to the useBulkPay hook.
 *
 * TODO (Phase 4): Wire handleSubmit to executeBulkPay and show per-transfer status.
 */
export function BulkPayForm() {
  const [recipients, setRecipients] = useState<Recipient[]>([createRecipient()]);
  const { status, transferStatuses, error, executeBulkPay } = useBulkPay();

  const isLoading = status === "approving" || status === "sending";

  const handleAddRecipient = useCallback(() => {
    if (recipients.length >= BULK_PAY_MAX_RECIPIENTS) return;
    setRecipients((prev) => [...prev, createRecipient()]);
  }, [recipients.length]);

  const handleRemove = useCallback((id: string) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const handleAddressChange = useCallback((id: string, value: string) => {
    setRecipients((prev) =>
      prev.map((r) => (r.id === id ? { ...r, address: value as Address | "" } : r))
    );
  }, []);

  const handleAmountChange = useCallback((id: string, value: string) => {
    setRecipients((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, amountInput: value, amountParsed: parseTokenAmount(value, r.token.decimals) }
          : r
      )
    );
  }, []);

  const handleTokenChange = useCallback((id: string, token: Token) => {
    setRecipients((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, token, amountParsed: parseTokenAmount(r.amountInput, token.decimals) }
          : r
      )
    );
  }, []);

  function handleSubmit() {
    const valid = recipients.filter((r) => {
      const addr = toChecksumAddress(r.address);
      return addr && r.amountParsed !== null && r.amountParsed > 0n;
    });

    if (valid.length === 0) return;

    // TODO (Phase 4): Call executeBulkPay with validated recipients
  }

  return (
    <Card className="mx-auto max-w-2xl w-full">
      <CardHeader>
        <CardTitle>Bulk Pay</CardTitle>
        <Badge variant="info">
          {recipients.length} / {BULK_PAY_MAX_RECIPIENTS}
        </Badge>
      </CardHeader>

      <div className="space-y-3">
        {recipients.map((r, i) => (
          <RecipientRow
            key={r.id}
            recipient={r}
            index={i}
            onAddressChange={handleAddressChange}
            onAmountChange={handleAmountChange}
            onTokenChange={handleTokenChange}
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
          className="mt-4 w-full rounded-xl border border-dashed border-surface-200 py-2.5 text-sm text-surface-200 hover:border-arc-300 hover:text-arc-500 transition-colors disabled:cursor-not-allowed"
        >
          + Add recipient
        </button>
      )}

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <Button
        className="mt-5 w-full"
        size="lg"
        isLoading={isLoading}
        onClick={handleSubmit}
      >
        {status === "approving" ? "Approving…" : status === "sending" ? "Sending…" : "Send Payments"}
      </Button>
    </Card>
  );
}
