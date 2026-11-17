/**
 * Review-step helpers shared by Quick Pay, AI and CSV Upload:
 * the flagging layer (Tommy Famous feedback, approved 2026-11-08) and
 * the memo rules for BatchPay v2.
 */

export interface ReviewLine {
  /** 1-based line number inside the batch. */
  row: number;
  name: string;
  address: string;
  /** Amount in whole token units (display math, not raw units). */
  amount: number;
}

export interface DuplicateGroup {
  address: string;
  rows: number[];
}

export interface ReviewFlags {
  firstTime: ReviewLine[];
  outliers: ReviewLine[];
  duplicates: DuplicateGroup[];
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Flag, loudly and before signing:
 *  (a) first-time recipients: no earlier payment from this browser,
 *  (b) outlier amounts: a row at least 10x the batch's typical (median)
 *      row, in batches of 3 or more,
 *  (c) duplicate addresses appearing on more than one row.
 */
export function computeReviewFlags(
  lines: ReviewLine[],
  knownAddresses: Set<string>,
): ReviewFlags {
  const firstTime = lines.filter(
    (l) => !knownAddresses.has(l.address.toLowerCase()),
  );

  let outliers: ReviewLine[] = [];
  if (lines.length >= 3) {
    const med = median(lines.map((l) => l.amount));
    if (med > 0) {
      outliers = lines.filter((l) => l.amount >= med * 10 && l.amount > med);
    }
  }

  const byAddress = new Map<string, number[]>();
  for (const line of lines) {
    const key = line.address.toLowerCase();
    const rows = byAddress.get(key) ?? [];
    rows.push(line.row);
    byAddress.set(key, rows);
  }
  const duplicates: DuplicateGroup[] = [...byAddress.entries()]
    .filter(([, rows]) => rows.length > 1)
    .map(([address, rows]) => ({ address, rows }));

  return { firstTime, outliers, duplicates };
}

/**
 * The memo a line will actually carry onchain: an explicit memo typed in
 * the review wins; otherwise the recipient's name when the name-as-memo
 * toggle is on; otherwise no memo.
 */
export function effectiveMemo(
  name: string,
  explicitMemo: string | undefined,
  nameAsMemo: boolean,
): string {
  if (explicitMemo !== undefined) return explicitMemo.trim();
  if (nameAsMemo) return name.trim();
  return "";
}

export function shortAddress(address: string): string {
  if (!address || address.length < 10) return address || "";
  return address.slice(0, 6) + "..." + address.slice(-4);
}
