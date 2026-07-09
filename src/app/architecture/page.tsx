"use client";

import ArchitectureDiagram from "@/components/architecture/ArchitectureDiagram";
import Link from "next/link";

export default function ArchitecturePage() {
  return (
    <main className="min-h-screen bg-[#050508] px-4 py-24">
      {/* Back link */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors duration-200"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 2L4 7L9 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to home
        </Link>
      </div>

      {/* Diagram */}
      <div className="max-w-4xl mx-auto">
        <ArchitectureDiagram />
      </div>

      {/* Caption for README embed */}
      <div className="max-w-4xl mx-auto mt-6 text-center">
        <p className="text-xs text-white/20">
          VibeFlow architecture — Hackathon submission for Stablecoins Commerce Stack Challenge
        </p>
      </div>
    </main>
  );
}
