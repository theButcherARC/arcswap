"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Outcrowd-style scroll growth for the hero visual: as it travels up
// through the first stretch of scrolling it scales up toward full focus,
// while floating children that consume the --hp variable drift outward.
export function HeroScroll({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const p = Math.min(1, Math.max(0, -rect.top / (vh * 0.55)));
      el.style.setProperty("--hp", p.toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{ transform: "scale(calc(0.94 + var(--hp, 0) * 0.09))", transformOrigin: "50% 0%" }}
    >
      {children}
    </div>
  );
}
