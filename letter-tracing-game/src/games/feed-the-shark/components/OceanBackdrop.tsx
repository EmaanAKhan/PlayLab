"use client";

import { motion } from "framer-motion";

/**
 * The underwater world. Everything here is STATIC decoration — coral, sea
 * urchins, rocks, shells, a small shipwreck, and the focal open shell with
 * pearls — per the game's animation rule: the ONLY continuous environment
 * motion is the gentle upward bubble stream. Decorative only:
 * pointer-events none, aria-hidden.
 */

function Coral({ x, color }: { x: number; color: string }) {
  return (
    <g transform={`translate(${x}, 0)`}>
      <path d="M0 60 Q-2 34 -10 24 M0 60 Q2 30 10 16 M0 60 Q8 40 20 34 M0 60 Q-8 44 -20 40"
        stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
      <circle cx="-10" cy="22" r="4.5" fill={color} />
      <circle cx="10" cy="14" r="4.5" fill={color} />
      <circle cx="20" cy="32" r="4" fill={color} />
      <circle cx="-20" cy="38" r="4" fill={color} />
    </g>
  );
}

function Urchin({ x, y, r, color }: { x: number; y: number; r: number; color: string }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * Math.PI) / 6;
        // toFixed: full-precision floats serialize with a different last
        // digit on server vs client → React hydration mismatch. Two
        // decimals is identical on both sides (and plenty for SVG).
        const f = (n: number) => Number(n.toFixed(2));
        return (
          <line key={i} x1={f(Math.cos(a) * r * 0.5)} y1={f(Math.sin(a) * r * 0.5)}
            x2={f(Math.cos(a) * r * 1.35)} y2={f(Math.sin(a) * r * 1.35)}
            stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        );
      })}
      <circle cx="0" cy="0" r={r * 0.72} fill={color} />
      <circle cx={-r * 0.2} cy={-r * 0.2} r={r * 0.18} fill="white" opacity="0.35" />
    </g>
  );
}

function Shell({ x, y, s, color }: { x: number; y: number; s: number; color: string }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`}>
      <path d="M-12 6 Q0 -16 12 6 Q0 12 -12 6 Z" fill={color} />
      <path d="M0 -10 L0 6 M-6 -6 L-3 6 M6 -6 L3 6" stroke="white" strokeWidth="1.4" opacity="0.5" strokeLinecap="round" />
    </g>
  );
}

/** The focal point: a large open seashell holding pearls */
function PearlShell({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* back half (open lid) */}
      <path d="M-34 0 Q0 -52 34 0 Q18 -8 0 -8 Q-18 -8 -34 0 Z" fill="#FFD6E8" />
      <path d="M0 -46 L0 -8 M-16 -38 L-8 -9 M16 -38 L8 -9 M-27 -22 L-15 -9 M27 -22 L15 -9"
        stroke="#E8A9C8" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      {/* pearls */}
      <circle cx="-11" cy="-4" r="8" fill="#FDF6FF" />
      <circle cx="-13.5" cy="-6.5" r="2.6" fill="white" />
      <circle cx="9" cy="-3" r="10" fill="#F4EAFB" />
      <circle cx="6" cy="-6.5" r="3.2" fill="white" />
      {/* front half */}
      <path d="M-34 0 Q0 26 34 0 Q18 14 0 14 Q-18 14 -34 0 Z" fill="#FFC2D9" />
      <path d="M-24 6 Q0 18 24 6" stroke="#E8A9C8" strokeWidth="2" fill="none" opacity="0.6" />
    </g>
  );
}

function Shipwreck({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`} opacity="0.85">
      {/* tilted hull */}
      <g transform="rotate(-7)">
        <path d="M-46 0 Q-40 22 0 24 Q40 22 46 0 L34 0 L34 -6 L-34 -6 L-34 0 Z" fill="#A0785A" />
        <path d="M-34 -6 L34 -6 L34 0 L-34 0 Z" fill="#8B6547" />
        <circle cx="-16" cy="8" r="4" fill="#6B4A32" />
        <circle cx="6" cy="9" r="4" fill="#6B4A32" />
        {/* broken mast + tattered flag */}
        <rect x="-3" y="-42" width="5" height="38" rx="2" fill="#8B6547" />
        <path d="M2 -40 L26 -34 L2 -28 Z" fill="#D4EEFF" opacity="0.9" />
      </g>
    </g>
  );
}

/** Slow, continuous stream of small bubbles drifting upward — the one
 *  permitted continuous animation. Gentle linear rise, subtle sway, long
 *  staggered loops so it reads as ambient life, never as motion noise. */
