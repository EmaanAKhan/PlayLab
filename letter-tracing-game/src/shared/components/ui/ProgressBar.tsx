"use client";

import { motion, type Transition } from "framer-motion";

interface ProgressBarProps {
  /** Completion from 0 to 1. Values outside the range are clamped. */
  value: number;
  /** Track geometry + colour (height, rounding, background). */
  trackClassName: string;
  /** Fill colour or gradient — each game keeps its own. */
  fillClassName: string;
  /**
   * Motion for the width change. Defaults to the springy settle four of the
   * five progress bars already used; the two that deliberately differ (the
   * tracing letter bar tracks a finger and must not lag) pass their own.
   */
  transition?: Transition;
  /** `false` (default) means "don't animate in from zero on first paint". */
  animateFromZero?: boolean;
  /** Describes what is being measured, e.g. "12 of 26 letters found". */
  ariaLabel?: string;
}

const DEFAULT_TRANSITION: Transition = { type: "spring", stiffness: 120, damping: 20 };

/**
 * The portal's progress indicator. Four games drew their own; the geometry and
 * palette differ per game (that is intentional visual identity), but the
 * clamping, the motion contract and the accessibility semantics are the same
 * everywhere and now live in one place.
 */
export function ProgressBar({
  value,
  trackClassName,
  fillClassName,
  transition = DEFAULT_TRANSITION,
  animateFromZero = false,
  ariaLabel,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, value)) * 100;

  return (
    <div
      className={`overflow-hidden ${trackClassName}`}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
    >
      <motion.div
        className={`h-full rounded-full ${fillClassName}`}
        initial={animateFromZero ? { width: 0 } : false}
        animate={{ width: `${pct}%` }}
        transition={transition}
      />
    </div>
  );
}
