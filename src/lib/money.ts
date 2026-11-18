import { formatUnits } from "viem";

/**
 * The one money formatter for display. Tokens settle at 6 decimals
 * onchain, so display must not hide sub-cent amounts: minimum 2,
 * maximum 6 fraction digits, thousands separators on. A valid
 * 0.000001 payment must never render as "0.00" on a review screen,
 * a summary, or a receipt.
 */
export function formatMoney(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

/** Format a raw onchain amount (base units) for display. */
export function formatTokenAmount(raw: bigint, decimals: number): string {
  return formatMoney(Number(formatUnits(raw, decimals)));
}
