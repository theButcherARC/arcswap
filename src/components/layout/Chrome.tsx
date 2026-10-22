"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { AppShell } from "./AppShell";

const APP_PREFIXES = [
  "/bulk-pay",
  "/dashboard",
  "/social-profile",
  "/roadmap",
  "/architecture",
  "/admin",
  "/scheduled",
];

export function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const isApp = APP_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  if (isApp) {
    return <AppShell>{children}</AppShell>;
  }

  return (
    <>
      <Header />
      {children}
    </>
  );
}
