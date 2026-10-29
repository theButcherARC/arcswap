"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { NetworkSwitcher } from '@/components/wallet/NetworkSwitcher';
import { ROUTES } from '@/constants/routes';

export function Header() {

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--line)] bg-[rgba(255,255,255,0.86)] backdrop-blur-2xl">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between gap-6">
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

          {/* Home, the only header nav button (Haroon, Oct 29) */}
          <nav aria-label="Main navigation">
            <Link
              href={ROUTES.HOME_PAGE}
              className="flex min-h-[44px] items-center whitespace-nowrap rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white shadow-[0_8px_24px_rgba(39,117,202,0.25)] transition-all duration-200 hover:opacity-90"
            >
              Home
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-3">
            <NetworkSwitcher />
            <a
              href="https://x.com/The_Last_Dip"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block text-[var(--fg-faint)] hover:text-[var(--fg)] transition-colors p-2"
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
