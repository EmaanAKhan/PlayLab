/**
 * Alphabet Dino Dig — data for both play modes.
 *
 * ── FEED MODE ──
 * Letter RECOGNITION from voice: a dino asks for a letter (existing
 * `hunt-find-*` narration clips), the child taps the matching stone from four.
 * One session serves FEED_TOTAL letters drawn shuffled from the alphabet, no
 * repeats — short enough to finish in one sitting.
 *
 * ── STONES MODE ──
 * Letter SEQUENCING: the alphabet becomes a stepping-stone bridge, built in
 * seven crossings — one per cast dinosaur. Group sizes 4+4+4+4+4+3+3 = 26, so
 * seven dinos exactly cover the alphabet with no impossible final round.
 *
 * ── DECOYS (both modes) ──
 * Decoys sit fixed wraparound distances from the answer. Every offset is
 * non-zero mod 26 and the offsets are pairwise distinct mod 26, so a decoy can
 * never equal the answer or another decoy — no retry loop, no collisions, in
 * any round. They are also far enough away to be obviously wrong rather than a
 * cruel near-miss.
 */

export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/** Index of a letter in the alphabet — the one place that lookup is spelled. */
export function letterIndex(letter: string): number {
  return ALPHABET.indexOf(letter);
}

/** Wraparound decoy letters for `letter` at the given offsets. */
export function decoysFor(letter: string, offsets: readonly number[]): string[] {
  const i = letterIndex(letter);
  return offsets.map((o) => ALPHABET[(i + o) % ALPHABET.length]);
}

/* ── Feed the Dinos ── */

export const FEED_TOTAL = 10;
/** Three decoys per serving: 7, 13, 20 — pairwise distinct, none ≡ 0 (mod 26). */
export const FEED_DECOY_OFFSETS = [7, 13, 20] as const;

/* ── River Crossing ── */

/** One crossing per dinosaur: 4+4+4+4+4+3+3 = 26. */
const GROUP_SIZES = [4, 4, 4, 4, 4, 3, 3] as const;

export const STONE_GROUPS: readonly (readonly string[])[] = (() => {
  const groups: string[][] = [];
  let k = 0;
  for (const size of GROUP_SIZES) {
    groups.push(ALPHABET.slice(k, k + size));
    k += size;
  }
  return groups;
})();

export const TOTAL_CROSSINGS = STONE_GROUPS.length; // 7 — one per cast member

/** Two decoys per stone: 9 and 17 — pairwise distinct, none ≡ 0 (mod 26). */
export const STONE_DECOY_OFFSETS = [9, 17] as const;

/**
 * Letters already on the bridge when crossing `r` STARTS — derived from the
 * groups themselves so the alphabet strip can never over- or under-count.
 */
export const PLACED_BEFORE: readonly number[] = STONE_GROUPS.map((_, r) =>
  STONE_GROUPS.slice(0, r).reduce((n, g) => n + g.length, 0)
);
