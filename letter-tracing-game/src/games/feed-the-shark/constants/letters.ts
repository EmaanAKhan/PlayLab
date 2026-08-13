/** Data-driven letter pairs — 13 rounds of two letters each (A–B … Y–Z).
 *  Built programmatically from the alphabet; nothing per-round is hardcoded. */

export interface LetterPair {
  upper: string;
  lower: string;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const LETTERS: readonly LetterPair[] = ALPHABET.map((upper) => ({
  upper,
  lower: upper.toLowerCase(),
}));

/** [[A,B],[C,D],…,[Y,Z]] — exactly 13 rounds */
export const ROUNDS: readonly (readonly [LetterPair, LetterPair])[] = Array.from(
  { length: LETTERS.length / 2 },
  (_, i) => [LETTERS[i * 2], LETTERS[i * 2 + 1]] as const
);

export const TOTAL_ROUNDS = ROUNDS.length; // 13
