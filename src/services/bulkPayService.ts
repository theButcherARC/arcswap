import { parseUnits, type Address } from "viem";
import type { BulkPayParams } from "@/types/bulkPay";
import type { Token } from "@/types/token";

/* --------------------------------------------------------------- */
/*  BatchPay v2 (Arc mainnet)                                       */
/*                                                                  */
/*  VibeFlowBatchPay, built in Arc Studio and deployed to Arc       */
/*  mainnet. disperse() pulls exactly total + fee from the sender   */
/*  (the sender approves this contract first) and pays every        */
/*  recipient atomically inside one call: if any transfer fails,    */
/*  the whole call reverts. The contract caps a call at 1000        */
/*  recipients; the app sends in chunks of 250.                     */
/* --------------------------------------------------------------- */

export const BATCHPAY_V2_ADDRESS: Address =
  "0x85D9d1754f3Fff8d9757DEADcD701614199F7A2B";

/**
 * Protocol fee recipient for BatchPay v2.
 *
 * NOTE: the v1 code had no fee-recipient constant anywhere (the 0.2% fee
 * was display copy only and was never collected onchain). This address is
 * the project owner's wallet, the same wallet that deployed the BatchPay
 * v2 contract. Confirm or change it before this ships to production.
 */
export const BATCHPAY_FEE_RECIPIENT: Address =
  "0xa04C24A33Dd54cE8142319FEccDd9602C5D1AAaE";

/** Recipients per disperse transaction. The contract allows 1000; the
 *  app chunks at 250 to keep gas and wallet signing manageable. */
export const BATCHPAY_CHUNK_SIZE = 250;

export const BATCHPAY_V2_ABI = [
  {
    type: "function",
    name: "disperse",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "recipients", type: "address[]" },
      { name: "amounts", type: "uint256[]" },
      { name: "memos", type: "string[]" },
      { name: "feeRecipient", type: "address" },
      { name: "feeAmount", type: "uint256" },
      { name: "batchMemo", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "event",
    name: "BatchSent",
    inputs: [
      { name: "sender", type: "address", indexed: true },
      { name: "token", type: "address", indexed: true },
      { name: "count", type: "uint256", indexed: false },
      { name: "total", type: "uint256", indexed: false },
      { name: "feeAmount", type: "uint256", indexed: false },
      { name: "batchMemo", type: "string", indexed: false },
    ],
  },
  {
    type: "event",
    name: "PaymentSent",
    inputs: [
      { name: "recipient", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "memo", type: "string", indexed: false },
    ],
  },
] as const;

/**
 * Protocol fee in raw token units: 0.2% of the total, minimum 0.01 of the
 * token. Matches the fee the forms have always displayed
 * (fee = max(total x 0.002, 0.01)).
 */
export function computeProtocolFee(totalRaw: bigint, decimals: number): bigint {
  const pct = (totalRaw * 2n) / 1000n;
  const min = parseUnits("0.01", decimals);
  return pct > min ? pct : min;
}

/** Split a list into chunks of at most `size`, preserving order. */
export function chunkList<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/* --------------------------------------------------------------- */
/*  Transfer instructions (shared validation + totals)              */
/* --------------------------------------------------------------- */

export interface TransferInstruction {
  token: Token;
  to: Address;
  amount: bigint;
  name: string;
  memo: string;
}

export function buildTransfers(params: BulkPayParams): TransferInstruction[] {
  if (params.recipients.length === 0) throw new Error("No recipients provided.");
  if (params.totalAmount === 0n) throw new Error("Total amount must be greater than zero.");

  return params.recipients.map((r) => ({
    token: params.token,
    to: r.address,
    amount: r.amount,
    name: r.name,
    memo: (r.memo ?? "").trim(),
  }));
}

export function getTotalAmount(instructions: TransferInstruction[]): bigint {
  return instructions.reduce((sum, i) => sum + i.amount, 0n);
}

/* --------------------------------------------------------------- */
/*  Legacy v1 path (retired)                                        */
/*                                                                  */
/*  Batches used to be sent as plain ERC20 transfers through        */
/*  Multicall3From. The address stays exported because the landing  */
/*  page's onchain proof row references the v1 batch contract.      */
/*  Nothing in the send path uses it any more.                      */
/* --------------------------------------------------------------- */

export const MULTICALL3_FROM_ADDRESS: Address =
  "0x522fAf9A91c41c443c66765030741e4AaCe147D0";
