"use client";

import { motion } from "framer-motion";

/** Which game's identity the pill borrows. Chevron + label share the tone. */
export type NavTone = "plum" | "jungle" | "ocean" | "kitchen" | "dino";

/**
 * How opaque the white pill sits over the scene behind it. The three levels
 * are the ones the games already used — kept distinct because a pill over the
 * busy kitchen wall needs more cover than one over a pale jungle gradient.
 */
export type NavSurface = "soft" | "medium" | "strong";

interface NavPillButtonProps {
  /** Short label — "Back", "Home", "Back to Games", "Letters". */
  label: string;
  onClick: () => void;
  /** Full sentence for screen readers; the visible label is deliberately terse. */
  ariaLabel: string;
  tone: NavTone;
  surface?: NavSurface;
  /** Pin to the top-left of the screen instead of sitting in a flow row. */
  pinned?: boolean;
  /**
   * Adds the main menu's entrance + press feedback. Only that one screen
   * animates its back pill, and it did so before the refactor — the flag
   * keeps that difference explicit instead of silently applying it everywhere.
   */
  animated?: boolean;
}

const TONE_CHEVRON: Record<NavTone, string> = {
  plum: "stroke-plum",
  jungle: "stroke-jungle",
  ocean: "stroke-ocean",
  kitchen: "stroke-kitchen",
  // Dino Dig's teal is a fill colour; its navy ink is what stays legible as a
  // small chevron/label on the white pill.
  dino: "stroke-dino-ink",
};

const TONE_LABEL: Record<NavTone, string> = {
  // The plum games render their label slightly softened; the others use the
  // solid accent. Preserved exactly as each game had it.
  plum: "text-plum/80",
  jungle: "text-jungle",
  ocean: "text-ocean",
  kitchen: "text-kitchen",
  dino: "text-dino-ink",
};

const SURFACE: Record<NavSurface, string> = {
  soft: "bg-white/75",
  medium: "bg-white/80",
  strong: "bg-white/85",
};

/**
 * The portal's one "go back" control.
 *
 * Every game had its own copy of this pill — same 44px touch target, same
 * chevron, same rounded-full white plate — differing only in accent colour and
 * label. One component now, so the touch target and contrast can never
 * regress in four places independently.
 */
export function NavPillButton({
  label,
  onClick,
  ariaLabel,
  tone,
  surface = "medium",
  pinned = false,
  animated = false,
}: NavPillButtonProps) {
  const className = [
    "flex min-h-[44px] items-center gap-1.5 rounded-full px-3.5 py-2 shadow-soft",
    SURFACE[surface],
    pinned ? "absolute left-4 top-4 z-20" : "",
  ].join(" ");

  const content = (
    <>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M15 18l-6-6 6-6"
          className={TONE_CHEVRON[tone]}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={`font-rounded text-xs font-bold ${TONE_LABEL[tone]}`}>{label}</span>
    </>
  );

  if (animated) {
    return (
      <motion.button
        onClick={onClick}
        className={className}
        whileTap={{ scale: 0.93 }}
        whileHover={{ scale: 1.05 }}
        initial={{ x: -14, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        aria-label={ariaLabel}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <button onClick={onClick} className={className} aria-label={ariaLabel}>
      {content}
    </button>
  );
}
