import type { Metadata } from "next";
import AIPayForm from "@/components/bulk-pay/AIPayForm";

export const metadata: Metadata = {
  title: "AI - VibeFlow",
  description:
    "Describe your payments in plain words. The AI drafts the batch, you review every recipient, then sign once.",
};

export default function AIPayPage() {
  return <AIPayForm />;
}
