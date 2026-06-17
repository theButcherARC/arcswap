import type { Address } from "viem";
import type { Token } from "./token";

/** A single recipient in a bulk pay operation */
export interface Recipient {
  /** Unique key for React list rendering */
  id: string;
  address: Address | "";
  /** Human-readable amount string from the input field */
  amountInput: string;
  /** Parsed BigInt amount in token's smallest unit — null if input is invalid */
  amountParsed: bigint | null;
  token: Token;
}

/** Parameters for executing a bulk pay */
export interface BulkPayParams {
  recipients: Array<{
    address: Address;
    amount: bigint;
    token: Token;
  }>;
}

/** Status for a single transfer within a bulk pay */
export interface TransferStatus {
  recipientId: string;
  status: "pending" | "confirming" | "success" | "error";
  txHash?: `0x${string}`;
  error?: string;
}

/** Overall bulk pay execution status */
export type BulkPayStatus = "idle" | "approving" | "sending" | "success" | "error";
