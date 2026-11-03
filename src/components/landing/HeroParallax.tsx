"use client";

import { useEffect } from "react";

/**
 * HeroParallax: Lead Bank style quiet motion for the landing hero.
 * Writes --hpx / --hpy (mouse, -1..1) and --hsy (scroll through the hero, 0..1)
 * on :root, lerped inside requestAnimationFrame so the drift stays calm.
 * Layers opt in with .px-bg / .px-panel / .px-glow / .px-card (see globals.css).
 * Renders nothing. Honors prefers-reduced-motion; the mouse is only tracked
 * on fine pointers, touch devices get the scroll drift only.
 */
export default function HeroParallax() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    const fine = window.matchMedia("(pointer: fine)").matches;
    let tx = 0;
    let ty = 0;
    let px = 0;
    let py = 0;
    let sy = 0;
    let raf = 0;

    const onMouse = (e: MouseEvent) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onScroll = () => {
      sy = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);
    };
    const loop = () => {
      px += (tx - px) * 0.055;
      py += (ty - py) * 0.055;
      root.style.setProperty("--hpx", px.toFixed(4));
      root.style.setProperty("--hpy", py.toFixed(4));
      root.style.setProperty("--hsy", sy.toFixed(4));
      raf = requestAnimationFrame(loop);
    };

    onScroll();
    if (fine) window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      if (fine) window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("scroll", onScroll);
      root.style.removeProperty("--hpx");
      root.style.removeProperty("--hpy");
      root.style.removeProperty("--hsy");
    };
  }, []);

  return null;
}
