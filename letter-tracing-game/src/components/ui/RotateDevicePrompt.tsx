"use client";

import { motion } from "framer-motion";

/**
 * A very simple, child-friendly "turn your device sideways" prompt.
 *
 * Visibility is handled ENTIRELY in CSS (globals.css → .rotate-prompt):
 * it only appears on portrait phone-sized viewports, and disappears
 * automatically the moment the device is physically rotated to landscape.
 * Tablets and desktops never see it. No JavaScript orientation forcing.
 */
export function RotateDevicePrompt() {
  return (
    <div
      className="rotate-prompt absolute inset-0 z-50 flex-col items-center justify-center gap-8 px-8"
      style={{ background: "linear-gradient(160deg, #F0E8FF 0%, #E8F4FF 100%)" }}
      role="status"
      aria-label="Please turn your device sideways to play"
    >
      {/* Rotating phone illustration */}
      <motion.div
        animate={{ rotate: [0, 0, 90, 90, 0] }}
        transition={{ duration: 3.2, times: [0, 0.15, 0.45, 0.8, 1], repeat: Infinity, ease: "easeInOut" }}
        className="drop-shadow-lg"
      >
        <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
          {/* Phone body */}
          <rect x="28" y="12" width="32" height="64" rx="8" fill="white" stroke="#A882E8" strokeWidth="3.5" />
          {/* Screen */}
          <rect x="33" y="20" width="22" height="44" rx="3" fill="#DDD5F5" />
          {/* Happy face on screen */}
          <circle cx="40" cy="36" r="2" fill="#7C5CBF" />
          <circle cx="48" cy="36" r="2" fill="#7C5CBF" />
          <path d="M39 44 Q44 49 49 44" stroke="#7C5CBF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Home dot */}
          <circle cx="44" cy="70" r="2.5" fill="#C4B5F5" />
        </svg>
      </motion.div>

      {/* Curved arrow hint */}
      <motion.svg
        width="64"
        height="40"
        viewBox="0 0 64 40"
        fill="none"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M8 32 Q32 4 54 20"
          stroke="#A882E8"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M56 10 L56 22 L44 21" stroke="#A882E8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </motion.svg>

      <div className="text-center">
        <p className="font-rounded text-2xl font-black text-plum">Turn your phone sideways!</p>
        <p className="mt-2 font-rounded text-base font-semibold text-plum/60">
          The game is more fun in landscape
        </p>
      </div>
    </div>
  );
}
