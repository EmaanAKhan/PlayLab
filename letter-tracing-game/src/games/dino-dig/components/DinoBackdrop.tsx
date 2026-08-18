"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * The prehistoric night world every Dino Dig screen sits in: deep navy sky,
 * a volcano silhouette on the horizon, distant ridges, ferns and a dirt floor.
 *
 * Entirely decorative — pointer-events-none and aria-hidden throughout, per the
 * project's rule for background layers. The drifting embers honour
 * prefers-reduced-motion (Framer tweens are JS-driven, so the CSS-level
 * reduced-motion rule in base.css cannot reach them).
 */
export function DinoBackdrop() {
  const reduce = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* sky wash */}
      <div className="dd-sky absolute inset-0" />

      {/* stars */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        {[
          [30, 34, 1.6], [78, 18, 1.1], [128, 46, 1.4], [186, 24, 1.2],
          [244, 40, 1.6], [300, 20, 1.1], [352, 44, 1.4], [58, 72, 1.1],
          [212, 68, 1.2], [330, 78, 1.3], [154, 88, 1],  [268, 96, 1.1],
        ].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="#CFE3FF" opacity={0.5 + (i % 3) * 0.15} />
        ))}

        {/* far ridge */}
        <path d="M0 196 L54 158 L96 186 L150 146 L206 190 L250 164 L300 196 L352 168 L400 198 L400 300 L0 300 Z" fill="#14295A" />

        {/* the volcano */}
        <path d="M198 200 L252 108 L306 200 Z" fill="#0F2048" />
        <path d="M252 108 L306 200 L268 200 Z" fill="#0B1836" />
        {/* crater glow + lava lip */}
        <path d="M236 130 L252 108 L268 130 Q252 140 236 130 Z" fill="#FF5A2B" opacity="0.9" />
        <path d="M243 122 q9 8 18 0 q-4 12 -9 12 q-5 0 -9 -12 Z" fill="#FF7F00" />

        {/* near ridge */}
        <path d="M0 214 L48 186 L104 212 L158 184 L214 214 L272 190 L330 216 L400 188 L400 300 L0 300 Z" fill="#0A1A3A" />

        {/* dirt floor */}
        <path d="M0 244 Q100 232 200 244 Q300 256 400 242 L400 300 L0 300 Z" fill="#4A2C17" />
        <path d="M0 252 Q100 242 200 252 Q300 262 400 250 L400 300 L0 300 Z" fill="#3A2211" />

        {/* ferns */}
        {[
          [26, 240, 1], [72, 246, 0.8], [340, 242, 0.9], [378, 248, 0.7], [128, 250, 0.6],
        ].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <path d="M0 0 L0 -22" stroke="#1F7A4C" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M0 -8 q-11 -5 -14 -14 q10 1 14 8 Z" fill="#2E9E63" />
            <path d="M0 -8 q11 -5 14 -14 q-10 1 -14 8 Z" fill="#2E9E63" />
            <path d="M0 -18 q-8 -4 -10 -11 q7 1 10 6 Z" fill="#3FBE79" />
            <path d="M0 -18 q8 -4 10 -11 q-7 1 -10 6 Z" fill="#3FBE79" />
          </g>
        ))}

        {/* a few buried fossil bones in the dirt */}
        <g opacity="0.28" fill="#DCE5F0">
          <ellipse cx="176" cy="272" rx="16" ry="4.5" transform="rotate(-8 176 272)" />
          <ellipse cx="318" cy="282" rx="13" ry="4" transform="rotate(12 318 282)" />
          <ellipse cx="58" cy="278" rx="11" ry="3.6" transform="rotate(-15 58 278)" />
        </g>
      </svg>

      {/* embers drifting up from the crater */}
      {!reduce &&
        [0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className="dd-ember absolute"
            style={{ left: `${58 + i * 3}%`, top: "38%" }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: [-4, -70], opacity: [0, 0.85, 0] }}
            transition={{
              duration: 3.6 + i * 0.7,
              repeat: Infinity,
              delay: i * 1.1,
              ease: "easeOut",
            }}
          />
        ))}
    </div>
  );
}
