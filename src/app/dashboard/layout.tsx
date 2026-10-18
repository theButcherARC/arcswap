import type { Metadata } from 'next';

export const metadata: Metadata = {
  // App functionality page - keep out of search results so the
  // landing page is the only page competing for rankings.
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
