"use client";

import { motion } from "framer-motion";

/**
 * Penny — Letter Hunt's friendly pencil-pal character, drawn in the same
 * rounded pastel language as the rest of the portal (soft fills, blush
 * cheeks, simple shapes). One SVG, two poses via the `pointing` prop:
 * standing (arms relaxed) or pointing toward the notebook.
 */
export function PencilPal({ pointing = false, w = "100%" }: { pointing?: boolean; w?: string | number }) {
  return (
    <svg viewBox="0 0 120 190" width={w} className="block" aria-hidden="true">
      {/* eraser hat */}
      <path d="M38 26 Q38 8 60 8 Q82 8 82 26 L82 40 L38 40 Z" fill="#FF9EBC" />
      <rect x="36" y="38" width="48" height="10" rx="5" fill="#F2C94C" />
      {/* body */}
      <rect x="38" y="46" width="44" height="96" rx="10" fill="#FFD93D" />
      <rect x="46" y="46" width="12" height="96" fill="#FFE79C" opacity="0.8" />
      {/* face */}
      <circle cx="53" cy="86" r="4.5" fill="#3D3D5C" />
      <circle cx="72" cy="86" r="4.5" fill="#3D3D5C" />
      <circle cx="54.5" cy="84.5" r="1.4" fill="white" />
      <circle cx="73.5" cy="84.5" r="1.4" fill="white" />
      <circle cx="47" cy="96" r="4" fill="#FF9EBC" opacity="0.6" />
      <circle cx="78" cy="96" r="4" fill="#FF9EBC" opacity="0.6" />
      <path d="M55 100 Q62 107 70 100" stroke="#3D3D5C" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* wood + tip */}
      <path d="M38 142 L82 142 L60 174 Z" fill="#F0D6B8" />
      <path d="M52 154 L68 154 L60 174 Z" fill="#8A7BA8" />
      {/* legs */}
      <path d="M50 174 L50 184 M70 174 L70 184" stroke="#E8B33D" strokeWidth="7" strokeLinecap="round" />
      {/* left arm (relaxed wave) */}
      <path d="M38 108 Q24 104 20 92" stroke="#E8B33D" strokeWidth="8" fill="none" strokeLinecap="round" />
      <circle cx="19" cy="90" r="6" fill="#FFD93D" />
      {/* right arm — points when teaching */}
      {pointing ? (
        <g>
          <motion.g
            animate={{ rotate: [0, -6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="hunt-arm-origin"
          >
            <path d="M82 110 Q104 100 114 84" stroke="#E8B33D" strokeWidth="8" fill="none" strokeLinecap="round" />
            <circle cx="115" cy="82" r="6.5" fill="#FFD93D" />
          </motion.g>
        </g>
      ) : (
        <g>
          <path d="M82 108 Q96 104 100 92" stroke="#E8B33D" strokeWidth="8" fill="none" strokeLinecap="round" />
          <circle cx="101" cy="90" r="6" fill="#FFD93D" />
        </g>
      )}
    </svg>
  );
}

/** Spiral notebook page that holds the big target letter. */
export function Notebook({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="hunt-notebook flex items-center justify-center rounded-3xl shadow-card">
        {/* faint ruled lines */}
        <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
          {[0.3, 0.45, 0.6, 0.75].map((f) => (
            <line key={f} x1="12%" x2="88%" y1={`${f * 100}%`} y2={`${f * 100}%`} stroke="#EAF2FA" strokeWidth="2.5" />
          ))}
        </svg>
        <div className="relative z-10">{children}</div>
      </div>
      {/* spiral binding */}
      <div className="absolute -top-2 left-0 right-0 flex justify-center gap-3" aria-hidden="true">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="hunt-spiral-coil h-4 w-2 rounded-full" />
        ))}
      </div>
    </div>
  );
}
