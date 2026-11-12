import Link from "next/link";

export function StudioBadge() {
  return (
    <Link
      href="https://studio.arc.io"
      target="_blank"
      rel="noreferrer"
      aria-label="Built with Arc Studio"
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full border border-[var(--line)] py-2 pl-2 pr-3.5 shadow-[0_8px_24px_rgba(11,13,22,0.10)] transition-transform hover:-translate-y-0.5"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--accent) 10%, var(--bg-raised))",
      }}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-[11px] font-bold text-white">
        A
      </span>
      <span className="mono-label !text-[var(--fg)]">Built with Arc Studio</span>
    </Link>
  );
}
