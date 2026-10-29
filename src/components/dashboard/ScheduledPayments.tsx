"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface ScheduledRecipient {
  name: string;
  address: string;
  amount: number;
}

interface ScheduledBatch {
  id: string;
  tokenSymbol: string;
  totalAmount: string;
  recipients: ScheduledRecipient[];
  memo: string;
  scheduledFor: string;
  status: string;
  txHash: string;
  createdAt: string;
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function ScheduledPayments() {
  const [items, setItems] = useState<ScheduledBatch[] | null>(null);
  const [hidden, setHidden] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/scheduled-batches");
      if (!res.ok) {
        setHidden(true);
        return;
      }
      const data = await res.json();
      setItems(Array.isArray(data.schedules) ? data.schedules : []);
    } catch {
      setHidden(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = useCallback(
    async (id: string) => {
      setCancellingId(id);
      try {
        await fetch("/api/scheduled-batches/" + id, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "cancelled" }),
        });
        await load();
      } catch {
        // list refresh will show the current state
      }
      setCancellingId(null);
    },
    [load],
  );

  // Signed out or API unavailable: show nothing, the dashboard keeps its normal flow
  if (hidden) return null;
  if (items === null) return null;

  const now = Date.now();

  return (
    <section aria-label="Scheduled payments" className="animate-fade-in-up">
      <div className="glass-panel px-5 py-5 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="mono-label block mb-1">SYS.SCHEDULED</span>
            <h2 className="text-lg font-semibold text-[var(--fg)]">
              Scheduled payments
            </h2>
          </div>
          <Link
            href="/bulk-pay"
            className="text-xs font-medium text-[var(--data)] hover:text-[var(--data)]"
          >
            New batch
          </Link>
        </div>

        {items.length === 0 ? (
          <p className="mt-3 text-sm text-gray-400 leading-relaxed">
            No scheduled payments yet. Build a batch in Bulk Pay, and in the
            review step choose a date to save it here. When the date arrives,
            you review and sign it in one click. VibeFlow never sends a
            payment on its own, only your wallet can sign.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-[var(--line)] border border-[var(--line)]">
            {items.map((item) => {
              const due =
                item.status === "pending" &&
                new Date(item.scheduledFor).getTime() <= now;
              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--fg)]">
                      {"$" + item.totalAmount + " " + item.tokenSymbol}
                      <span className="text-[var(--fg-faint)] font-normal">
                        {" to " +
                          item.recipients.length +
                          " recipient" +
                          (item.recipients.length !== 1 ? "s" : "")}
                      </span>
                    </p>
                    <p className="text-[11px] text-[var(--fg-faint)] mt-0.5">
                      {formatWhen(item.scheduledFor)}
                      {item.memo ? " · " + item.memo : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {item.status === "sent" ? (
                      <span className="text-[11px] font-medium text-[var(--data)]">
                        Sent
                      </span>
                    ) : item.status === "cancelled" ? (
                      <span className="text-[11px] font-medium text-[var(--fg-faint)]">
                        Cancelled
                      </span>
                    ) : due ? (
                      <span className="text-[11px] font-medium text-amber-300">
                        Due now
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-[var(--fg-faint)]">
                        Scheduled
                      </span>
                    )}
                    {item.status === "pending" ? (
                      <>
                        <Link
                          href={"/bulk-pay?schedule=" + item.id}
                          className="text-xs font-semibold text-[var(--data)] hover:text-[var(--data)]"
                        >
                          Review and pay
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleCancel(item.id)}
                          disabled={cancellingId === item.id}
                          className="text-xs text-[var(--fg-faint)] hover:text-rose-600 disabled:opacity-40"
                        >
                          {cancellingId === item.id
                            ? "Cancelling..."
                            : "Cancel"}
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
