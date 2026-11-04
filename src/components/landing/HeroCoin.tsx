"use client";

import { useEffect, useRef, useState } from "react";
import { HERO_COIN_SRC } from "@/assets/heroCoin";

// A real CSS 3D coin: two faces plus a segmented rim, so it keeps real
// thickness while it turns. Spins slowly and continuously, the way the
// reference shots move. Size is measured, so it works at any scale.
export default function HeroCoin({
  thickness = 16,
  duration = 16,
  className,
}: {
  thickness?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize(el.clientWidth));
    ro.observe(el);
    setSize(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const R = size / 2;
  const T = thickness;
  const N = 28;
  const segLen = Math.ceil((2 * Math.PI * R) / N) + 2;

  return (
    <div ref={ref} className={className} style={{ perspective: "1200px" }} aria-hidden="true">
      <div className="relative aspect-square w-full" style={{ transform: "rotateX(9deg) rotateZ(-5deg)", transformStyle: "preserve-3d" }}>
        <div className="coin-spin absolute inset-0" style={{ animationDuration: `${duration}s`, transformStyle: "preserve-3d" }}>
          {/* front face */}
          <div
            className="absolute inset-0 overflow-hidden rounded-full"
            style={{ transform: `translateZ(${T / 2}px)`, backfaceVisibility: "hidden" }}
          >
            <img src={HERO_COIN_SRC} alt="" className="h-full w-full object-cover" draggable={false} />
          </div>
          {/* back face */}
          <div
            className="absolute inset-0 overflow-hidden rounded-full"
            style={{ transform: `rotateY(180deg) translateZ(${T / 2}px)`, backfaceVisibility: "hidden" }}
          >
            <img src={HERO_COIN_SRC} alt="" className="h-full w-full object-cover" draggable={false} />
          </div>
          {/* rim segments */}
          {size > 0 &&
            Array.from({ length: N }, (_, i) => {
              const a = (360 / N) * i;
              return (
                <span
                  key={i}
                  className="absolute"
                  style={{
                    width: T,
                    height: segLen,
                    left: "50%",
                    top: "50%",
                    marginLeft: -T / 2,
                    marginTop: -segLen / 2,
                    transform: `rotateZ(${a}deg) rotateY(-90deg) translateZ(${-R}px)`,
                    background:
                      i % 2 === 0
                        ? "linear-gradient(180deg, #8fc1ee, #2775ca 45%, #174e85)"
                        : "linear-gradient(180deg, #6aa7e2, #1f66b4 45%, #123f70)",
                  }}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
}
