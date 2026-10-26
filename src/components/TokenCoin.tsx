import { TOKENS } from "@/constants/tokens";

/**
 * Token coin with a soft 3D face: the real logo art, a light sheen
 * and a hairline ring, so tokens read as coins instead of flat dots.
 * `animate` adds the slow sway from globals.css (.coin-3d).
 * Keep the animated variant on the landing page only.
 */
export function TokenCoin({
  symbol,
  size = 40,
  animate = false,
  className = "",
}: {
  symbol: string;
  size?: number;
  animate?: boolean;
  className?: string;
}) {
  const token = TOKENS[symbol];
  if (!token) return null;
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full ${
        animate ? "coin-3d" : ""
      } ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {token.logoURI ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={token.logoURI}
          alt=""
          width={size}
          height={size}
          className="rounded-full"
          loading="lazy"
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center rounded-full bg-[var(--accent)] font-mono font-bold text-white"
          style={{ fontSize: Math.max(10, Math.round(size * 0.34)) }}
        >
          {symbol.slice(0, 1)}
        </span>
      )}
      <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_28%,rgba(255,255,255,0.28),transparent_55%)]" />
      <span className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14),0_10px_24px_rgba(0,0,0,0.35)]" />
    </span>
  );
}
