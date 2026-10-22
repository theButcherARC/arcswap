"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { NetworkSwitcher } from "@/components/wallet/NetworkSwitcher";
import { ROUTES } from "@/constants/routes";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const iconProps = {
  width: 17,
  height: 17,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const NAV_GROUPS: { group: string; items: NavItem[] }[] = [
  {
    group: "Overview",
    items: [
      {
        label: "Dashboard",
        href: ROUTES.DASHBOARD,
        icon: (
          <svg {...iconProps}>
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        ),
      },
    ],
  },
  {
    group: "Payments",
    items: [
      {
        label: "Bulk Pay",
        href: ROUTES.BULK_PAY,
        icon: (
          <svg {...iconProps}>
            <path d="M12 2 2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        ),
      },
      {
        label: "CSV Upload",
        href: ROUTES.BULK_PAY_UPLOAD,
        icon: (
          <svg {...iconProps}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="M17 8l-5-5-5 5" />
            <path d="M12 3v12" />
          </svg>
        ),
      },
      {
        label: "Scheduled",
        href: ROUTES.SCHEDULED,
        icon: (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        ),
      },
    ],
  },
  {
    group: "Account",
    items: [
      {
        label: "VibeID",
        href: ROUTES.SOCIAL_PROFILE,
        icon: (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="4" />
            <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
          </svg>
        ),
      },
    ],
  },
  {
    group: "Project",
    items: [
      {
        label: "Roadmap",
        href: ROUTES.ROADMAP,
        icon: (
          <svg {...iconProps}>
            <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" />
            <path d="M9 4v14" />
            <path d="M15 6v14" />
          </svg>
        ),
      },
      {
        label: "Architecture",
        href: ROUTES.ARCHITECTURE,
        icon: (
          <svg {...iconProps}>
            <path d="M12 2l8 4.5v9L12 20l-8-4.5v-9L12 2z" />
            <path d="M12 11 4 6.5" />
            <path d="M12 11l8-4.5" />
            <path d="M12 11v9" />
          </svg>
        ),
      },
      {
        label: "Social Pay Admin",
        href: ROUTES.ADMIN_SOCIAL,
        icon: (
          <svg {...iconProps}>
            <path d="M12 22s8-3.6 8-10V5l-8-3-8 3v7c0 6.4 8 10 8 10z" />
          </svg>
        ),
      },
    ],
  },
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() || "";

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-[var(--line)] px-5">
        <Link
          href={ROUTES.HOME}
          onClick={onNavigate}
          className="flex items-center gap-2.5"
          aria-label="VibeFlow home"
        >
          <Image src="/logo.png" alt="VibeFlow" width={28} height={28} />
          <span className="text-base font-semibold tracking-tight text-[var(--fg)]">
            VibeFlow
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="App">
        {NAV_GROUPS.map((g) => (
          <div key={g.group} className="mb-6 last:mb-0">
            <p className="mono-label px-2 pb-2">{g.group}</p>
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={
                        "flex items-center gap-3 px-2.5 py-2 text-sm transition-colors duration-150 " +
                        (active
                          ? "bg-[var(--accent-soft)] font-medium text-[var(--fg)]"
                          : "text-[var(--fg-muted)] hover:bg-white/[0.04] hover:text-[var(--fg)]")
                      }
                    >
                      <span className={active ? "text-[var(--accent)]" : "text-[var(--fg-faint)]"}>
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Wallet + back */}
      <div className="border-t border-[var(--line)] px-4 py-4">
        <div className="flex flex-col items-stretch gap-2.5">
          <NetworkSwitcher />
          <ConnectButton />
        </div>
        <Link
          href={ROUTES.HOME}
          onClick={onNavigate}
          className="mono-label mt-4 inline-flex items-center gap-1.5 transition-colors hover:!text-[var(--fg)]"
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to website
        </Link>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-[var(--line)] bg-[var(--bg-raised)] lg:block">
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--line)] bg-[var(--bg)]/90 px-4 backdrop-blur-xl lg:hidden">
        <Link href={ROUTES.HOME} className="flex items-center gap-2.5" aria-label="VibeFlow home">
          <Image src="/logo.png" alt="VibeFlow" width={26} height={26} />
          <span className="text-base font-semibold tracking-tight text-[var(--fg)]">VibeFlow</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center border border-[var(--line)] text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-[var(--line)] bg-[var(--bg-raised)]">
            <NavContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}

      {/* Content */}
      <div className="lg:pl-60">{children}</div>
    </div>
  );
}
