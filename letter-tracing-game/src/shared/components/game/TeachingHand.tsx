"use client";

import { motion } from "framer-motion";

interface TeachingHandProps {
  /** Where the drag starts — the centre of the thing to pick up. */
  fx: number;
  fy: number;
  /** Where the drag ends — the centre of the target it belongs in. */
  tx: number;
  ty: number;
}

/**
 * The ghost teaching hand: presses on a piece, glides it to its target,
 * releases, fades, and loops — until the child touches anything.
 *
 * Instructions in this product are visual first, because a 3-year-old who
 * cannot read still has to be able to start playing unaided. This is that
 * instruction. It is purely decorative (pointer-events-none, aria-hidden):
 * screen-reader users get the spoken clip and the per-piece aria-labels
 * instead, so nothing here is load-bearing for accessibility.
 *
 * Coordinates are relative to the positioned ancestor the hand is mounted
 * in — measure them against the same root the game's drag engine uses, so
 * the hand and the real drag agree on where things are.
 */
export function TeachingHand({ fx, fy, tx, ty }: TeachingHandProps) {
  return (
    <motion.div
      className="pointer-events-none absolute left-0 top-0 z-30"
      initial={{ x: fx, y: fy, opacity: 0, scale: 1 }}
      animate={{
        x: [fx, fx, tx, tx, tx],
        y: [fy, fy, ty, ty, ty],
        opacity: [0, 1, 1, 1, 0],
        scale: [1, 0.85, 0.85, 1.05, 1],
      }}
      transition={{
        duration: 2.8,
        times: [0, 0.18, 0.72, 0.85, 1],
        repeat: Infinity,
        repeatDelay: 1.1,
        ease: "easeInOut",
      }}
      aria-hidden="true"
    >
      {/* soft touch ripple under the fingertip */}
      <div className="pl-hand-halo absolute" />
      {/* the hand, fingertip anchored at (0,0) */}
      <svg width="44" height="48" viewBox="0 0 44 48" className="pl-hand">
        <path
          d="M13 4 Q13 0 16.5 0 Q20 0 20 4 L20 18 Q22 16 25 17 Q28 18 28 21 Q30 19.5 33 21 Q35.5 22.3 35 25 Q38 24.5 39 27 Q40.5 31 38 36 Q35 43 27 45 Q17 47 12 40 Q8 34 7 27 Q6.4 22 10 21.5 Q12 21.3 13 23 Z"
          fill="#FFDFC4"
          stroke="#E8B48E"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M13 23 L13 4" stroke="#E8B48E" strokeWidth="1.2" opacity="0.5" />
      </svg>
    </motion.div>
  );
}
