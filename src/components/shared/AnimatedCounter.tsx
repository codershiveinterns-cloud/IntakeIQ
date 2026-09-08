"use client";

import React, { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

/**
 * Counts up from 0 to `value` once the element scrolls into view.
 * Pass a `key` at the call site (e.g. keyed by tab id) to re-trigger
 * the count-up whenever the underlying value changes identity.
 */
export default function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 900,
  className,
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setDisplay(value);
      return;
    }

    let frame: number;
    let watchdog: ReturnType<typeof setTimeout>;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          // Clamp at 0 as well as 1: the rAF frame timestamp can precede the
          // `start` captured a moment earlier, which would otherwise yield a
          // negative eased value and briefly render as "-0.0".
          const progress = Math.max(0, Math.min(1, (now - start) / duration));
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(value * eased);
          if (progress < 1) {
            frame = requestAnimationFrame(tick);
          } else {
            setDisplay(value);
          }
        };
        frame = requestAnimationFrame(tick);
        // Guarantees the final value lands even if rAF stalls (e.g. a
        // backgrounded/throttled tab) instead of leaving the count stuck mid-way.
        watchdog = setTimeout(() => setDisplay(value), duration + 250);
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      if (watchdog) clearTimeout(watchdog);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
