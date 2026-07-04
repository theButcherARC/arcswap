import type { Metadata } from "next";
import BulkPayForm from "@/components/bulk-pay/BulkPayForm";

export const metadata: Metadata = {
  title: "Bulk Pay - VibeFlow",
};

export default function BulkPayPage() {
  return <BulkPayForm />;
}