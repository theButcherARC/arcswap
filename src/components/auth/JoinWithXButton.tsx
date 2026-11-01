"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/constants/routes";

function XGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

type SessionUser = {
  name?: string | null;
  image?: string | null;
  username?: string | null;
};

// Join with X: the Front Door signup entry. The X username becomes the
// VibeID by default after signup. Signed-in users see their own handle
// as a chip that links to their profile page instead.
export function JoinWithXButton({ variant = "header" }: { variant?: "header" | "hero" }) {
  const { data: session, isPending } = authClient.useSession();
  const [busy, setBusy] = useState(false);
  const user = (session?.user ?? undefined) as SessionUser | undefined;

  const sizing =
    variant === "hero"
      ? "inline-flex min-h-[52px] px-8 py-4 text-base"
      : "hidden min-h-[44px] px-4 text-sm md:inline-flex";

  if (user) {
    const label = user.username ? `@${user.username}` : user.name ?? "My VibeID";
    return (
      <Link
        href={ROUTES.SOCIAL_PROFILE}
        className={`items-center justify-center gap-2 border border-[var(--line)] bg-white font-semibold text-[var(--fg)] transition-colors hover:border-[var(--accent)] ${sizing}`}
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" className="h-6 w-6 rounded-full" />
        ) : (
          <XGlyph className="h-4 w-4" />
        )}
        <span className="max-w-[140px] truncate">{label}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={async () => {
        setBusy(true);
        try {
          await authClient.signIn.social({ provider: "twitter", callbackURL: ROUTES.SOCIAL_PROFILE });
        } finally {
          setBusy(false);
        }
      }}
      disabled={busy || isPending}
      className={`items-center justify-center gap-2.5 bg-[#0f1419] font-semibold text-white transition-opacity duration-200 hover:opacity-85 disabled:opacity-60 ${sizing}`}
    >
      <XGlyph className={variant === "hero" ? "h-5 w-5" : "h-4 w-4"} />
      {busy ? "Opening X..." : "Join with X"}
    </button>
  );
}
