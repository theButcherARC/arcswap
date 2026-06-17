import { isAddress, getAddress } from "viem";
import type { Address } from "viem";

/**
 * Truncate an Ethereum address for display.
 * e.g. "0x1234...abcd"
 */
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Validate and normalise an Ethereum address.
 * Returns the checksummed address or null if invalid.
 */
export function toChecksumAddress(address: string): Address | null {
  try {
    if (!isAddress(address)) return null;
    return getAddress(address);
  } catch {
    return null;
  }
}

/**
 * Returns true if the string is a valid Ethereum address.
 */
export function isValidAddress(address: string): boolean {
  return isAddress(address);
}
