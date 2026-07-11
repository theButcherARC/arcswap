import { useRef, useEffect } from 'react'
import type { Recipient } from '@/types/bulkPay'

interface PaymentConfirmDialogProps {
  isOpen: boolean
  recipients: Recipient[]
  totalAmount: number
  symbol: string
  gasEstimate: number
  onConfirm: () => void
  onCancel: () => void
}

export default function PaymentConfirmDialog({
  isOpen,
  recipients,
  totalAmount,
  symbol,
  gasEstimate,
  onConfirm,
  onCancel,
}: PaymentConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal()
    } else {
      dialogRef.current?.close()
    }
  }, [isOpen])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onCancel()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="backdrop:bg-black/50 backdrop:backdrop-blur-sm rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] shadow-2xl shadow-black/50 p-0 max-w-md w-full"
    >
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Confirm Payment</h2>
          <p className="text-sm text-white/60 mt-1">Review details before sending</p>
        </div>

        {/* Summary */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.03] border border-white/5">
            <span className="text-sm text-white/70">Total Amount</span>
            <span className="text-sm font-semibold text-violet-300">
              {totalAmount.toFixed(2)} {symbol}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.03] border border-white/5">
            <span className="text-sm text-white/70">Recipients</span>
            <span className="text-sm font-semibold text-white">{recipients.length}</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.03] border border-white/5">
            <span className="text-sm text-white/70">Est. Gas</span>
            <span className="text-sm font-semibold text-white/60">~${gasEstimate.toFixed(4)}</span>
          </div>
        </div>

        {/* Recipients List */}
        <div className="mb-6 max-h-40 overflow-y-auto">
          <p className="text-xs font-medium text-white/60 mb-2">Recipients:</p>
          <div className="space-y-1">
            {recipients.slice(0, 5).map((r, i) => (
              <div key={i} className="text-xs text-white/50 flex items-center justify-between">
                <span className="truncate">{r.name}</span>
                <span className="text-violet-300 ml-2">{r.amount ? r.amount.toFixed(2) : '0.00'} {symbol}</span>
              </div>
            ))}
            {recipients.length > 5 && (
              <p className="text-xs text-white/40 italic">+{recipients.length - 5} more...</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all active:scale-[0.98]"
          >
            Send Payment
          </button>
        </div>
      </div>
    </dialog>
  )
}
