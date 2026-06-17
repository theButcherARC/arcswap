"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TokenSelector } from "./TokenSelector";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useSwap } from "@/hooks/useSwap";
import { formatTokenAmount } from "@/utils/format";
import { TOKENS } from "@/constants/tokens";
import type { Token } from "@/types/token";

/**
 * Swap form shell.
 *
 * Manages local form state (token selection, input amount).
 * Delegates execution to the useSwap hook.
 *
 * TODO (Phase 3): Wire fetchQuote on amount change, show quote details,
 * and call executeSwap on submit.
 */
export function SwapForm() {
  const [tokenIn, setTokenIn] = useState<Token>(TOKENS.USDC);
  const [tokenOut, setTokenOut] = useState<Token>(TOKENS.EURC);
  const [amountIn, setAmountIn] = useState("");

  const { formatted: balanceIn } = useTokenBalance(tokenIn);
  const { status, error, executeSwap } = useSwap();

  const isLoading = status === "approving" || status === "swapping";

  function handleFlip() {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn("");
  }

  function handleSubmit() {
    // TODO (Phase 3): Build SwapParams and call executeSwap()
  }

  return (
    <Card className="mx-auto max-w-md w-full">
      <CardHeader>
        <CardTitle>Swap</CardTitle>
      </CardHeader>

      {/* Token In */}
      <div className="space-y-2">
        <Input
          label="You pay"
          type="number"
          min="0"
          placeholder="0.00"
          value={amountIn}
          onChange={(e) => setAmountIn(e.target.value)}
          hint={`Balance: ${balanceIn} ${tokenIn.symbol}`}
          rightSlot={
            <TokenSelector
              selected={tokenIn}
              onChange={setTokenIn}
              exclude={[tokenOut]}
              disabled={isLoading}
            />
          }
        />

        {/* Flip button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleFlip}
            disabled={isLoading}
            aria-label="Flip tokens"
            className="rounded-xl border border-surface-200 bg-surface-50 p-2 text-surface-800 hover:bg-surface-100 transition-colors disabled:cursor-not-allowed"
          >
            ↕
          </button>
        </div>

        {/* Token Out */}
        <Input
          label="You receive (estimated)"
          type="text"
          readOnly
          placeholder="0.00"
          value=""  // TODO (Phase 3): Populate from quote
          rightSlot={
            <TokenSelector
              selected={tokenOut}
              onChange={setTokenOut}
              exclude={[tokenIn]}
              disabled={isLoading}
            />
          }
        />
      </div>

      {/* Quote details — TODO Phase 3 */}

      {/* Error */}
      {error && (
        <p className="mt-3 text-sm text-red-500">{error}</p>
      )}

      {/* Submit */}
      <Button
        className="mt-5 w-full"
        size="lg"
        isLoading={isLoading}
        onClick={handleSubmit}
        disabled={!amountIn || isLoading}
      >
        {status === "approving" ? "Approving…" : status === "swapping" ? "Swapping…" : "Swap"}
      </Button>
    </Card>
  );
}
