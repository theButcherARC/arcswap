"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { TokenCoin } from "@/components/TokenCoin";
import { PayRequestButton } from "@/components/square/PayRequestButton";

type PayRequest = {
  id: string;
  walletAddress: string;
  handle: string | null;
  amount: string;
  note: string;
  status: string;
  createdAt: string;
};

function shortAddr(a: string): string {
  return a.slice(0, 6) + "..." + a.slice(-4);
}
function timeAgo(iso: string): string {
  const sec = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (sec < 60) return sec + "s";
  if (sec < 3600) return Math.round(sec / 60) + "m";
  if (sec < 86400) return Math.round(sec / 3600) + "h";
  return Math.round(sec / 86400) + "d";
}

export function SquareRequests() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [requests, setRequests] = useState<PayRequest[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [amount, setAmount] = useState("");
  const [noteText, setNoteText] = useState("");
  const [busy, setBusy] = useState(false);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/square/requests", { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as { requests: PayRequest[] };
      setRequests(json.requests);
      setLoaded(true);
    } catch {
      // Keep showing the last good list.
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  async function create() {
    const amt = amount.trim();
    const what = noteText.trim();
    if (!amt || !what || !address || busy) return;
    setBusy(true);
    setNote(null);
    try {
      const timestamp = Date.now();
      const message =
        "VibeSquare request\n" + timestamp + "\n" + amt + "\n" + what;
      const signature = await signMessageAsync({ message });
      const res = await fetch("/api/square/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          amount: amt,
          note: what,
          signature,
          timestamp,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Request failed");
      setRequests((prev) => [json.request as PayRequest, ...prev]);
      setAmount("");
      setNoteText("");
      setNote("Request posted. Anyone in the Square can pay it.");
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Request failed, try again.");
    } finally {
      setBusy(false);
    }
  }

  async function close(r: PayRequest) {
    if (!address || closingId) return;
    setClosingId(r.id);
    setNote(null);
    try {
      const timestamp = Date.now();
      const message = "VibeSquare close request\n" + timestamp + "\n" + r.id;
      const signature = await signMessageAsync({ message });
      const res = await fetch("/api/square/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: r.id, address, signature, timestamp }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Close failed");
      setRequests((prev) =>
        prev.map((x) => (x.id === r.id ? { ...x, status: "closed" } : x)),
      );
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Close failed, try again.");
    } finally {
      setClosingId(null);
    }
  }

  const open = requests.filter((r) => r.status === "open");
  const closed = requests.filter((r) => r.status !== "open");

  return (
    <section className="mb-12" aria-label="Pay requests">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="mono-label !text-[var(--fg-muted)]">Pay requests</h2>
        <span className="mono-label">{open.length} open</span>
      </div>

      {/* Create a request */}
      <div className="mb-6 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--glass)] p-5">
        {isConnected ? (
          <>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--line)] px-3.5 sm:w-44">
                <TokenCoin symbol="USDC" size={20} />
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  inputMode="decimal"
                  placeholder="0.00"
                  aria-label="Request amount in USDC"
                  className="w-full bg-transparent font-mono text-base text-[var(--fg)] outline-none placeholder:text-[var(--fg-faint)]"
                />
              </div>
              <input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                maxLength={140}
                placeholder="What is it for? Team dinner, design help, a bounty..."
                aria-label="What the request is for"
                className="min-h-[44px] flex-1 rounded-full border border-[var(--line)] bg-transparent px-4 text-base text-[var(--fg)] outline-none placeholder:text-[var(--fg-faint)]"
              />
              <button
                onClick={create}
                disabled={busy || !amount.trim() || !noteText.trim()}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy ? "Signing..." : "Request USDC"}
              </button>
            </div>
            <p className="mt-3 text-xs text-[var(--fg-faint)]">
              Signed by your wallet, no gas. Payment lands straight in your
              wallet, and you close the request once it arrives.
            </p>
          </>
        ) : (
          <p className="py-1 text-sm text-[var(--fg-muted)]">
            Connect your wallet to post a pay request. Anyone can pay one.
          </p>
        )}
        {note && <p className="mt-3 text-xs text-[var(--fg-muted)]">{note}</p>}
      </div>

      {/* List */}
      {!loaded && (
        <p className="py-4 text-center text-sm text-[var(--fg-muted)]">
          Loading requests...
        </p>
      )}
      {loaded && requests.length === 0 && (
        <p className="py-2 text-sm text-[var(--fg-muted)]">
          No pay requests yet. Post the first one above.
        </p>
      )}
      <div className="space-y-3">
        {[...open, ...closed].map((r) => {
          const mine =
            !!address &&
            address.toLowerCase() === r.walletAddress.toLowerCase();
          const isOpen = r.status === "open";
          return (
            <article
              key={r.id}
              className={`flex flex-col gap-3 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--glass)] p-5 sm:flex-row sm:items-center ${
                isOpen ? "" : "opacity-60"
              }`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3.5">
                <TokenCoin symbol="USDC" size={40} />
                <div className="min-w-0">
                  <p className="font-mono text-xl font-semibold text-[var(--fg)]">
                    {r.amount}
                    <span className="ml-1.5 text-sm font-normal text-[var(--fg-faint)]">
                      USDC
                    </span>
                  </p>
                  <p className="truncate text-sm text-[var(--fg-muted)]">
                    {r.note}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--fg-faint)]">
                    {r.handle ? "@" + r.handle : shortAddr(r.walletAddress)}
                    {" · "}
                    {timeAgo(r.createdAt)}
                    {isOpen ? "" : " · Closed"}
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                {isOpen ? (
                  mine ? (
                    <button
                      onClick={() => close(r)}
                      disabled={closingId === r.id}
                      className="inline-flex min-h-[44px] items-center rounded-full border border-[var(--line)] px-5 text-xs font-medium text-[var(--fg-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--fg)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {closingId === r.id ? "Signing..." : "Close request"}
                    </button>
                  ) : (
                    <PayRequestButton
                      to={r.walletAddress}
                      amount={r.amount}
                      handle={r.handle}
                    />
                  )
                ) : (
                  <span className="mono-label">Closed</span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
