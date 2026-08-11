/**
 * Explicit phonics data — the letter NAME and the letter SOUND are separate.
 *
 * The sound strings are natural, child-friendly spellings chosen to make
 * browser speech synthesis produce the actual phonetic sound (never IPA,
 * never "slash-æ-slash" style notation).
 */

export const LETTER_SOUNDS: Record<string, string> = {
  A: "aah",
  B: "buh",
  C: "cuh",
  D: "duh",
  E: "eh",
  F: "fff",
  G: "guh",
  H: "huh",
  I: "ih",
  J: "juh",
  K: "kuh",
  L: "lll",
  M: "mmm",
  N: "nnn",
  O: "oh",
  P: "puh",
  Q: "kwuh",
  R: "rrr",
  S: "sss",
  T: "tuh",
  U: "uh",
  V: "vvv",
  W: "wuh",
  X: "ks",
  Y: "yuh",
  Z: "zzz",
};

/** Letter sound for either case ("a" and "A" both → "ah") */
export function getLetterSound(letter: string): string {
  return LETTER_SOUNDS[letter.toUpperCase()] ?? letter;
}

/** Anchor words — real words that every TTS engine pronounces correctly.
 *  Hearing "b … buh … ball" teaches the sound even on engines that mangle
 *  the isolated "buh". This is exactly how phonics is taught to children. */
export const LETTER_WORDS: Record<string, string> = {
  A: "apple", B: "ball", C: "cat", D: "dog", E: "egg", F: "fish",
  G: "goat", H: "hat", I: "igloo", J: "jam", K: "kite", L: "lion",
  M: "moon", N: "nest", O: "octopus", P: "pig", Q: "queen", R: "rabbit",
  S: "sun", T: "tiger", U: "umbrella", V: "van", W: "water", X: "box",
  Y: "yo-yo", Z: "zebra",
};

export function getLetterWord(letter: string): string {
  return LETTER_WORDS[letter.toUpperCase()] ?? "";
}
