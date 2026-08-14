"use client";

import { motion } from "framer-motion";

/**
 * The kitchen — matched to the reference: warm yellow paneled wall, a
 * window with light, hanging shelf, extractor hood, fridge silhouette, and
 * a wooden countertop across the bottom that everything sits on. All of it
 * STATIC decoration (pointer-events none, aria-hidden) except one gentle
 * steam wisp rising from the stove — the kitchen's single ambient motion,
 * mirroring the bubbles-only rule in the ocean game.
 */

export function KitchenBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* warm wall */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #FBE7A2 0%, #F7D97E 70%, #F2CD62 100%)" }} />
      {/* wall paneling lines */}
      <svg viewBox="0 0 420 100" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-full w-full opacity-25">
        {Array.from({ length: 13 }).map((_, i) => (
          <line key={i} x1={i * 34} y1="0" x2={i * 34} y2="100" stroke="#E3B94E" strokeWidth="1.4" />
        ))}
      </svg>

      {/* fixtures layer — true proportions, height-capped, centered (same
          two-layer approach as the ocean backdrop so nothing crops) */}
      <svg
        viewBox="0 0 420 150"
        preserveAspectRatio="xMidYMax meet"
        className="absolute left-1/2 -translate-x-1/2"
        style={{ bottom: "clamp(40px, 9vh, 84px)", width: "min(100%, 1100px)", height: "clamp(90px, 22vh, 170px)", opacity: 0.9 }}
      >
        {/* fridge (left) */}
        <rect x="14" y="18" width="52" height="126" rx="8" fill="#CBE6F2" />
        <rect x="14" y="18" width="52" height="44" rx="8" fill="#D9EEF7" />
        <rect x="56" y="30" width="4" height="18" rx="2" fill="#A5C6D6" />
        <rect x="56" y="72" width="4" height="26" rx="2" fill="#A5C6D6" />
        {/* stove + extractor hood */}
        <path d="M96 0 L136 0 L146 44 L86 44 Z" fill="#B9D2E3" />
        <rect x="88" y="44" width="56" height="8" rx="3" fill="#9FBFD4" />
        <rect x="86" y="96" width="60" height="48" rx="6" fill="#F4F1EA" />
        <rect x="92" y="104" width="48" height="26" rx="4" fill="#F2B84D" opacity="0.85" />
        <circle cx="96" cy="90" r="4" fill="#5C5C6E" />
        <circle cx="112" cy="90" r="4" fill="#5C5C6E" />
        <circle cx="128" cy="90" r="4" fill="#5C5C6E" />
        {/* hanging utensils */}
        <line x1="158" y1="46" x2="158" y2="60" stroke="#8B6547" strokeWidth="2.5" />
        <ellipse cx="158" cy="64" rx="5" ry="7" fill="#A5B2BE" />
        <line x1="172" y1="46" x2="172" y2="58" stroke="#8B6547" strokeWidth="2.5" />
        <rect x="168" y="58" width="8" height="12" rx="3" fill="#C97B4A" />
        {/* window (center-right) with soft light */}
        <rect x="216" y="10" width="74" height="86" rx="8" fill="white" />
        <rect x="222" y="16" width="62" height="74" rx="5" fill="#D6EDF7" />
        <line x1="253" y1="16" x2="253" y2="90" stroke="white" strokeWidth="5" />
        <line x1="222" y1="52" x2="284" y2="52" stroke="white" strokeWidth="5" />
        {/* hanging shelf (right) with jars and plant */}
        <rect x="316" y="28" width="86" height="8" rx="3" fill="#C97B4A" />
        <rect x="324" y="8" width="14" height="20" rx="3" fill="#C9A9F5" />
        <rect x="344" y="12" width="12" height="16" rx="3" fill="#8FD6A8" />
        <circle cx="374" cy="16" r="9" fill="#5DBE8A" />
        <rect x="369" y="22" width="10" height="8" rx="2" fill="#C97B4A" />
        {/* counter jars */}
        <rect x="332" y="112" width="18" height="32" rx="5" fill="#FFC2D9" />
        <rect x="356" y="104" width="16" height="40" rx="5" fill="#C9E8F5" />
      </svg>

      {/* the one ambient motion: a soft steam wisp above the stove */}
      <motion.div
        className="absolute rounded-full"
        style={{ left: "24%", bottom: "34%", width: 14, height: 14, background: "rgba(255,255,255,0.45)", filter: "blur(3px)" }}
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: -46, opacity: [0, 0.7, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeOut" }}
      />

      {/* wooden countertop */}
      <svg viewBox="0 0 420 60" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full" style={{ height: "clamp(48px, 10vh, 92px)" }}>
        <rect x="0" y="0" width="420" height="12" rx="4" fill="#C97B4A" />
        <rect x="0" y="10" width="420" height="50" fill="#B4693E" />
        <path d="M0 26 Q105 20 210 26 Q315 32 420 25" stroke="#9E5A33" strokeWidth="2.5" fill="none" opacity="0.6" />
        <path d="M0 42 Q140 37 280 42 Q360 45 420 41" stroke="#9E5A33" strokeWidth="2" fill="none" opacity="0.45" />
      </svg>
    </div>
  );
}
