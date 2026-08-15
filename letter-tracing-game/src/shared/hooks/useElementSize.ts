"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

export interface ElementSize {
  w: number;
  h: number;
}

/**
 * Measures a rendered element and returns its pixel size.
 *
 * Every full-screen celebration in the portal sizes its confetti canvas from
 * the ACTUAL rendered root rather than window.innerWidth/innerHeight. That is
 * not a preference: each game screen renders inside a transformed Framer
 * Motion ancestor (PAGE_TRANSITION animates scale), and position:fixed plus
 * viewport dimensions break inside a transformed parent — the symptom is
 * confetti bunching to one side of the screen. Measuring the element itself
 * is immune to that, which is why all six screens did it by hand before this
 * hook existed.
 *
 * The 360×640 seed matches the previous per-screen defaults exactly, so the
 * very first frame (before layout is measurable) is unchanged.
 *
 * @param trackResize re-measure on window resize — only the tracing board
 *        needs this; celebration overlays are short-lived and measured once.
 */
export function useElementSize<T extends HTMLElement = HTMLDivElement>(
  trackResize = false
): [RefObject<T>, ElementSize] {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<ElementSize>({ w: 360, h: 640 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    if (!trackResize) return;
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [trackResize]);

  return [ref, size];
}