export function BubbleStream() {
  const bubbles = [
    { x: "8%", size: 10, dur: 13, delay: 0 },
    { x: "16%", size: 6, dur: 17, delay: 4 },
    { x: "28%", size: 8, dur: 15, delay: 8 },
    { x: "43%", size: 5, dur: 18, delay: 2 },
    { x: "55%", size: 9, dur: 14, delay: 10 },
    { x: "67%", size: 6, dur: 16, delay: 6 },
    { x: "79%", size: 11, dur: 13, delay: 3 },
    { x: "90%", size: 7, dur: 17, delay: 12 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {bubbles.map((b, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: b.x,
            width: b.size,
            height: b.size,
            background: "rgba(255,255,255,0.5)",
            boxShadow: "inset -1px -1px 0 rgba(255,255,255,0.8)",
          }}
          initial={{ top: "105%" }}
          animate={{ top: "-6%", x: [0, 6, -4, 0] }}
          transition={{
            top: { duration: b.dur, delay: b.delay, repeat: Infinity, ease: "linear" },
            x: { duration: b.dur / 2, delay: b.delay, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      ))}
    </div>
  );
}

/** Full static seabed scene — anchored to the bottom of the screen.
 *
 * TWO layers, because one SVG can't survive every viewport shape:
 *  - the SAND strip stretches edge-to-edge (preserveAspectRatio="none" —
 *    wavy sand distorts gracefully), so the floor is never missing at the
 *    sides of ultra-wide windows;
 *  - the DECORATIONS keep their true proportions ("meet"), sized by
 *    viewport height with a hard cap, centered on the sand — so on short
 *    or very wide windows they scale DOWN and stay fully visible instead
 *    of blowing up and getting cropped in half. */
export function OceanBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* soft light rays from the surface */}
      <div
        className="absolute inset-x-0 top-0 h-1/2"
        style={{
          background:
            "linear-gradient(175deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 45%)",
        }}
      />

      {/* Layer 1 — sand, stretched to any width */}
      <svg
        viewBox="0 0 420 60"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full"
        style={{ height: "clamp(44px, 8vh, 76px)" }}
      >
        <path d="M0 14 Q105 2 210 12 Q315 20 420 8 L420 60 L0 60 Z" fill="#F2E3BC" />
        <path d="M0 30 Q140 22 280 30 Q360 34 420 28 L420 60 L0 60 Z" fill="#E8D5A5" opacity="0.8" />
      </svg>

      {/* Layer 2 — decorations, true proportions, height-capped, centered */}
      <svg
        viewBox="0 0 420 110"
        preserveAspectRatio="xMidYMax meet"
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: "clamp(6px, 1.5vh, 16px)",
          width: "min(100%, 1100px)",
          height: "clamp(64px, 15vh, 120px)",
        }}
      >
        {/* rocks */}
        <ellipse cx="60" cy="86" rx="24" ry="13" fill="#B9C4CE" />
        <ellipse cx="82" cy="90" rx="14" ry="9" fill="#A5B2BE" />
        <ellipse cx="342" cy="88" rx="20" ry="11" fill="#B9C4CE" />
        {/* shipwreck (left of center, resting on the sand) */}
        <Shipwreck x={130} y={66} />
        {/* coral + sea plants */}
        <g transform="translate(0, 32)">
          <Coral x={30} color="#FF9EBC" />
          <Coral x={392} color="#F2913D" />
          <Coral x={230} color="#C9A9F5" />
        </g>
        {/* sea urchins — spread edge to edge so the seabed fills the width */}
        <Urchin x={14} y={95} r={7} color="#4A5FA5" />
        <Urchin x={52} y={101} r={5} color="#E85D9E" />
        <Urchin x={182} y={92} r={8} color="#7C4DBE" />
        <Urchin x={310} y={96} r={6} color="#4A5FA5" />
        <Urchin x={368} y={102} r={5} color="#7C4DBE" />
        <Urchin x={405} y={94} r={7} color="#E85D9E" />
        {/* small shells */}
        <Shell x={104} y={100} s={1} color="#FFC2D9" />
        <Shell x={262} y={102} s={0.85} color="#FFE3A9" />
        <Shell x={382} y={100} s={0.9} color="#C9E8F5" />
        {/* THE focal treasure: open shell with pearls, right of center */}
        <PearlShell x={295} y={76} />
        {/* seagrass */}
        <path d="M12 98 Q8 74 14 58 M20 100 Q22 76 16 62 M404 96 Q408 72 400 58"
          stroke="#5DBE8A" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.75" />
      </svg>
    </div>
  );
}
