"use client";

interface Props {
  txHash: string;
  onReset: () => void;
}

export function BulkPaySuccess({ txHash, onReset }: Props) {
  return (
    <div className="text-center py-6">
      <p className="text-green-400 font-semibold text-lg mb-2">Payments sent!</p>
      <p className="text-xs text-gray-400 mb-2 break-all">{txHash}</p>
      <a href={"https://testnet.arcscan.app/tx/" + txHash} target="_blank" rel="noopener noreferrer" className="text-arc-500 text-sm underline">View on ArcScan</a>
      <button onClick={onReset} className="block mx-auto mt-4 text-sm text-surface-400 hover:text-white underline">New payment</button>
    </div>
  );
}
