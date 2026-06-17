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
    <header className="sticky top-0 z-30 border-b border-surface-200 bg-surface-0/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <Link href={ROUTES.HOME} className="text-base font-bold tracking-tight text-arc-500">
          ArcSwap
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={[
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-arc-50 text-arc-600"
                  : "text-surface-800 hover:bg-surface-50",
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
