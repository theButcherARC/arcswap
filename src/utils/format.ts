import { formatUnits, parseUnits } from "viem";

/**
 * Format a raw bigint token amount to a human-readable string.
 *
 * @param raw - Amount in the token's smallest unit
 * @param decimals - Token decimal places
 * @param displayDecimals - Number of decimal places to show (default: 4)
 */
export function formatTokenAmount(
  raw: bigint,
  decimals: number,
  displayDecimals = 4
): string {
  const full = formatUnits(raw, decimals);
  const [integer, fraction = ""] = full.split(".");
  const trimmed = fraction.slice(0, displayDecimals).replace(/0+$/, "");
  return trimmed.length > 0 ? `${integer}.${trimmed}` : integer;
}

/**
 * Parse a human-readable token amount string to a raw bigint.
 * Returns null if the input is not a valid number.
 *
 * @param value - String from an input field (e.g. "1.5")
 * @param decimals - Token decimal places
 */
export function parseTokenAmount(
  value: string,
  decimals: number
): bigint | null {
  try {
    if (!value || isNaN(Number(value))) return null;
    return parseUnits(value, decimals);
  } catch {
    return null;
  }
}

/**
 * Format a percentage with a fixed number of decimal places.
 */
export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}
