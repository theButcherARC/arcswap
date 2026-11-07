import type { Metadata } from "next";
import AIPayForm from "@/components/bulk-pay/AIPayForm";

export const metadata: Metadata = {
  title: "AI Pay - VibeFlow",
  description:
    "Describe your payments in plain words and let the AI agent build the batch. Review every recipient, then sign once.",
};

export default function AIPayPage() {
  return <AIPayForm />;
}
