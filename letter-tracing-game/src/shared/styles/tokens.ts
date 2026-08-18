/**
 * PlayLab design tokens — THE single source of truth for every colour,
 * shadow, radius and motion value in the design system.
 *
 * This file is consumed in exactly two places, so the values can never drift:
 *   1. tailwind.config.ts  → semantic Tailwind utilities (bg-jungle, text-ocean…)
 *   2. tailwind.config.ts  → a base plugin that emits the same values as CSS
 *      custom properties on :root, so hand-written CSS uses var(--color-…)
 *
 * Nothing else should hardcode a hex value for UI chrome. Illustration
 * artwork (the SVG characters and backdrops) keeps its own local, named
 * palette next to the drawing it belongs to — a shark's belly colour is
 * art direction, not a design token, and hoisting it here would make the
 * system meaningless. Those palettes are still named constants, never
 * magic hexes scattered through JSX.
 *
 * Every value below is lifted verbatim from the pre-refactor code: this is a
 * relocation, not a redesign. Changing one here changes it everywhere.
 */

/** Nested colour scale — mirrors Tailwind's shape so it can be spread directly. */
export const colors = {
  // ── Core pastel palette (shared by every game) ──────────────────────────
  sky: { pastel: "#D4EEFF" },
  peach: { DEFAULT: "#FFD6BC", soft: "#FFEADE", edge: "#FFAA80", ink: "#C06030" },
  mint: { DEFAULT: "#C8F0D8", soft: "#E5F7ED" },
  lavender: { DEFAULT: "#DDD5F5", soft: "#EEE9FF", line: "#EDE7FA", mist: "#F0E8FF" },
  sunshine: { DEFAULT: "#FFF0B3", soft: "#FFFADD" },
  coral: { DEFAULT: "#FF8B6A", light: "#FFBDA8" },

  /** The platform's primary brand colour — used for text, buttons, focus. */
  plum: { DEFAULT: "#7C5CBF", light: "#A882E8", ink: "#8B63D6", muted: "#A594C8" },
  jade: { DEFAULT: "#3DAA72", light: "#66CC94" },

  // ── Reward / feedback ───────────────────────────────────────────────────
  /** Gold stars: filled fill + stroke, and the empty (not-yet-earned) pair. */
  gold: {
    DEFAULT: "#FFD93D",
    deep: "#F4A73E",
    pale: "#FFE79C",
    dim: "#C08A2D",
    sun: "#F2C94C",
  },
  star: { empty: "#E7DFFA", emptyEdge: "#D8CDF2" },

  // ── Per-game semantic accents ───────────────────────────────────────────
  // Each game keeps its own visual identity; the tokens are centralised, the
  // identities are not flattened into one scheme.
  jungle: {
    DEFAULT: "#3DAA72",
    light: "#66CC94",
    pale: "#C8F0D8",
    leaf: "#8FD6A8",
    mist: "#A8E3BC",
    muted: "#9AB8A6",
    stem: "#5FAE7E",
  },
  ocean: {
    DEFAULT: "#2980B9",
    light: "#74B9FF",
    surface: "#6FC7EF",
    mid: "#3FA7DC",
    deep: "#2E8FC4",
  },
  kitchen: {
    DEFAULT: "#C97B4A",
    ink: "#8A5A2E",
    wall: "#FBE7A2",
    wallDeep: "#F7D97E",
    amber: "#F2B84D",
    ember: "#E88A5D",
    gold: "#E8B33D",
  },
  blush: { DEFAULT: "#FF8FA3", deep: "#D14D82", pale: "#FFD6E8", soft: "#FF9EBC" },
  /**
   * Alphabet Dino Dig — the one dark-surfaced game in the portal. `ink` is the
   * navy used for TEXT ON WHITE (the back pill, card labels): the teal DEFAULT
   * is a fill colour and does not carry enough contrast for small type.
   */
  dino: {
    DEFAULT: "#00C4CC",
    night: "#0A1A3A",
    deep: "#061027",
    dusk: "#14295A",
    ink: "#0A1A3A",
    orange: "#FF7F00",
    ember: "#FF5A2B",
    lime: "#A8FF00",
    dirt: "#4A2C17",
    dirtLight: "#6B4423",
    stone: "#DCE5F0",
  },

  /** Portal "picture-book page" surface. */
  paper: {
    DEFAULT: "#FDF9F0",
    desk: "#EFE7D8",
    edge: "#E3D9C6",
    inner: "#EADFC9",
    curl: "#F3ECDD",
    curlDeep: "#E8DFCB",
  },
} as const;

/** Box shadows — named by intent, not by their blur radius. */
export const shadows = {
  soft: "0 4px 20px rgba(0,0,0,0.08)",
  card: "0 8px 32px rgba(0,0,0,0.1)",
  button: "0 6px 0 rgba(0,0,0,0.12)",
  "button-pressed": "0 2px 0 rgba(0,0,0,0.12)",
  /** The tracing board's lifted purple glow. */
  board: "0 10px 36px rgba(124,92,191,0.16)",
  /** Selected pill inside a segmented control. */
  pill: "0 2px 8px rgba(124,92,191,0.18)",
  "pill-jungle": "0 2px 8px rgba(61,170,114,0.2)",
  /** The portal page: drop shadow + double inset ink frame. */
  page: "0 12px 40px rgba(90,72,50,0.18), inset 0 0 0 10px #FDF9F0, inset 0 0 0 11px #EADFC9",
} as const;

/** Radii — the rounded, child-friendly geometry of the whole product. */
export const radii = {
  "2xl": "1rem",
  "3xl": "1.5rem",
  "4xl": "2rem",
  "5xl": "3rem",
  /** The tracing canvas corner, matched by its wrapper's shadow. */
  board: "28px",
} as const;

/**
 * Motion — shared durations and easings.
 *
 * These are timing values only. Audio-synchronised choreography (the letter
 * intro, celebration pacing) deliberately does NOT read from here: those
 * delays are tuned against real clip durations and live next to the code that
 * schedules them, where the reason for each number is visible.
 */
export const motion = {
  duration: {
    fast: "150ms",
    base: "300ms",
    slow: "600ms",
  },
  /** The product's signature ease — a soft, confident settle. */
  easeSettle: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;

/** Framer Motion consumes easings as arrays, not CSS strings. */
export const EASE_SETTLE = [0.22, 1, 0.36, 1] as const;

/**
 * Flattens the nested colour scale into CSS custom properties:
 *   colors.jungle.leaf        → --color-jungle-leaf
 *   colors.plum.DEFAULT       → --color-plum
 * Used by the Tailwind base plugin so CSS and utility classes stay in lockstep.
 */
export function toCssVariables(): Record<string, string> {
  const vars: Record<string, string> = {};

  for (const [group, value] of Object.entries(colors)) {
    for (const [shade, hex] of Object.entries(value as Record<string, string>)) {
      const suffix = shade === "DEFAULT" ? "" : `-${kebab(shade)}`;
      vars[`--color-${kebab(group)}${suffix}`] = hex;
    }
  }
  for (const [name, value] of Object.entries(shadows)) {
    vars[`--shadow-${kebab(name)}`] = value;
  }
  for (const [name, value] of Object.entries(radii)) {
    vars[`--radius-${kebab(name)}`] = value;
  }
  for (const [name, value] of Object.entries(motion.duration)) {
    vars[`--duration-${kebab(name)}`] = value;
  }
  vars["--ease-settle"] = motion.easeSettle;

  return vars;
}

function kebab(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}
