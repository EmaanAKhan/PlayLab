"use client";

import { motion } from "framer-motion";

/**
 * The platform's collected-stars indicator — the same gold stars as the
 * tracing game's five-star mode, shared so every game's "N of M earned"
 * progress looks and animates identically: gold fill on earn, springy pop
 * on the star that just filled, golden burst ring behind it.
 */
export function StarRow({
  earned,
  total,
  size = 22,
}: {
  earned: number;
  total: number;
  /** Star width/height in px — 22 fits top-bar pills, 26 matches tracing */
  size?: number;
}) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`${earned} of ${total} stars earned`}>
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < earned;
        const justFilled = i === earned - 1;
        return (
          <motion.div
            key={i}
            className="relative"
            initial={false}
            animate={justFilled ? { scale: [1, 1.5, 1.05, 1.2, 1] } : { scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
              <path
                d="M12 1.5l2.9 6.8 7.4.6-5.6 4.9 1.7 7.2L12 17.1l-6.4 3.9 1.7-7.2-5.6-4.9 7.4-.6L12 1.5z"
                fill={filled ? "#FFD93D" : "#E7DFFA"}
                stroke={filled ? "#F4A73E" : "#D8CDF2"}
                strokeWidth="1"
              />
            </svg>
            {justFilled && (
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0.9, scale: 1 }}
                animate={{ opacity: 0, scale: 2.4 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                style={{
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(255,217,61,0.55), transparent 70%)",
                }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}