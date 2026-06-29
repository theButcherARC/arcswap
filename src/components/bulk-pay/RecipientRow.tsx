"use client";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { isValidAddress } from "@/utils/address";
import type { Recipient } from "@/types/bulkPay";

interface RecipientRowProps {
  recipient: Recipient;
  index: number;
  onNameChange: (id: string, value: string) => void;
  onAddressChange: (id: string, value: string) => void;
  onPercentageChange: (id: string, value: string) => void;
  onRemove: (id: string) => void;
  isDisabled?: boolean;
}

/**
 * A single editable row in the bulk pay form.
 * Displays name, address, and percentage share for one recipient.
 */
export function RecipientRow({
  recipient,
  index,
  onNameChange,
  onAddressChange,
  onPercentageChange,
  onRemove,
  isDisabled = false,
}: RecipientRowProps) {
  const addressError =
    recipient.address && !isValidAddress(recipient.address)
      ? "Invalid address"
      : undefined;

  return (
    <div className="grid grid-cols-[auto_1fr_1.4fr_auto_auto] items-start gap-3 rounded-2xl border border-surface-100 bg-surface-25 p-3">
      <span className="mt-3 shrink-0 text-xs font-medium text-surface-300 w-4">
        {index + 1}
      </span>

      <Input
        placeholder="Recipient name"
        value={recipient.name}
        onChange={(e) => onNameChange(recipient.id, e.target.value)}
        disabled={isDisabled}
      />

      <Input
        placeholder="0x… address"
        value={recipient.address}
        onChange={(e) => onAddressChange(recipient.id, e.target.value)}
        error={addressError}
        disabled={isDisabled}
        className="font-mono text-xs"
      />

      <div className="w-20">
        <Input
          type="number"
          min="0"
          max="100"
          placeholder="%"
          value={recipient.percentageInput}
          onChange={(e) => onPercentageChange(recipient.id, e.target.value)}
          disabled={isDisabled}
        />
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(recipient.id)}
        disabled={isDisabled}
        aria-label={`Remove recipient ${index + 1}`}
        className="mt-0.5 shrink-0 text-surface-300 hover:text-rose-500"
      >
        ✕
      </Button>
    </div>
  );
}