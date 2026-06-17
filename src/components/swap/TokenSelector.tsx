"use client";

import { TOKEN_LIST } from "@/constants/tokens";
import type { Token } from "@/types/token";

interface TokenSelectorProps {
  selected: Token | null;
  onChange: (token: Token) => void;
  /** Tokens to exclude from the list (e.g. the other side of the pair) */
  exclude?: Token[];
  disabled?: boolean;
}

/**
 * Compact inline token selector.
 * Renders as a <select> for MVP — can be replaced with a modal picker post-MVP.
 */
export function TokenSelector({
  selected,
  onChange,
  exclude = [],
  disabled = false,
}: TokenSelectorProps) {
  const options = TOKEN_LIST.filter(
    (t) => !exclude.some((ex) => ex.address === t.address)
  );

  return (
    <select
      value={selected?.address ?? ""}
      disabled={disabled}
      onChange={(e) => {
        const token = options.find((t) => t.address === e.target.value);
        if (token) onChange(token);
      }}
      className="rounded-lg border-0 bg-arc-50 py-1 pl-2 pr-6 text-sm font-medium text-arc-700 focus:outline-none focus:ring-2 focus:ring-arc-300 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <option value="" disabled>
        Select token
      </option>
      {options.map((token) => (
        <option key={token.address} value={token.address}>
          {token.symbol}
        </option>
      ))}
    </select>
  );
}
