import { type Address, encodeFunctionData, erc20Abi } from "viem";
import type { BulkPayParams } from "@/types/bulkPay";
import type { Token } from "@/types/token";

export const MULTICALL3_FROM_ADDRESS: Address =
  "0x522fAf9A91c41c443c66765030741e4AaCe147D0";

export const MULTICALL3_FROM_ABI = [
  {
    type: "function",
    name: "aggregate3",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "calls",
        type: "tuple[]",
        components: [
          { name: "target", type: "address" },
          { name: "allowFailure", type: "bool" },
          { name: "callData", type: "bytes" },
        ],
      },
    ],
    outputs: [
      {
        name: "returnData",
        type: "tuple[]",
        components: [
          { name: "success", type: "bool" },
          { name: "returnData", type: "bytes" },
        ],
      },
    ],
  },
] as const;

export interface TransferInstruction {
  token: Token;
  to: Address;
  amount: bigint;
  name: string;
}

export interface Multicall3Call {
  target: Address;
  allowFailure: boolean;
  callData: `0x${string}`;
}

export function buildTransfers(params: BulkPayParams): TransferInstruction[] {
  if (params.recipients.length === 0) throw new Error("No recipients provided.");
  if (params.totalAmount === 0n) throw new Error("Total amount must be greater than zero.");

  return params.recipients.map((r) => ({
    token: params.token,
    to: r.address,
    amount: r.amount,
    name: r.name,
  }));
}

export function buildMulticallCalls(instructions: TransferInstruction[]): Multicall3Call[] {
  return instructions.map((instr) => ({
    target: instr.token.address as Address,
    allowFailure: false,
    callData: encodeFunctionData({
      abi: erc20Abi,
      functionName: "transfer",
      args: [instr.to, instr.amount],
    }),
  }));
}

export function getTotalAmount(instructions: TransferInstruction[]): bigint {
  return instructions.reduce((sum, i) => sum + i.amount, 0n);
}