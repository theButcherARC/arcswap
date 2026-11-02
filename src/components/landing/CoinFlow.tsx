import { TokenCoin } from "@/components/TokenCoin";

/**
 * CoinFlow: glass coins (USDC, VIBE, EURC) flowing down the hero,
 * the name made visible. Pure CSS motion from globals.css
 * (.coin-fall / .coin-sway), no JS, reduced-motion safe.
 * Streams sit on the right of the hero so the headline stays clear.
 */

type CoinSpec = {
  left: string;
  size: number;
  duration: number;
  delay: number;
  kind: "USDC" | "VIBE" | "EURC";
  depth?: boolean;
};

const STREAMS: CoinSpec[] = [
  { left: "57%", size: 54, duration: 30, delay: -6, kind: "USDC" },
  { left: "69%", size: 64, duration: 34, delay: -18, kind: "VIBE" },
  { left: "81%", size: 48, duration: 27, delay: -11, kind: "EURC" },
  { left: "90%", size: 40, duration: 24, delay: -3, kind: "USDC", depth: true },
  { left: "63%", size: 38, duration: 26, delay: -21, kind: "EURC", depth: true },
  { left: "76%", size: 58, duration: 36, delay: -27, kind: "USDC" },
  { left: "95%", size: 44, duration: 29, delay: -14, kind: "VIBE" },
  { left: "50%", size: 34, duration: 25, delay: -9, kind: "VIBE", depth: true },
  { left: "86%", size: 34, duration: 31, delay: -24, kind: "EURC", depth: true },
];

function VibeCoin({ size }: { size: number }) {
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center rounded-full bg-white/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65),0_12px_28px_rgba(39,117,202,0.25)] backdrop-blur-md"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-mark.svg"
        alt=""
        width={Math.round(size * 0.62)}
        height={Math.round(size * 0.62)}
        loading="lazy"
      />
      <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_28%,rgba(255,255,255,0.5),transparent_55%)]" />
    </span>
  );
}

export function CoinFlow() {
  return (
    <div className="coin-flow pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {STREAMS.map((c, i) => (
        <span
          key={i}
          className="coin-fall"
          style={{
            left: c.left,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
          }}
        >
          <span
            className="coin-sway"
            style={{ animationDuration: `${3.6 + (i % 4) * 0.7}s` }}
          >
            {c.kind === "VIBE" ? (
              <VibeCoin size={c.size} />
            ) : (
              <TokenCoin
                symbol={c.kind}
                size={c.size}
                className={c.depth ? "opacity-60 blur-[1.2px]" : "opacity-95"}
              />
            )}
          </span>
        </span>
      ))}
    </div>
  );
}
