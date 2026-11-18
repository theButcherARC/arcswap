import type { Metadata } from "next";
import { ScheduledPayments } from "@/components/dashboard/ScheduledPayments";

export const metadata: Metadata = {
  title: "Scheduled Payments",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ScheduledPage() {
  return (
    <main className="relative min-h-screen bg-[var(--bg)] px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="relative mx-auto w-full max-w-5xl">
        <div className="mb-8">
          <span className="mono-label block mb-2">SYS.SCHEDULED</span>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--fg)] sm:text-4xl">
            Scheduled payments
          </h1>
        </div>
        <ScheduledPayments />
      </div>
    </main>
  );
}
