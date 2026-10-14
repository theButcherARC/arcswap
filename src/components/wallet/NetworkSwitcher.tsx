"use client";

import { useChainId, useSwitchChain } from "wagmi";
import { arc, arcTestnet } from "@/constants/chains";

const NETWORKS = [arc, arcTestnet] as const;

export function NetworkSwitcher() {
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const active = NETWORKS.find((network) => network.id === chainId) ?? arc;

  return (
    <div className="flex items-center rounded-xl border border-[var(--line)] bg-[var(--glass)] p-1" aria-label="Arc network">
      {NETWORKS.map((network) => {
        const isActive = active.id === network.id;
        return (
          <button
            key={network.id}
            type="button"
            disabled={isPending || isActive}
            onClick={() => switchChain({ chainId: network.id })}
            className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors sm:px-3 ${
              isActive
                ? "bg-[var(--accent)] text-white shadow-[0_6px_18px_rgba(139,124,246,0.2)]"
                : "text-[var(--fg-muted)] hover:bg-[var(--glass-strong)] hover:text-[var(--fg)]"
            } ${isPending ? "cursor-wait opacity-60" : ""}`}
          >
            <span className="hidden sm:inline">{network === arc ? "Mainnet" : "Testnet"}</span>
            <span className="sm:hidden">{network === arc ? "Main" : "Test"}</span>
          </button>
        );
      })}
    </div>
  );
}
