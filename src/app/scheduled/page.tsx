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
        <ScheduledPayments />
      </div>
    </main>
  );
}
