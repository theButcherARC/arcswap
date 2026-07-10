"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { ROUTES } from '@/constants/routes';

const NAV_LINKS = [
  { label: 'Bulk Pay', href: ROUTES.BULK_PAY },
  { label: 'Dashboard', href: ROUTES.DASHBOARD },
  { label: 'Social', href: ROUTES.SOCIAL_PROFILE },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_1px_0_rgba(255,255,255,0.04),0_8px_32px_rgba(0,0,0,0.3)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={ROUTES.HOME} className="flex items-center gap-2.5 group">
            <Image
              src="/logo.png"
              alt="VibeFlow"
              width={34}
              height={34}
              className="group-hover:scale-105 transition-all duration-300 drop-shadow-[0_0_8px_rgba(139,92,246,0.4)] group-hover:drop-shadow-[0_0_14px_rgba(139,92,246,0.7)]"
              priority
            />
            <span className="hidden sm:inline font-semibold text-lg tracking-tight">
              <span className="text-white">Vibe</span><span className="animate-gradient-x bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">Flow</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center gap-0.5 rounded-full border border-white/[0.06] bg-white/[0.03] p-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? 'page' : undefined}
                className={pathname === link.href
                  ? 'whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-200'
                  : 'whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/[0.05] text-sm font-medium transition-all duration-200'
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
