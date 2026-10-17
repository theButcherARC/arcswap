"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "What does VibeFlow cost?",
    a: "A flat 0.2% protocol fee per batch, minimum $0.01. No subscription, no per-seat pricing. You also pay the Arc network gas, which is typically a fraction of a cent.",
  },
  {
    q: "Which wallet and network do I need?",
    a: "MetaMask with USDC or EURC on Arc. The app auto-switches you to Arc Mainnet (or Testnet, if you prefer to try it first).",
  },
  {
    q: "How many people can I pay at once?",
    a: "Up to 100 recipients in a single batch, settled with one signature. No ERC20 approval step needed.",
  },
  {
    q: "Do I keep custody of my funds?",
    a: "Yes. VibeFlow is non-custodial: you sign every batch from your own wallet and funds move straight to recipients. We never hold your money.",
  },
  {
    q: "Do recipients need a VibeFlow account?",
    a: "No. Pay anyone with a wallet address, an X handle, or a VibeID.",
  },
  {
    q: "Can I upload a recipient list?",
    a: "Yes. Use CSV Upload on the Bulk Pay page for large lists, or describe the whole batch in plain English and let the AI agent fill the form.",
  },
  {
    q: "What is the VIBE holder discount?",
    a: "VIBE holders will get 50% off protocol fees, plus payroll templates. It is on the roadmap and not live yet.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative z-10 px-5 mb-32 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <span className="mono-label mb-4 block">SYS.FAQ / 07</span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Questions, answered.
          </h2>
        </div>
        <div className="border-t border-[var(--line)]">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="border-b border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-base font-semibold text-[var(--fg)]">
                    {item.q}
                  </span>
                  <span
                    className={
                      "shrink-0 text-xl text-[var(--fg-muted)] transition-transform duration-200 " +
                      (isOpen ? "rotate-45" : "")
                    }
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>
                {isOpen ? (
                  <p className="pb-6 pr-8 text-sm leading-relaxed text-[var(--fg-muted)]">
                    {item.a}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
