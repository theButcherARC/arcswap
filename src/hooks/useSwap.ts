"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useArcNetwork } from "./useArcNetwork";
import { useTokenAllowance } from "./useTokenAllowance";
import { getContractAddresses } from "@/contracts/config";
import { getErrorMessage, isUserRejection, APP_ERRORS } from "@/utils/errors";
import type { SwapParams, SwapQuote, SwapStatus } from "@/types/swap";

/**
 * Orchestrates a token swap:
 *   1. Fetch quote from swapService
 *   2. Approve tokenIn allowance if needed
 *   3. Execute the swap transaction
 *
 * TODO (Phase 3):
 *   - Import and call swapService.getQuote()
 *   - Import and call swapService.executeSwap()
 *   - Wire useWriteContract + useWaitForTransactionReceipt for the swap tx
 */
export function useSwap() {
  const { address } = useAccount();
  const { isCorrectNetwork } = useArcNetwork();
  const [status, setStatus] = useState<SwapStatus>("idle");
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [error, setError] = useState<string | null>(null);

  // The router address will be used as the allowance spender.
  // Allowance hook is wired but swap params drive token/spender selection.
  // TODO: Pass the selected tokenIn and router address from the form.
  const { allowance, approve, isApproveConfirmed } = useTokenAllowance(
    null, // tokenIn — set by form
    undefined // router address — from getContractAddresses()
  );

  async function fetchQuote(_params: Omit<SwapParams, "recipient" | "deadline">) {
    // TODO: Call swapService.getQuote(params)
    setQuote(null);
  }

  async function executeSwap(_params: SwapParams) {
    if (!address) { setError(APP_ERRORS.WALLET_NOT_CONNECTED); return; }
    if (!isCorrectNetwork) { setError(APP_ERRORS.WRONG_NETWORK); return; }

    try {
      setError(null);
      setStatus("approving");
      // TODO: Check allowance, call approve if needed, wait for confirmation
      // TODO: setStatus("swapping"), call swap tx, wait for confirmation
      // TODO: setStatus("success")
    } catch (err) {
      setError(isUserRejection(err) ? APP_ERRORS.TX_REJECTED : getErrorMessage(err));
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setQuote(null);
    setError(null);
  }

  return { status, quote, error, fetchQuote, executeSwap, reset };
}
