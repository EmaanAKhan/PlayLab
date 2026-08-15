"use client";

import { motion } from "framer-motion";
import { cssVars, type PlayLabCssVar } from "@shared/styles/cssVars";

/**
 * HomeEnvironment — a handcrafted pastel garden layer for the HOME screen.
 *
 * Composition rules:
 *  - Everything lives in the outer bands (corners, edges, upper/lower
 *    background). The central column stays completely clear so the logo,
 *    letter shelf and buttons remain visually dominant.
 *  - Percentage positioning + viewport-relative sizes (clamp) so creatures
 *    reposition and scale naturally from phone landscape to 1440px+ desktop —
 *    no fixed pixel positions that break on small screens.
 *  - Larger creatures sit lower/closer, smaller ones higher/distant → depth.
 *  - Motion is slow and calm: gentle glides and soft flutters only.
 *  - The whole layer is pointer-events-none and aria-hidden.
 */

// ── Creatures ────────────────────────────────────────────────────────────────

function BigBird({ body = "#74B9FF", belly = "#EAF6FF", flip = false }: { body?: string; belly?: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 120 100" width="100%" height="100%" className={flip ? "pl-flip-x" : undefined}>
      {/* tail feathers */}
      <path d="M18 52 Q2 42 6 30 Q16 40 24 44 Z" fill={body} opacity="0.75" />
      <path d="M18 58 Q0 58 2 46 Q14 52 24 52 Z" fill={body} opacity="0.6" />
      {/* body */}
      <ellipse cx="55" cy="58" rx="36" ry="27" fill={body} />
      {/* belly */}
      <ellipse cx="60" cy="66" rx="24" ry="16" fill={belly} opacity="0.9" />
      {/* wing */}
      <path d="M34 50 Q54 34 76 46 Q66 62 46 64 Q36 60 34 50 Z" fill={belly} opacity="0.45" />
      <path d="M36 52 Q52 42 68 48" stroke="white" strokeOpacity="0.5" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* head */}
      <circle cx="90" cy="38" r="19" fill={body} />
      {/* cheek */}
      <circle cx="96" cy="45" r="5" fill="#FF9EBC" opacity="0.55" />
      {/* eye */}
      <circle cx="95" cy="34" r="3.4" fill="#3D3D5C" />
      <circle cx="96.2" cy="32.8" r="1.1" fill="white" />
      {/* beak */}
      <path d="M107 37 L119 40.5 L107 45 Q109 41 107 37 Z" fill="#F4A73E" />
      {/* tiny feet */}
      <path d="M48 84 L48 92 M58 85 L58 93" stroke="#F4A73E" strokeWidth="3" strokeLinecap="round" />
      {/* head tuft */}
      <path d="M84 22 Q86 14 92 12 Q90 19 93 22" stroke={body} strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function BigButterfly({ wing = "#FF9EBC", accent = "#FFD6E8" }: { wing?: string; accent?: string }) {
  return (
    <svg viewBox="0 0 110 90" width="100%" height="100%">
      {/* upper wings */}
      <path d="M52 46 Q18 6 8 22 Q2 36 24 48 Q38 54 52 48 Z" fill={wing} opacity="0.9" />
      <path d="M58 46 Q92 6 102 22 Q108 36 86 48 Q72 54 58 48 Z" fill={wing} opacity="0.9" />
      {/* lower wings */}
      <path d="M52 50 Q28 74 16 66 Q10 58 30 50 Q42 46 52 50 Z" fill={accent} opacity="0.9" />
      <path d="M58 50 Q82 74 94 66 Q100 58 80 50 Q68 46 58 50 Z" fill={accent} opacity="0.9" />
      {/* wing spots */}
      <circle cx="28" cy="28" r="5" fill="white" opacity="0.65" />
      <circle cx="82" cy="28" r="5" fill="white" opacity="0.65" />
      <circle cx="32" cy="58" r="3" fill="white" opacity="0.5" />
      <circle cx="78" cy="58" r="3" fill="white" opacity="0.5" />
      {/* body */}
      <ellipse cx="55" cy="48" rx="4.5" ry="16" fill="#6B5B7B" opacity="0.8" />
      <circle cx="55" cy="32" r="4.5" fill="#6B5B7B" opacity="0.85" />
      {/* antennae */}
      <path d="M52 28 Q46 18 40 15 M58 28 Q64 18 70 15" stroke="#6B5B7B" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
      <circle cx="40" cy="15" r="2" fill="#6B5B7B" opacity="0.7" />
      <circle cx="70" cy="15" r="2" fill="#6B5B7B" opacity="0.7" />
    </svg>
  );
}

/** Tiny distant bird — simple glide silhouette */
function DistantBird({ color = "#A882E8" }: { color?: string }) {
  return (
    <svg viewBox="0 0 30 12" width="100%" height="100%">
      <path d="M2 8 Q8 0 15 7 Q22 0 28 8" stroke={color} strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

/** Drifting dandelion seed */
function Seed() {
  return (
    <svg viewBox="0 0 20 26" width="100%" height="100%">
      <line x1="10" y1="10" x2="10" y2="24" stroke="#B8AED0" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
      {[0, 30, 60, 90, 120, 150, 180].map((deg) => (
        <line
          key={deg}
          x1="10" y1="10"
          x2={10 + Math.cos(((deg - 90) * Math.PI) / 180) * 8}
          y2={10 + Math.sin(((deg - 90) * Math.PI) / 180) * 8}
          stroke="#CFC6E4" strokeWidth="1.1" strokeLinecap="round" opacity="0.8"
        />
      ))}
    </svg>
  );
}

/** Soft distant bush/hill puff */
function Bush({ color = "#A8DFB8" }: { color?: string }) {
  return (
    <svg viewBox="0 0 80 40" width="100%" height="100%">
      <ellipse cx="24" cy="30" rx="24" ry="14" fill={color} opacity="0.55" />
      <ellipse cx="52" cy="28" rx="28" ry="17" fill={color} opacity="0.45" />
    </svg>
  );
}

// ── Scene layout ─────────────────────────────────────────────────────────────
// All positions keep a clear central column (roughly x 22%–78%) for the UI.

interface EnvItem {
  el: React.ReactNode;
  /** Anchor from the left edge... */
  x?: string;
  /** ...or from the right edge (used for right-side creatures so they can
   *  never overflow the viewport on narrow screens) */
  r?: string;
  y: string;
  /** viewport-relative size via clamp so it scales phone → 1440px+ */
  w: string;
  anim: { x?: number[]; y?: number[]; rotate?: number[] };
  duration: number;
  delay?: number;
  z?: number;
}

const ITEMS: EnvItem[] = [
  // ── Distant layer (small, upper background) ──
  { el: <DistantBird color="#A882E8" />, x: "30%", y: "3.5%", w: "clamp(18px, 2vw, 30px)", anim: { x: [0, 26, 0], y: [0, -5, 0] }, duration: 13, delay: 1 },
  { el: <DistantBird color="#74B9FF" />, r: "34%", y: "5.5%", w: "clamp(15px, 1.7vw, 26px)", anim: { x: [0, -20, 0], y: [0, -4, 0] }, duration: 15, delay: 4 },
  { el: <Seed />, x: "20%", y: "30%", w: "clamp(12px, 1.4vw, 20px)", anim: { x: [0, 14, 4, 0], y: [0, 18, 34, 46], rotate: [0, 18, -12, 8] }, duration: 12, delay: 2 },
  { el: <Seed />, r: "17%", y: "38%", w: "clamp(11px, 1.3vw, 18px)", anim: { x: [0, -12, -2, 0], y: [0, 16, 30, 42], rotate: [0, -14, 10, -6] }, duration: 14, delay: 6 },
  { el: <Bush color="#A8DFB8" />, x: "1%", y: "86%", w: "clamp(64px, 9vw, 150px)", anim: {}, duration: 0, z: 0 },
  { el: <Bush color="#B9D8F0" />, r: "1%", y: "87%", w: "clamp(56px, 8vw, 130px)", anim: {}, duration: 0, z: 0 },

  // ── Mid layer butterflies (edges) ──
  { el: <BigButterfly wing="#A882E8" accent="#DDD5F5" />, r: "3%", y: "16%", w: "clamp(40px, 5vw, 84px)", anim: { x: [0, -14, 0], y: [0, -12, 0], rotate: [-3, 4, -3] }, duration: 8, delay: 1.6 },
  { el: <BigButterfly wing="#74B9FF" accent="#D4EEFF" />, x: "5%", y: "48%", w: "clamp(36px, 4.4vw, 74px)", anim: { x: [0, 12, 0], y: [0, -14, 0], rotate: [3, -4, 3] }, duration: 9, delay: 3.2 },
  { el: <BigButterfly wing="#FFD93D" accent="#FFF0B3" />, r: "2%", y: "56%", w: "clamp(32px, 4vw, 66px)", anim: { x: [0, -10, 0], y: [0, -11, 0], rotate: [-4, 3, -4] }, duration: 7.5, delay: 0.8 },

  // ── Close layer (largest, lower corners) ──
  { el: <BigButterfly wing="#FF9EBC" accent="#FFD6E8" />, x: "3%", y: "12%", w: "clamp(52px, 6.5vw, 110px)", anim: { x: [0, 16, 0], y: [0, -14, 0], rotate: [-4, 4, -4] }, duration: 8.5, z: 2 },
  { el: <BigBird body="#74B9FF" belly="#EAF6FF" />, x: "2%", y: "70%", w: "clamp(64px, 8.5vw, 140px)", anim: { y: [0, -8, 0], rotate: [0, 1.5, 0] }, duration: 6.5, delay: 0.5, z: 2 },
  { el: <BigBird body="#FF9EBC" belly="#FFEDF4" flip />, r: "2%", y: "72%", w: "clamp(56px, 7.5vw, 122px)", anim: { y: [0, -7, 0], rotate: [0, -1.5, 0] }, duration: 7.5, delay: 2.2, z: 2 },
  { el: <BigBird body="#8FD6A8" belly="#EAFBEF" />, r: "1.5%", y: "30%", w: "clamp(44px, 5.5vw, 92px)", anim: { x: [0, -10, 0], y: [0, -9, 0] }, duration: 9.5, delay: 3.8, z: 1 },
];

export function HomeEnvironment() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {ITEMS.map((item, i) => (
        <motion.div
          key={i}
          className="pl-pos absolute"
          style={cssVars({
            ...(item.x !== undefined && { "--pl-left": item.x }),
            ...(item.r !== undefined && { "--pl-right": item.r }),
            "--pl-top": item.y,
            "--pl-w": item.w,
            "--pl-z": item.z ?? 1,
          } as Record<PlayLabCssVar, string | number>)}
          animate={
            item.duration > 0
              ? {
                  x: item.anim.x ?? 0,
                  y: item.anim.y ?? [0, -6, 0],
                  rotate: item.anim.rotate ?? 0,
                }
              : undefined
          }
          transition={
            item.duration > 0
              ? { duration: item.duration, delay: item.delay ?? 0, repeat: Infinity, ease: "easeInOut" }
              : undefined
          }
        >
          {item.el}
        </motion.div>
      ))}
    </div>
  );
}
