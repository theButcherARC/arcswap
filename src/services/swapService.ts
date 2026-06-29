"use client";

import { AppKit } from "@circle-fin/app-kit";
import { createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
import type { EIP1193Provider } from "viem";
import type { Token } from "@/types/token";

declare global {
  interface Window {
    __circleFetchPatched?: boolean;
  }
}

function patchFetchForCircleProxy() {
  if (typeof window === "undefined") return;
  if (window.__circleFetchPatched) return;
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : (input as Request).url;
    if (url.startsWith("https://api.circle.com/")) {
      const rewritten = url.replace("https://api.circle.com/", window.location.origin + "/circle-api/");
      if (typeof input === "string" || input instanceof URL) {
        return originalFetch(rewritten, init);
      }
      return originalFetch(new Request(rewritten, input as Request));
    }
    return originalFetch(input, init);
  };
  window.__circleFetchPatched = true;
}

patchFetchForCircleProxy();

const kit = new AppKit();

export interface SwapExecutionParams {
  provider: EIP1193Provider;
  tokenIn: Token;
  tokenOut: Token;
  amountIn: string;
}

export interface SwapEstimateResult {
  estimatedOutput: string;
}

export interface SwapExecutionResult {
  state: "success" | "error";
  txHash?: string;
  explorerUrl?: string;
  error?: string;
}

async function getAdapter(provider: EIP1193Provider) {
  return createViemAdapterFromProvider({ provider });
}

export async function estimateSwap(params: SwapExecutionParams): Promise<SwapEstimateResult> {
  const adapter = await getAdapter(params.provider);
  const kitKey = process.env.NEXT_PUBLIC_CIRCLE_KIT_KEY;
  if (!kitKey) throw new Error("NEXT_PUBLIC_CIRCLE_KIT_KEY is not configured");

  const estimate = await kit.estimateSwap({
    from: { adapter, chain: "Arc_Testnet" },
    tokenIn: params.tokenIn.symbol,
    tokenOut: params.tokenOut.symbol,
    amountIn: params.amountIn,
    config: { kitKey },
  });

  const output = estimate.estimatedOutput as unknown;
  const outputString =
    typeof output === "string"
      ? output
      : typeof output === "object" && output !== null && "amount" in output
      ? String((output as { amount: unknown }).amount)
      : String(output);

  return { estimatedOutput: outputString };
}

export async function executeSwap(params: SwapExecutionParams): Promise<SwapExecutionResult> {
  const adapter = await getAdapter(params.provider);
  const kitKey = process.env.NEXT_PUBLIC_CIRCLE_KIT_KEY;
  if (!kitKey) throw new Error("NEXT_PUBLIC_CIRCLE_KIT_KEY is not configured");

  const result = (await kit.swap({
    from: { adapter, chain: "Arc_Testnet" },
    tokenIn: params.tokenIn.symbol,
    tokenOut: params.tokenOut.symbol,
    amountIn: params.amountIn,
    config: { kitKey },
  })) as unknown as Record<string, unknown>;

  if (!result || result["error"]) {
    return {
      state: "error",
      error: typeof result?.["error"] === "string" ? result["error"] : "Swap failed.",
    };
  }

  return {
    state: "success",
    txHash: typeof result["txHash"] === "string" ? result["txHash"] : undefined,
    explorerUrl: typeof result["explorerUrl"] === "string" ? result["explorerUrl"] : undefined,
  };
}