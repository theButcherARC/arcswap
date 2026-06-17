import type { Address } from "viem";
import type { BulkPayParams } from "@/types/bulkPay";
import type { Token } from "@/types/token";

/**
 * Bulk pay service — builds the sequence of ERC20 transfer calls.
 *
 * MVP approach: individual sequential ERC20 transfers.
 * Each transfer is a separate transaction confirmed by the user.
 *
 * Post-MVP: replace with a single multicall transaction to an
 * on-chain Disperse-style contract for atomicity and gas savings.
 *
 * TODO (Phase 4):
 *   - Implement buildTransfers() — group by token, calculate total amounts.
 *   - Implement validateRecipients() — check addresses, amounts > 0, max count.
 */

export interface TransferInstruction {
  token: Token;
  to: Address;
  amount: bigint;
}

/**
 * Convert BulkPayParams into an ordered list of transfer instructions.
 * Validates input and throws descriptive errors on bad data.
 */
export function buildTransfers(_params: BulkPayParams): TransferInstruction[] {
  // TODO: Implement
  // 1. Validate each recipient (valid address, amount > 0)
  // 2. Return flat list of TransferInstructions
  throw new Error("bulkPayService.buildTransfers not yet implemented");
}

/**
 * Aggregate total amounts per token needed across all recipients.
 * Used to determine approval amounts before sending.
 */
export function aggregateByToken(
  _instructions: TransferInstruction[]
): Map<Address, bigint> {
  // TODO: Implement
  // Returns Map<tokenAddress, totalAmount>
  throw new Error("bulkPayService.aggregateByToken not yet implemented");
}
