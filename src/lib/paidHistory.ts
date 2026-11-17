/**
 * Local record of recipient addresses this browser has already paid,
 * used by the review step to flag first-time recipients.
 *
 * Stored in localStorage on this device only. It is a review aid, not
 * proof: a recipient paid from another device or browser will still be
 * flagged as first-time here, and the flag copy says so.
 */

const STORAGE_KEY = "vibeflow.paidRecipients.v1";

interface PaidRecord {
  address: string;
  ts: number;
}

function readRecords(): PaidRecord[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PaidRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Lowercased addresses this browser has paid in earlier batches. */
export function loadPaidRecipientAddresses(): Set<string> {
  return new Set(readRecords().map((r) => r.address.toLowerCase()));
}

/** Record addresses as paid after their transaction confirms. */
export function recordPaidRecipients(addresses: string[]): void {
  try {
    const existing = readRecords();
    const seen = new Set(existing.map((r) => r.address.toLowerCase()));
    const now = Date.now();
    for (const address of addresses) {
      const key = address.toLowerCase();
      if (!seen.has(key)) {
        existing.push({ address: key, ts: now });
        seen.add(key);
      }
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // History is a review aid only; failing to save it must never
    // block or fail a payment.
  }
}
