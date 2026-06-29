"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TokenSelector } from "./TokenSelector";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useSwap } from "@/hooks/useSwap";
import { TOKENS } from "@/constants/tokens";
import type { Token } from "@/types/token";
export function SwapForm() {
  const [tokenIn, setTokenIn] = useState<Token>(TOKENS.USDC);
  const [tokenOut, setTokenOut] = useState<Token>(TOKENS.EURC);
  const [amountIn, setAmountIn] = useState("");
  const { formatted: balanceIn, refetch: refetchBalanceIn } = useTokenBalance(tokenIn);
  const { status, estimatedOutput, error, txHash, fetchQuote, performSwap, reset } = useSwap();
  const isLoading = status === "approving" || status === "swapping";
  useEffect(() => {
    const handle = setTimeout(() => {
      if (amountIn && Number(amountIn) > 0) {
        fetchQuote({ tokenIn, tokenOut, amountIn });
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [amountIn, tokenIn, tokenOut]);
  function handleFlip() {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn("");
    reset();
  }
  async function handleSubmit() {
    await performSwap({ tokenIn, tokenOut, amountIn });
    refetchBalanceIn();
  }
  return (
    <Card className="mx-auto max-w-md w-full">
      <CardHeader>
        <CardTitle>Swap</CardTitle>
      </CardHeader>
      <div className="space-y-2">
        <Input
          label="You pay"
          type="number"
          min="0"
          placeholder="0.00"
          value={amountIn}
          onChange={(e) => setAmountIn(e.target.value)}
          hint={"Balance: " + balanceIn + " " + tokenIn.symbol}
          rightSlot={
            <TokenSelector
              selected={tokenIn}
              onChange={setTokenIn}
              exclude={[tokenOut]}
              disabled={isLoading}
            />
          }
        />
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleFlip}
            disabled={isLoading}
            aria-label="Flip tokens"
            className="rounded-xl border border-surface-100 bg-surface-25 p-2 text-arc-900 hover:bg-surface-50 transition-colors disabled:cursor-not-allowed"
          >
            Flip
          </button>
        </div>
        <Input
          label="You receive (estimated)"
          type="text"
          readOnly
          placeholder="0.00"
          value={estimatedOutput ?? ""}
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
      {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
      {status === "success" && txHash && (
        <p className="mt-3 text-sm text-emerald-600">
          Swap successful! <a href={"https://testnet.arcscan.app/tx/" + txHash} target="_blank" rel="noopener noreferrer" className="underline">View transaction</a>
        </p>
      )}
      <Button
        className="mt-5 w-full"
        size="lg"
        isLoading={isLoading}
        onClick={handleSubmit}
        disabled={!amountIn || isLoading}
      >
        {status === "swapping" ? "Swapping..." : "Swap"}
      </Button>
    </Card>
  );
}