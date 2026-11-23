"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";

/**
 * AnimatedNumber, adapted from Vengeance UI's Animated Number
 * (MIT, github.com/Ashutoshx7/VengeanceUI). The original rolls a
 * per-digit strip, which cannot render VibeFlow's formatted figures
 * ("$1.2M", "#31,240,118"), so the mechanism here is a value tween:
 * when the number changes, the displayed value eases from the old
 * figure to the new one on the settle curve and is formatted on
 * every frame by the caller's formatter (the money.ts / surface
 * formatters stay the single source of number format). The first
 * value renders instantly, and under prefers-reduced-motion every
 * change is instant.
 */

const SETTLE_EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

interface AnimatedNumberProps {
  value: number;
  format: (n: number) => string;
  className?: string;
}

export default function AnimatedNumber({
  value,
  format,
  className,
}: AnimatedNumberProps) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const displayRef = useRef(value);
  const firstRef = useRef(true);

  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false;
      displayRef.current = value;
      setDisplay(value);
      return;
    }
    if (reduceMotion || displayRef.current === value) {
      displayRef.current = value;
      setDisplay(value);
      return;
    }
    const controls = animate(displayRef.current, value, {
      duration: 0.6,
      ease: SETTLE_EASE,
      onUpdate: (v) => {
        displayRef.current = v;
        setDisplay(v);
      },
    });
    return () => controls.stop();
  }, [value, reduceMotion]);

  return <span className={className}>{format(display)}</span>;
}
