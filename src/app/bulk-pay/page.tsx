import type { Metadata } from "next";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { NetworkGuard } from "@/components/wallet/NetworkGuard";
import { BulkPayForm } from "@/components/bulk-pay/BulkPayForm";

export const metadata: Metadata = {
  title: "Bulk Pay — VibeFlow",
};

export default function BulkPayPage() {
  return (
    <PageWrapper
      title="Bulk Pay"
      description="Send tokens to up to 10 recipients in one flow."
    >
      <NetworkGuard>
        <BulkPayForm />
      </NetworkGuard>
    </PageWrapper>
  );
}