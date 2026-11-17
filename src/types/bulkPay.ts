import type { Address } from "viem";
import type { Token } from "./token";

export type InputMode = "percentage" | "amount";

export interface Recipient {
  id: string;
  name: string;
  address: Address | "";
  percentageInput: string;
  percentage: number | null;
  amountInput: string;
  amount: number | null;
  /** Explicit per-recipient memo typed in the review step. When unset, the
   *  name-as-memo toggle decides the memo at send time. */
  memo?: string;
}

export interface BulkPayParams {
  totalAmount: bigint;
  token: Token;
  recipients: Array<{
    address: Address;
    amount: bigint;
    name: string;
    /** Per-recipient memo, emitted onchain in the PaymentSent event.
     *  Empty or unset means no memo event for that line. */
    memo?: string;
  }>;
  /** Batch-level memo, emitted onchain in the BatchSent event. */
  batchMemo?: string;
}

export interface TransferStatus {
  recipientId: string;
  status: "pending" | "confirming" | "success" | "error";
  txHash?: `0x${string}`;
  error?: string;
}

export type BulkPayStatus =
  | "idle"
  | "preparing"
  | "approving"
  | "sending"
  | "reconciling"
  | "success"
  | "error";

/* --------------------------------------------------------------- */
/*  Post-send reconciliation (Mehdi line-by-line verification)      */
/* --------------------------------------------------------------- */

/** One expected payment line, in the order it was sent. `row` is the
 *  1-based line number inside the batch that was actually sent. */
export interface ExpectedLine {
  row: number;
  name: string;
  address: Address;
  amount: bigint;
}

export type ReconciledLineStatus = "matched" | "missing" | "mismatch";

export interface ReconciledLine {
  row: number;
  name: string;
  address: Address;
  /** Expected amount (raw token units). */
  amount: bigint;
  status: ReconciledLineStatus;
  /** Observed amount from the matched Transfer log, when one was found. */
  observedAmount?: bigint;
  /** Transaction that carried the observed transfer. */
  txHash?: `0x${string}`;
  /** Log index of the observed transfer inside its transaction. */
  logIndex?: number;
}

export interface ReconciliationSummary {
  lines: ReconciledLine[];
  matchedCount: number;
  missingCount: number;
  mismatchCount: number;
  /** True only when every expected line matched an observed transfer. */
  complete: boolean;
}

/** Everything the success screen and the payslip receipt need about a
 *  batch that was just sent. */
export interface BatchResult {
  txHashes: `0x${string}`[];
  totalRaw: bigint;
  feeRaw: bigint;
  batchMemo: string;
  token: Token;
  sender: Address;
  sentAt: number;
  summary: ReconciliationSummary | null;
}
