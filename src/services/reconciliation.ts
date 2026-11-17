import { erc20Abi, parseEventLogs, type Address, type TransactionReceipt } from "viem";
import type {
  ExpectedLine,
  ReconciledLine,
  ReconciliationSummary,
} from "@/types/bulkPay";

/**
 * Line-by-line reconciliation of a sent batch (Mehdi Piran feedback,
 * approved into the rewire scope 2026-11-06).
 *
 * After each disperse transaction confirms, its receipt's Transfer logs
 * are matched against every expected payment line: same recipient, same
 * amount, with the transaction hash and log index recorded as evidence.
 * A batch is only "verified" when every line matched. Batch totals alone
 * are never accepted as verification.
 *
 * The fee transfer (BatchPay contract -> fee recipient, for the fee
 * amount) is excluded from recipient matching. The initial pull
 * (sender -> BatchPay contract) never matches because only transfers
 * OUT of the BatchPay contract are considered.
 */

export interface ChunkReceipt {
  hash: `0x${string}`;
  receipt: TransactionReceipt;
}

interface ObservedTransfer {
  to: Address;
  value: bigint;
  txHash: `0x${string}`;
  logIndex: number;
  used: boolean;
}

export function reconcileBatch(
  chunks: ChunkReceipt[],
  expected: ExpectedLine[],
  tokenAddress: Address,
  batchPayAddress: Address,
  feeRecipient: Address,
  feeAmount: bigint,
): ReconciliationSummary {
  /* ---- Collect observed recipient transfers from every chunk ---- */
  const observed: ObservedTransfer[] = [];
  let feeLogExcluded = false;

  for (const { hash, receipt } of chunks) {
    const transfers = parseEventLogs({
      abi: erc20Abi,
      eventName: "Transfer",
      logs: receipt.logs,
    });
    for (const log of transfers) {
      if (log.address.toLowerCase() !== tokenAddress.toLowerCase()) continue;
      if (log.args.from?.toLowerCase() !== batchPayAddress.toLowerCase()) continue;
      const to = log.args.to as Address;
      const value = log.args.value as bigint;

      // Exclude exactly one fee transfer log from recipient matching.
      if (
        !feeLogExcluded &&
        feeAmount > 0n &&
        to.toLowerCase() === feeRecipient.toLowerCase() &&
        value === feeAmount
      ) {
        feeLogExcluded = true;
        continue;
      }

      observed.push({
        to,
        value,
        txHash: hash,
        logIndex: log.logIndex,
        used: false,
      });
    }
  }

  /* ---- Match every expected line, in order ---- */
  const lines: ReconciledLine[] = expected.map((exp) => {
    const exact = observed.find(
      (o) =>
        !o.used &&
        o.to.toLowerCase() === exp.address.toLowerCase() &&
        o.value === exp.amount,
    );
    if (exact) {
      exact.used = true;
      return {
        row: exp.row,
        name: exp.name,
        address: exp.address,
        amount: exp.amount,
        status: "matched" as const,
        observedAmount: exact.value,
        txHash: exact.txHash,
        logIndex: exact.logIndex,
      };
    }

    // Same recipient paid, but a different amount: a mismatch, not a pass.
    const wrongAmount = observed.find(
      (o) => !o.used && o.to.toLowerCase() === exp.address.toLowerCase(),
    );
    if (wrongAmount) {
      wrongAmount.used = true;
      return {
        row: exp.row,
        name: exp.name,
        address: exp.address,
        amount: exp.amount,
        status: "mismatch" as const,
        observedAmount: wrongAmount.value,
        txHash: wrongAmount.txHash,
        logIndex: wrongAmount.logIndex,
      };
    }

    return {
      row: exp.row,
      name: exp.name,
      address: exp.address,
      amount: exp.amount,
      status: "missing" as const,
    };
  });

  const matchedCount = lines.filter((l) => l.status === "matched").length;
  const mismatchCount = lines.filter((l) => l.status === "mismatch").length;
  const missingCount = lines.filter((l) => l.status === "missing").length;

  return {
    lines,
    matchedCount,
    missingCount,
    mismatchCount,
    complete: missingCount === 0 && mismatchCount === 0,
  };
}
