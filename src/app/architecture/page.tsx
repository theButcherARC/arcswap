"use client";

import ArchitectureDiagram from "@/components/architecture/ArchitectureDiagram";
import Link from "next/link";

export default function ArchitecturePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--bg)] px-5 py-24 sm:px-8">
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />

      {/* Back link */}
      <div className="relative mx-auto mb-8 max-w-4xl">
        <Link
          href="/"
          className="mono-label inline-flex items-center gap-1.5 transition-colors duration-200 hover:!text-[var(--fg)]"
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
      <div className="relative mx-auto max-w-4xl">
        <ArchitectureDiagram />
      </div>

      {/* Caption for README embed */}
      <div className="relative mx-auto mt-6 max-w-4xl text-center">
        <p className="mono-label">
          VibeFlow architecture - Built with Arc Studio on Arc Blockchain
        </p>
      </div>
    </main>
  );
}
