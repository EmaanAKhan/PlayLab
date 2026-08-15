"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { CelebrationSparkles } from "@shared/components/animations/Sparkles";
import { cssVars } from "@shared/styles/cssVars";
import type { ElementSize } from "@shared/hooks/useElementSize";

interface CelebrationOverlayProps {
  /** Translucent wash over the game, in that game's own colour. */
  tintClassName: string;
  /** Gap between the stacked celebration elements, e.g. "gap-3". */
  gapClassName?: string;
  /** Backdrop blur strength — 2px over busy scenes, 3px over calm ones. */
  blur?: string;
  /** Measured size of the game root, so the confetti spans the real play area. */
  size: ElementSize;
  children: ReactNode;
}

/**
 * The "you did it" wash that covers a game when a round or level is finished.
 *
 * All four match-and-find games faded in the same structure — tinted blurred
 * sheet, full-area confetti, centred stack of praise — and each had rebuilt it
 * by hand. The shell is shared; what goes inside stays each game's own, which
 * is why this takes children rather than a headline/subtitle prop pair.
 *
 * Mount it inside an <AnimatePresence> so the exit fade plays.
 */
export function CelebrationOverlay({
  tintClassName,
  gapClassName = "gap-3",
  blur = "2px",
  size,
  children,
}: CelebrationOverlayProps) {
  return (
    <motion.div
      className={`pl-overlay-blur absolute inset-0 z-30 flex flex-col items-center justify-center px-6 ${gapClassName} ${tintClassName}`}
      style={cssVars({ "--pl-blur": blur })}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <CelebrationSparkles active width={size.w} height={size.h} />
      </div>
      {children}
    </motion.div>
  );
}
