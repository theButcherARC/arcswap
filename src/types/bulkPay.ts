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
}

export interface BulkPayParams {
  totalAmount: bigint;
  token: Token;
  recipients: Array<{
    address: Address;
    amount: bigint;
    name: string;
  }>;
}

export interface TransferStatus {
  recipientId: string;
  status: "pending" | "confirming" | "success" | "error";
  txHash?: `0x${string}`;
  error?: string;
}

export type BulkPayStatus = "idle" | "preparing" | "sending" | "success" | "error";