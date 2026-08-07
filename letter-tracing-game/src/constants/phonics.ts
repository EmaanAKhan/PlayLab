/**
 * Explicit phonics data — the letter NAME and the letter SOUND are separate.
 *
 * The sound strings are natural, child-friendly spellings chosen to make
 * browser speech synthesis produce the actual phonetic sound (never IPA,
 * never "slash-æ-slash" style notation).
 */

export const LETTER_SOUNDS: Record<string, string> = {
  A: "aaah",
  B: "buh",
  C: "cuh",
  D: "duh",
  E: "eh",
  F: "fuh",
  G: "guh",
  H: "huh",
  I: "ih",
  J: "juh",
  K: "kuh",
  L: "luh",
  M: "muh",
  N: "nuh",
  O: "oh",
  P: "puh",
  Q: "kwuh",
  R: "ruh",
  S: "sss",
  T: "tuh",
  U: "uh",
  V: "vuh",
  W: "wuh",
  X: "ks",
  Y: "yuh",
  Z: "zzz",
};

/** Letter sound for either case ("a" and "A" both → "ah") */
export function getLetterSound(letter: string): string {
  return LETTER_SOUNDS[letter.toUpperCase()] ?? letter;
}
