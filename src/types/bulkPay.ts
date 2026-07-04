export interface Recipient {
  id: string;
  name: string;
  address: string;
  percentageInput: string;
  percentage: number | null;
  amountInput: string;
  amount: number | null;
}

export type InputMode = "percentage" | "amount";

export interface BulkPayParams {
  totalAmount: bigint;
  token: {
    address: string;
    symbol: string;
    decimals: number;
  };
  recipients: {
    address: string;
    amount: bigint;
    name: string;
  }[];
}

export type TransferStatus = "pending" | "confirmed" | "failed";

export interface BulkPayStatus {
  status: "idle" | "preparing" | "sending" | "success" | "error";
  txHash?: string;
  error?: string;
  transfers?: {
    address: string;
    amount: bigint;
    status: TransferStatus;
  }[];
}