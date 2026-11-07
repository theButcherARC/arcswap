import type { Metadata } from "next";
import BulkPayForm from "@/components/bulk-pay/BulkPayForm";

export const metadata: Metadata = {
  title: "Quick Pay - VibeFlow",
};

export default function BulkPayPage() {
  return <BulkPayForm />;
}