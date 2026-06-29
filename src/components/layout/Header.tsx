"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { ROUTES } from "@/constants/routes";

const NAV_LINKS = [
  { href: ROUTES.SWAP,     label: "Swap" },
  { href: ROUTES.BULK_PAY, label: "Bulk Pay" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-surface-100 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <Link href={ROUTES.HOME} className="flex items-center gap-2 text-lg font-bold tracking-tight text-arc-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-arc-500 to-arc-700 text-sm text-white shadow-premium">
            V
          </span>
          VibeFlow
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1 rounded-2xl border border-surface-100 bg-surface-50/60 p-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={[
                "rounded-xl px-4 py-1.5 text-sm font-medium transition-all",
                pathname === href
                  ? "bg-white text-arc-700 shadow-premium"
                  : "text-surface-300 hover:text-arc-700",
              ].join(" ")}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Wallet */}
        <ConnectButton />
      </div>
    </header>
  );
}