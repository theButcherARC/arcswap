"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { ROUTES } from '@/constants/routes';

const NAV_LINKS = [
  { label: 'Bulk Pay', href: ROUTES.BULK_PAY },
  { label: 'Dashboard', href: ROUTES.DASHBOARD },
  { label: 'VibeID', href: ROUTES.SOCIAL_PROFILE },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--line)] bg-[rgba(6,6,9,0.7)] backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={ROUTES.HOME} className="flex items-center gap-2.5 group">
            <Image
              src="/logo.png"
              alt="VibeFlow"
              width={40}
              height={40}
              style={{ objectFit: 'contain' }}
              className="transition-opacity duration-300 group-hover:opacity-80"
              priority
              unoptimized
            />
            <span className="hidden sm:inline font-semibold text-lg tracking-tight text-[var(--fg)]">
              VibeFlow
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center border border-[var(--line)] bg-[var(--glass)] p-1" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? 'page' : undefined}
                className={pathname === link.href
                  ? 'whitespace-nowrap px-3 sm:px-4 py-1.5 bg-[var(--fg)] text-[var(--bg)] text-sm font-medium transition-all duration-200'
                  : 'whitespace-nowrap px-3 sm:px-4 py-1.5 text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--glass-strong)] text-sm font-medium transition-all duration-200'
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <a
              href="https://x.com/The_Last_Dip"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block text-gray-400 hover:text-white transition-colors p-2"
              aria-label="Follow us on X"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}
