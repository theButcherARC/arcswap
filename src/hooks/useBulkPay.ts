"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useArcNetwork } from "./useArcNetwork";
import { getErrorMessage, isUserRejection, APP_ERRORS } from "@/utils/errors";
import { BULK_PAY_MAX_RECIPIENTS } from "@/constants/tokens";
import type { BulkPayParams, BulkPayStatus, TransferStatus } from "@/types/bulkPay";

/**
 * Orchestrates bulk ERC20 transfers:
 *   1. Validate all recipients (non-empty address, valid amount)
 *   2. Approve token(s) if needed
 *   3. Execute transfers sequentially (MVP — no multicall)
 *
 * TODO (Phase 4):
 *   - Import and call bulkPayService.buildTransfers()
 *   - Loop transfers and call useWriteContract per transfer
 *   - Track per-transfer status in transferStatuses
 */
export function useBulkPay() {
  const { address } = useAccount();
  const { isCorrectNetwork } = useArcNetwork();
  const [status, setBulkStatus] = useState<BulkPayStatus>("idle");
  const [transferStatuses, setTransferStatuses] = useState<TransferStatus[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function executeBulkPay(params: BulkPayParams) {
    if (!address) { setError(APP_ERRORS.WALLET_NOT_CONNECTED); return; }
    if (!isCorrectNetwork) { setError(APP_ERRORS.WRONG_NETWORK); return; }
    if (params.recipients.length > BULK_PAY_MAX_RECIPIENTS) {
      setError(`Maximum ${BULK_PAY_MAX_RECIPIENTS} recipients allowed.`);
      return;
    }

    try {
      setError(null);
      setBulkStatus("approving");

      // TODO: Group recipients by token, approve the required allowance for each
      // TODO: setBulkStatus("sending")
      // TODO: Loop transfers, update transferStatuses per tx
      // TODO: setBulkStatus("success")
    } catch (err) {
      setError(isUserRejection(err) ? APP_ERRORS.TX_REJECTED : getErrorMessage(err));
      setBulkStatus("error");
    }
  }

  function reset() {
    setBulkStatus("idle");
    setTransferStatuses([]);
    setError(null);
  }

  return { status, transferStatuses, error, executeBulkPay, reset };
}
