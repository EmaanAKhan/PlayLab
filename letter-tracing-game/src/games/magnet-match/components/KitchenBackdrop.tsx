"use client";

import { motion } from "framer-motion";

/**
 * The kitchen STAGE — a full-screen, straight-on cartoon kitchen the whole
 * game lives inside (per the reference): tiled backsplash, cabinets and
 * shelves with plates/jars, a window with daylight, a clock, hanging
 * utensils, a stove with a softly flickering flame and rising steam, a
 * fridge, and a front-facing counter with doors/drawers running across the
 * bottom. Camera is a child standing in front of the counter — nothing
 * top-down or isometric. Decoration only: pointer-events none, aria-hidden.
 * Ambient motion is limited to the flame flicker + one steam wisp.
 */
export function KitchenBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* back wall */}
      <div className="mm-wall absolute inset-0" />
      {/* tiled backsplash band across the lower wall */}
      <svg viewBox="0 0 420 70" preserveAspectRatio="none" className="mm-backsplash absolute inset-x-0 w-full">
        <rect width="420" height="70" fill="#FDF3D0" />
        {Array.from({ length: 21 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 21} y1="0" x2={i * 21} y2="70" stroke="#EBD9A0" strokeWidth="1.6" />
        ))}
        <line x1="0" y1="23" x2="420" y2="23" stroke="#EBD9A0" strokeWidth="1.6" />
        <line x1="0" y1="46" x2="420" y2="46" stroke="#EBD9A0" strokeWidth="1.6" />
      </svg>

      {/* wall fixtures — true proportions, height-capped, centered */}
      <svg
        viewBox="0 0 420 170"
        preserveAspectRatio="xMidYMax meet"
        className="mm-fixtures absolute left-1/2 -translate-x-1/2"
      >
        {/* fridge (far left) */}
        <rect x="8" y="34" width="54" height="136" rx="8" fill="#CBE6F2" />
        <rect x="8" y="34" width="54" height="46" rx="8" fill="#D9EEF7" />
        <rect x="52" y="46" width="4" height="18" rx="2" fill="#A5C6D6" />
        <rect x="52" y="92" width="4" height="26" rx="2" fill="#A5C6D6" />
        {/* upper cabinet (left of stove) */}
        <rect x="72" y="6" width="60" height="52" rx="6" fill="#EFC981" />
        <rect x="76" y="10" width="24" height="44" rx="4" fill="#F7DA9E" />
        <rect x="102" y="10" width="24" height="44" rx="4" fill="#F7DA9E" />
        <circle cx="97" cy="32" r="2.2" fill="#B4874A" />
        <circle cx="107" cy="32" r="2.2" fill="#B4874A" />
        {/* stove: hood, burners, oven with warm glow + flame */}
        <path d="M146 0 L186 0 L196 40 L136 40 Z" fill="#B9D2E3" />
        <rect x="138" y="40" width="56" height="7" rx="3" fill="#9FBFD4" />
        <rect x="136" y="108" width="60" height="62" rx="6" fill="#F4F1EA" />
        <rect x="142" y="118" width="48" height="30" rx="4" fill="#F2B84D" opacity="0.85" />
        <rect x="136" y="98" width="60" height="10" rx="3" fill="#5C5C6E" />
        <circle cx="148" cy="103" r="3.4" fill="#3B3B4F" />
        <circle cx="166" cy="103" r="3.4" fill="#3B3B4F" />
        <circle cx="184" cy="103" r="3.4" fill="#3B3B4F" />
        {/* small pot ON the stove (front view) */}
        <rect x="152" y="82" width="30" height="16" rx="4" fill="#8C99A6" />
        <rect x="149" y="80" width="36" height="5" rx="2.5" fill="#77828E" />
        {/* hanging utensils */}
        <line x1="210" y1="30" x2="210" y2="46" stroke="#8B6547" strokeWidth="2.5" />
        <ellipse cx="210" cy="51" rx="5" ry="7" fill="#A5B2BE" />
        <line x1="224" y1="30" x2="224" y2="44" stroke="#8B6547" strokeWidth="2.5" />
        <rect x="220" y="44" width="8" height="13" rx="3" fill="#C97B4A" />
        <line x1="238" y1="30" x2="238" y2="45" stroke="#8B6547" strokeWidth="2.5" />
        <path d="M234 45 h8 l-1.5 11 h-5 Z" fill="#A5B2BE" />
        {/* window with daylight + sill plant */}
        <rect x="256" y="8" width="78" height="92" rx="8" fill="white" />
        <rect x="262" y="14" width="66" height="80" rx="5" fill="#D6EDF7" />
        <path d="M262 14 L328 94 M328 14 L262 94" stroke="white" strokeWidth="0" />
        <line x1="295" y1="14" x2="295" y2="94" stroke="white" strokeWidth="5" />
        <line x1="262" y1="54" x2="328" y2="54" stroke="white" strokeWidth="5" />
        <circle cx="272" cy="100" r="7" fill="#5DBE8A" />
        <rect x="267" y="104" width="10" height="8" rx="2" fill="#C97B4A" />
        {/* clock */}
        <circle cx="352" cy="22" r="13" fill="white" stroke="#C97B4A" strokeWidth="3" />
        <line x1="352" y1="22" x2="352" y2="14" stroke="#8A5A2E" strokeWidth="2.4" strokeLinecap="round" />
        <line x1="352" y1="22" x2="358" y2="24" stroke="#8A5A2E" strokeWidth="2.4" strokeLinecap="round" />
        {/* shelf with stacked plates + jars + veg */}
        <rect x="336" y="52" width="78" height="7" rx="3" fill="#C97B4A" />
        <ellipse cx="352" cy="49" rx="13" ry="3.5" fill="#E8ECF2" />
        <ellipse cx="352" cy="45" rx="13" ry="3.5" fill="#F4F6FA" />
        <ellipse cx="352" cy="41" rx="13" ry="3.5" fill="#E8ECF2" />
        <rect x="372" y="32" width="14" height="20" rx="3" fill="#C9A9F5" />
        <rect x="390" y="36" width="12" height="16" rx="3" fill="#8FD6A8" />
        {/* lower shelf: jars + carrot + tomato */}
        <rect x="336" y="96" width="78" height="7" rx="3" fill="#C97B4A" />
        <rect x="342" y="72" width="16" height="24" rx="4" fill="#FFC2D9" />
        <rect x="362" y="76" width="14" height="20" rx="4" fill="#C9E8F5" />
        <path d="M386 92 l6 -16 l6 16 Z" fill="#E8863D" />
        <circle cx="404" cy="88" r="7" fill="#E85D5D" />
        <path d="M402 82 q2 -4 5 -3" stroke="#5DBE8A" strokeWidth="2" fill="none" />
      </svg>

      {/* stove flame — soft flicker (ambient motion #1) */}
      <motion.div
        className="mm-flame absolute rounded-full"
        animate={{ scaleY: [1, 1.25, 0.9, 1.1, 1], opacity: [0.8, 1, 0.75, 0.95, 0.8] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* steam wisp above the stove pot (ambient motion #2) */}
      <motion.div
        className="mm-steam absolute rounded-full"
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: -42, opacity: [0, 0.7, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeOut" }}
      />

      {/* the COUNTER — front-facing: top edge, then doors/drawers/handles */}
      <svg viewBox="0 0 420 90" preserveAspectRatio="none" className="mm-counter absolute bottom-0 left-0 w-full">
        <rect x="0" y="0" width="420" height="12" rx="4" fill="#C97B4A" />
        <rect x="0" y="10" width="420" height="80" fill="#B4693E" />
        {/* cabinet doors */}
        {Array.from({ length: 5 }).map((_, i) => (
          <rect key={`d${i}`} x={12 + i * 84} y="20" width="64" height="62" rx="6" fill="#A05C34" stroke="#8F4F2B" strokeWidth="2" />
        ))}
        {/* drawer lines + handles */}
        {Array.from({ length: 5 }).map((_, i) => (
          <rect key={`h${i}`} x={36 + i * 84} y="46" width="16" height="5" rx="2.5" fill="#E3B94E" />
        ))}
      </svg>
    </div>
  );
}
