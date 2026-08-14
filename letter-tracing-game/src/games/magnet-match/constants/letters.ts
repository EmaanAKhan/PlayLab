/** Data-driven lowercase letter groups — a b c / d e f / … / y z.
 *  Built programmatically; the final two-letter group falls out naturally. */
export const LOWERCASE = "abcdefghijklmnopqrstuvwxyz".split("");

export const GROUPS: readonly (readonly string[])[] = Array.from(
  { length: Math.ceil(LOWERCASE.length / 3) },
  (_, i) => LOWERCASE.slice(i * 3, i * 3 + 3)
);

export const TOTAL_GROUPS = GROUPS.length; // 9 (the last is y·z)

/** Bright physical-magnet colors, rotating per letter */
export const MAGNET_COLORS = [
  { fill: "#E85D5D", edge: "#C23B3B" }, // red
  { fill: "#5DBE6E", edge: "#3B9A4C" }, // green
  { fill: "#F2C23D", edge: "#D19E1E" }, // yellow
  { fill: "#5D8FE8", edge: "#3B6BC2" }, // blue
  { fill: "#B57DE8", edge: "#8F55C2" }, // purple
] as const;
