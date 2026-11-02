// src/components/bulk-pay/AgentInput.tsx
// Natural language input - VIBE gated in Phase 3, open for hackathon demo now

"use client";

import { useState } from "react";
import { parsePaymentInstruction, ParsedBulkPay } from "@/services/agentService";
import { LogoTile } from "@/components/brand/Logo";

interface AgentInputProps {
  onParsed: (data: ParsedBulkPay) => void;
}

const EXAMPLES = [
  "Pay Alice 500 USDC at @alice and Bob 300 USDC at @bob",
  "Send 100 USDC to VIBE-ABC123",
  "Pay my team: @alice gets 250, @bob gets 250, VIBE-XYZ789 gets 500 USDC",
];

export default function AgentInput({ onParsed }: AgentInputProps) {
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastParsed, setLastParsed] = useState<ParsedBulkPay | null>(null);

  const handleParse = async () => {
    if (!instruction.trim()) return;
    setLoading(true);
    setError(null);
    setLastParsed(null);

    try {
      const result = await parsePaymentInstruction(instruction);
      if (result.error && result.recipients.length === 0) {
        setError(result.error);
      } else {
        setLastParsed(result);
        onParsed(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Parse failed");
    } finally {
      setLoading(false);
    }
  };

  const handleExample = (ex: string) => {
    setInstruction(ex);
    setError(null);
    setLastParsed(null);
  };

  return (
    <div className="border border-[rgba(39,117,202,0.25)] bg-[var(--glass)] p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <LogoTile size={28} />
        <div>
          <p className="text-sm font-semibold text-[var(--fg)]">AI Payment Agent</p>
          <p className="text-xs text-gray-400">Describe your payment in plain English</p>
        </div>
        <span className="ml-auto text-xs bg-[var(--accent-soft)] text-[var(--accent)] px-2 py-0.5 rounded-full">
          AI powered
        </span>
      </div>

      {/* Textarea */}
      <textarea
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        placeholder="e.g. Pay Alice 500 USDC at @alice, Bob 300 at VIBE-ABC123, or Carol 200 at 0x1234...abcd"
        rows={3}
        className="w-full bg-surface border border-[var(--line)] text-[var(--fg)] placeholder-gray-500 text-base p-3 resize-none focus:outline-none focus:border-[var(--accent)] transition-colors"
      />

      {/* Examples */}
      <div className="space-y-1">
        <p className="text-xs text-gray-500">Try an example:</p>
        <div className="flex flex-col gap-1">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => handleExample(ex)}
              className="text-left text-xs text-[var(--accent)] hover:opacity-75 transition-colors truncate"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Parse button */}
      <button
        onClick={handleParse}
        disabled={loading || !instruction.trim()}
        className="w-full min-h-11 py-2.5 bg-[var(--accent)] text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold transition-colors"
      >
        {loading ? "Parsing..." : "Parse with AI"}
      </button>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-3">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Success preview */}
      {lastParsed && lastParsed.recipients.length > 0 && (
        <div className="bg-green-500/10 border border-green-500/20 p-3 space-y-1">
          <p className="text-xs font-semibold text-green-400">
            Parsed - {lastParsed.recipients.length} recipient{lastParsed.recipients.length > 1 ? "s" : ""} - filling form below
          </p>
          {lastParsed.recipients.map((r, i) => (
            <p key={i} className="text-xs text-gray-300">
              {r.name}: {r.amount} {lastParsed.token}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
