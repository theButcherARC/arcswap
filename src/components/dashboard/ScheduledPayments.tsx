"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

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
    (id: string) => {
      const item = items?.find((i) => i.id === id);
      if (!item || item.status !== "pending") return;
      // Optimistic cancel with an undo window: the row shows as
      // cancelled immediately, but the PATCH is only sent when the
      // toast closes without Undo. Undo restores the row and no
      // request is ever sent.
      setItems((prev) =>
        prev
          ? prev.map((i) => (i.id === id ? { ...i, status: "cancelled" } : i))
          : prev,
      );
      let settled = false;
      const commit = async () => {
        if (settled) return;
        settled = true;
        try {
          await fetch("/api/scheduled-batches/" + id, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "cancelled" }),
          });
        } catch {
          // list refresh below will show the current state
        }
        await load();
      };
      toast("Scheduled payment cancelled", {
        id: `undo-cancel-${id}`,
        duration: 5000,
        action: {
          label: "Undo",
          onClick: () => {
            settled = true;
            setItems((prev) =>
              prev
                ? prev.map((i) =>
                    i.id === id ? { ...i, status: item.status } : i,
                  )
                : prev,
            );
          },
        },
        onAutoClose: () => {
          void commit();
        },
        onDismiss: () => {
          void commit();
        },
      });
    },
    [items, load],
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
            className="inline-flex min-h-11 items-center px-2 text-xs font-medium text-[var(--data)] transition-colors hover:text-[var(--fg)] active:opacity-60"
          >
            New batch
          </Link>
        </div>

        {items.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--fg-muted)] leading-relaxed">
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
                    <p className="text-[0.6875rem] text-[var(--fg-faint)] mt-0.5">
                      {formatWhen(item.scheduledFor)}
                      {item.memo ? " · " + item.memo : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {item.status === "sent" ? (
                      <span className="text-[0.6875rem] font-medium text-[var(--data)]">
                        Sent
                      </span>
                    ) : item.status === "cancelled" ? (
                      <span className="text-[0.6875rem] font-medium text-[var(--fg-faint)]">
                        Cancelled
                      </span>
                    ) : due ? (
                      <span className="text-[0.6875rem] font-medium text-amber-600">
                        Due now
                      </span>
                    ) : (
                      <span className="text-[0.6875rem] font-medium text-[var(--fg-faint)]">
                        Scheduled
                      </span>
                    )}
                    {item.status === "pending" ? (
                      <>
                        <Link
                          href={"/bulk-pay?schedule=" + item.id}
                          className="inline-flex min-h-11 items-center px-1 text-xs font-semibold text-[var(--data)] transition-colors hover:text-[var(--fg)] active:opacity-60"
                        >
                          Review and pay
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleCancel(item.id)}
                          className="inline-flex min-h-11 items-center px-1 text-xs text-[var(--fg-faint)] transition-colors hover:text-rose-600 active:opacity-60"
                        >
                          Cancel
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
