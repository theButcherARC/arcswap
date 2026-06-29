"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import type { EIP1193Provider } from "viem";
import { useArcNetwork } from "./useArcNetwork";
import { estimateSwap, executeSwap } from "@/services/swapService";
import { getErrorMessage, isUserRejection, APP_ERRORS } from "@/utils/errors";
import type { Token } from "@/types/token";
import type { SwapStatus } from "@/types/swap";

interface SwapFormParams {
  tokenIn: Token;
  tokenOut: Token;
  amountIn: string;
}

export function useSwap() {
  const { address } = useAccount();
  const { isCorrectNetwork } = useArcNetwork();
  const [status, setStatus] = useState<SwapStatus>("idle");
  const [estimatedOutput, setEstimatedOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  function getProvider(): EIP1193Provider {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("No wallet provider found");
    }
    return window.ethereum as unknown as EIP1193Provider;
  }

  async function fetchQuote(params: SwapFormParams) {
    if (!params.amountIn || Number(params.amountIn) <= 0) {
      setEstimatedOutput(null);
      return;
    }
    try {
      setError(null);
      const provider = getProvider();
      const estimate = await estimateSwap({
        provider,
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amountIn: params.amountIn,
      });
      setEstimatedOutput(estimate.estimatedOutput);
    } catch (err) {
      setEstimatedOutput(null);
    }
  }

  async function performSwap(params: SwapFormParams) {
    if (!address) { setError(APP_ERRORS.WALLET_NOT_CONNECTED); return; }
    if (!isCorrectNetwork) { setError(APP_ERRORS.WRONG_NETWORK); return; }

    try {
      setError(null);
      setTxHash(null);
      setStatus("swapping");

      const provider = getProvider();
      const result = await executeSwap({
        provider,
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amountIn: params.amountIn,
      });

      if (result.state === "error") {
        setError(result.error ?? APP_ERRORS.UNKNOWN);
        setStatus("error");
        return;
      }

      setTxHash(result.txHash ?? null);
      setStatus("success");
    } catch (err) {
      setError(isUserRejection(err) ? APP_ERRORS.TX_REJECTED : getErrorMessage(err));
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setEstimatedOutput(null);
    setError(null);
    setTxHash(null);
  }

  return { status, estimatedOutput, error, txHash, fetchQuote, performSwap, reset };
}