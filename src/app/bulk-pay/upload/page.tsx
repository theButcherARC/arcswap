import type { Metadata } from "next";
import CSVUploadForm from "@/components/bulk-pay/CSVUploadForm";

export const metadata: Metadata = {
  title: "CSV Upload - VibeFlow",
  description: "Upload a CSV to send USDC or EURC to 100+ recipients in one transaction.",
};

export default function CSVUploadPage() {
  return <CSVUploadForm />;
}
