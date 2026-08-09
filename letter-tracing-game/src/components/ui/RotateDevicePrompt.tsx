"use client";

import { motion } from "framer-motion";

/**
 * A small, friendly, NON-BLOCKING suggestion to try landscape.
 *
 * Portrait play is fully allowed — this is just a gentle floating pill at the
 * top of the screen. Visibility is pure CSS (globals.css → .rotate-prompt):
 * it only appears on portrait phone-sized viewports and disappears the moment
 * the device rotates. Tablets and desktops never see it. It never blocks
 * touches (pointer-events: none) and never covers the play area meaningfully.
 */
export function RotateDevicePrompt() {
  return (
    <div
      className="rotate-prompt pointer-events-none absolute inset-x-0 top-2 z-40 justify-center"
      role="status"
      aria-label="Tip: turning your phone sideways gives a bigger play area"
    >
      <motion.div
        className="flex items-center gap-2 rounded-full bg-white/85 px-3.5 py-1.5 shadow-soft backdrop-blur-sm"
        initial={{ y: -14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Small rotating-phone icon */}
        <motion.svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          animate={{ rotate: [0, 0, 90, 90, 0] }}
          transition={{ duration: 3.4, times: [0, 0.2, 0.45, 0.8, 1], repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="8" y="3" width="8" height="18" rx="2.5" fill="white" stroke="#A882E8" strokeWidth="1.8" />
          <rect x="9.5" y="5.5" width="5" height="11" rx="1" fill="#DDD5F5" />
          <circle cx="12" cy="18.6" r="0.9" fill="#C4B5F5" />
        </motion.svg>
        <span className="font-rounded text-xs font-bold text-plum/80">
          Tip: turn sideways for a bigger board!
        </span>
      </motion.div>
    </div>
  );
}
