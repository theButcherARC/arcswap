"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { NetworkSwitcher } from "@/components/wallet/NetworkSwitcher";
import { LogoMark } from "@/components/brand/Logo";
import { StudioBadge } from "@/components/brand/StudioBadge";
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
        label: "Home",
        href: ROUTES.HOME_PAGE,
        icon: (
          <svg {...iconProps}>
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9.8V21h14V9.8" />
            <path d="M9.5 21v-6h5v6" />
          </svg>
        ),
      },
      {
        label: "Vibrain",
        href: ROUTES.VIBRAIN,
        icon: (
          <svg {...iconProps}>
            <path d="M3 12h4l3 8 4-16 3 8h4" />
          </svg>
        ),
      },
      {
        label: "VibeSquare",
        href: ROUTES.SQUARE,
        icon: (
          <svg {...iconProps}>
            <path d="M4 4h16v16H4z" />
            <path d="M4 12h16" />
            <path d="M12 4v16" />
          </svg>
        ),
      },
      {
        label: "Earn",
        href: ROUTES.EARN,
        icon: (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v10" />
            <path d="M15.2 9.2c-.6-.8-1.8-1.2-3.2-1.2-1.9 0-3.2 1-3.2 2.2 0 2.9 6.6 1.6 6.6 4.4 0 1.2-1.5 2.2-3.4 2.2-1.5 0-2.8-.6-3.4-1.4" />
          </svg>
        ),
      },
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
        label: "Quick Pay",
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
        label: "AI",
        href: ROUTES.BULK_PAY_AI,
        icon: (
          <svg {...iconProps}>
            <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
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
        label: "Profile",
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
          <LogoMark size={28} />
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
                        "flex min-h-11 items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm transition-colors duration-150 " +
                        (active
                          ? "bg-[var(--accent-soft)] font-medium text-[var(--fg)] active:bg-[var(--accent-soft)]"
                          : "text-[var(--fg-muted)] hover:bg-black/[0.04] hover:text-[var(--fg)] active:bg-black/[0.07]")
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
          className="mono-label mt-4 inline-flex min-h-11 items-center gap-1.5 transition-colors hover:!text-[var(--fg)]"
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
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const pathname = usePathname();

  // Hard close on navigation: the page changes underneath, so the
  // drawer must not animate out over a new screen.
  useEffect(() => {
    setOpen(false);
    setMounted(false);
    setShown(false);
  }, [pathname]);

  // Drawer motion (Apple-style, interruptible): mount in the closed
  // position, flip to shown on the next frame so the transition runs
  // from the off-screen value; closing reverses along the same path
  // and unmounts when the slide finishes (timeout is a fallback for a
  // missed transitionend). Reopening mid-close reverses from the
  // current on-screen position, and the wrapper stops taking input
  // the moment closing starts, so input is never locked out.
  useEffect(() => {
    if (open) {
      setMounted(true);
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setShown(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
    setShown(false);
    if (mounted) {
      const t = setTimeout(() => setMounted(false), 420);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open ]);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-[var(--line)] bg-[var(--bg-raised)] lg:block">
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--line)] bg-[var(--bg)]/90 px-4 backdrop-blur-xl lg:hidden">
        <Link href={ROUTES.HOME} className="flex items-center gap-2.5" aria-label="VibeFlow home">
          <LogoMark size={26} />
          <span className="text-base font-semibold tracking-tight text-[var(--fg)]">VibeFlow</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)] active:bg-black/[0.04] pressable"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer: stays mounted through its exit so closing
          slides back along the same path it entered (spatial
          consistency). Pointer events follow `shown`, never the
          animation, so the UI is usable the moment closing starts. */}
      {mounted ? (
        <div
          className={
            "fixed inset-0 z-50 lg:hidden" + (shown ? "" : " pointer-events-none")
          }
          aria-hidden={!shown}
        >
          <div
            className="drawer-scrim absolute inset-0 bg-black/60"
            style={{ opacity: shown ? 1 : 0 }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="drawer-panel absolute inset-y-0 left-0 w-64 border-r border-[var(--line)] bg-[var(--bg-raised)]"
            style={{ transform: shown ? "translateX(0)" : "translateX(-100%)" }}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-2.5 z-10 flex h-11 w-11 items-center justify-center text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)] pressable"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <NavContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}

      {/* Content */}
      <div className="lg:pl-60">{children}</div>

      <StudioBadge />
    </div>
  );
}
