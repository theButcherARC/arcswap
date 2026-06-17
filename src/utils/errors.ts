/**
 * Converts any thrown value to a readable error message.
 * Safe to use in catch blocks where the error type is unknown.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Wagmi / viem errors often embed a human-readable shortMessage
    const wagmiError = error as Error & { shortMessage?: string };
    return wagmiError.shortMessage ?? error.message;
  }
  if (typeof error === "string") return error;
  return "An unexpected error occurred.";
}

/**
 * Returns true if the error is a user-rejected transaction (EIP-1193 code 4001).
 */
export function isUserRejection(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const code = (error as Error & { code?: number }).code;
  // MetaMask uses 4001; viem wraps it with "User rejected the request"
  return code === 4001 || error.message.toLowerCase().includes("user rejected");
}

/** Well-known ArcSwap error messages shown in the UI */
export const APP_ERRORS = {
  WRONG_NETWORK:        "Please switch to Arc Testnet to continue.",
  WALLET_NOT_CONNECTED: "Connect your wallet to continue.",
  INSUFFICIENT_BALANCE: "Insufficient token balance.",
  APPROVAL_REQUIRED:    "Token approval required before proceeding.",
  TX_REJECTED:          "Transaction rejected.",
  UNKNOWN:              "Something went wrong. Please try again.",
} as const;
