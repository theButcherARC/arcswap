"use client";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TokenSelector } from "@/components/swap/TokenSelector";
import { isValidAddress } from "@/utils/address";
import type { Recipient } from "@/types/bulkPay";
import type { Token } from "@/types/token";

interface RecipientRowProps {
  recipient: Recipient;
  index: number;
  onAddressChange: (id: string, value: string) => void;
  onAmountChange: (id: string, value: string) => void;
  onTokenChange: (id: string, token: Token) => void;
  onRemove: (id: string) => void;
  isDisabled?: boolean;
}

/**
 * A single editable row in the bulk pay form.
 * Displays address, amount, and token selector for one recipient.
 */
export function RecipientRow({
  recipient,
  index,
  onAddressChange,
  onAmountChange,
  onTokenChange,
  onRemove,
  isDisabled = false,
}: RecipientRowProps) {
  const addressError =
    recipient.address && !isValidAddress(recipient.address)
      ? "Invalid address"
      : undefined;

  return (
    <div className="flex items-start gap-2">
      <span className="mt-3 shrink-0 text-xs text-surface-200 w-4">
        {index + 1}
      </span>

      <div className="flex-1 min-w-0">
        <Input
          placeholder="0x… recipient address"
          value={recipient.address}
          onChange={(e) => onAddressChange(recipient.id, e.target.value)}
          error={addressError}
          disabled={isDisabled}
          className="font-mono text-xs"
        />
      </div>

      <div className="w-32 shrink-0">
        <Input
          type="number"
          min="0"
          placeholder="Amount"
          value={recipient.amountInput}
          onChange={(e) => onAmountChange(recipient.id, e.target.value)}
          disabled={isDisabled}
          rightSlot={
            <TokenSelector
              selected={recipient.token}
              onChange={(token) => onTokenChange(recipient.id, token)}
              disabled={isDisabled}
            />
          }
        />
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(recipient.id)}
        disabled={isDisabled}
        aria-label={`Remove recipient ${index + 1}`}
        className="mt-0.5 shrink-0 text-surface-200 hover:text-red-500"
      >
        ✕
      </Button>
    </div>
  );
}
