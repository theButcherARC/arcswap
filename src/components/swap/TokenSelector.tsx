"use client";

import { TOKEN_LIST } from "@/constants/tokens";
import type { Token } from "@/types/token";

interface TokenSelectorProps {
  selected: Token | null;
  onChange: (token: Token) => void;
  exclude?: Token[];
  disabled?: boolean;
}

export function TokenSelector({
  selected,
  onChange,
  exclude = [],
  disabled = false,
}: TokenSelectorProps) {
  const options = TOKEN_LIST.filter(
    (t) => !exclude.some((ex) => ex.symbol === t.symbol)
  );

  return (
    <select
      value={selected?.symbol ?? ""}
      disabled={disabled}
      onChange={(e) => {
        const token = options.find((t) => t.symbol === e.target.value);
        if (token) onChange(token);
      }}
      className="rounded-lg border-0 bg-arc-50 py-1 pl-2 pr-6 text-sm font-medium text-arc-700 focus:outline-none focus:ring-2 focus:ring-arc-300 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <option value="" disabled>
        Select token
      </option>
      {options.map((token) => (
        <option key={token.symbol} value={token.symbol}>
          {token.symbol}
        </option>
      ))}
    </select>
  );
}