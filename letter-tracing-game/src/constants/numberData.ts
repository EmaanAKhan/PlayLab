import { buildPath } from "@/utils/pathUtils";
import type { LetterDefinition } from "@/types";

/**
 * Numbers 1–10 in the same 200×200 stroke format as the alphabet, following
 * standard handwriting stroke order (multi-stroke numbers require a lift,
 * exactly like multi-stroke letters).
 */

// 1 — little upstroke, then straight down
const { points: n1S1, pathData: n1S1p } = buildPath([64, 56], [
  { type: "L", to: [103, 22] },
  { type: "L", to: [103, 180] },
]);

// 2 — curve over, sweep down-left, base line
const { points: n2S1, pathData: n2S1p } = buildPath([58, 58], [
  { type: "Q", c: [58, 20], to: [100, 20] },
  { type: "Q", c: [144, 20], to: [144, 60] },
  { type: "Q", c: [144, 96], to: [58, 180] },
  { type: "L", to: [146, 180] },
]);

// 3 — double bump
const { points: n3S1, pathData: n3S1p } = buildPath([60, 44], [
  { type: "Q", c: [74, 20], to: [100, 20] },
  { type: "Q", c: [142, 20], to: [142, 58] },
  { type: "Q", c: [142, 94], to: [102, 98] },
  { type: "Q", c: [146, 102], to: [146, 140] },
  { type: "Q", c: [146, 180], to: [100, 180] },
  { type: "Q", c: [72, 180], to: [56, 156] },
]);

// 4 — down-slant + across, then the tall vertical
const { points: n4S1, pathData: n4S1p } = buildPath([112, 20], [
  { type: "L", to: [48, 120] },
  { type: "L", to: [156, 120] },
]);
const { points: n4S2, pathData: n4S2p } = buildPath([126, 20], [
  { type: "L", to: [126, 180] },
]);

// 5 — down + belly, then the top bar
const { points: n5S1, pathData: n5S1p } = buildPath([64, 20], [
  { type: "L", to: [60, 88] },
  { type: "Q", c: [82, 76], to: [104, 78] },
  { type: "Q", c: [150, 84], to: [150, 130] },
  { type: "Q", c: [150, 180], to: [100, 180] },
  { type: "Q", c: [70, 180], to: [54, 158] },
]);
const { points: n5S2, pathData: n5S2p } = buildPath([64, 20], [
  { type: "L", to: [146, 20] },
]);

// 6 — swoop down into the loop
const { points: n6S1, pathData: n6S1p } = buildPath([132, 26], [
  { type: "Q", c: [94, 16], to: [70, 58] },
  { type: "Q", c: [52, 94], to: [52, 130] },
  { type: "Q", c: [52, 182], to: [100, 182] },
  { type: "Q", c: [148, 182], to: [148, 138] },
  { type: "Q", c: [148, 98], to: [102, 96] },
  { type: "Q", c: [70, 96], to: [54, 124] },
]);

// 7 — across, then down-slant
const { points: n7S1, pathData: n7S1p } = buildPath([54, 20], [
  { type: "L", to: [148, 20] },
  { type: "L", to: [86, 180] },
]);

// 8 — one continuous crossing figure-eight
const { points: n8S1, pathData: n8S1p } = buildPath([100, 20], [
  { type: "Q", c: [56, 20], to: [56, 56] },
  { type: "Q", c: [56, 94], to: [100, 97] },
  { type: "Q", c: [146, 100], to: [146, 140] },
  { type: "Q", c: [146, 180], to: [100, 180] },
  { type: "Q", c: [54, 180], to: [54, 140] },
  { type: "Q", c: [54, 100], to: [100, 97] },
  { type: "Q", c: [144, 94], to: [144, 56] },
  { type: "Q", c: [144, 20], to: [100, 20] },
]);

// 9 — circle, then straight down
const { points: n9S1, pathData: n9S1p } = buildPath([140, 58], [
  { type: "Q", c: [140, 20], to: [98, 20] },
  { type: "Q", c: [56, 20], to: [56, 58] },
  { type: "Q", c: [56, 96], to: [98, 96] },
  { type: "Q", c: [132, 96], to: [140, 66] },
  { type: "L", to: [140, 180] },
]);

// 10 — the 1 (with a lift), then the 0
const { points: n10S1, pathData: n10S1p } = buildPath([28, 54], [
  { type: "L", to: [62, 24] },
  { type: "L", to: [62, 180] },
]);
const { points: n10S2, pathData: n10S2p } = buildPath([132, 20], [
  { type: "Q", c: [96, 20], to: [96, 100] },
  { type: "Q", c: [96, 180], to: [132, 180] },
  { type: "Q", c: [168, 180], to: [168, 100] },
  { type: "Q", c: [168, 20], to: [132, 20] },
]);

export const NUMBER_DATA: LetterDefinition[] = [
  { letter: "1", phonetic: "One", strokes: [{ id: "1-1", points: n1S1, pathData: n1S1p }] },
  { letter: "2", phonetic: "Two", strokes: [{ id: "2-1", points: n2S1, pathData: n2S1p }] },
  { letter: "3", phonetic: "Three", strokes: [{ id: "3-1", points: n3S1, pathData: n3S1p }] },
  {
    letter: "4",
    phonetic: "Four",
    strokes: [
      { id: "4-1", points: n4S1, pathData: n4S1p },
      { id: "4-2", points: n4S2, pathData: n4S2p },
    ],
  },
  {
    letter: "5",
    phonetic: "Five",
    strokes: [
      { id: "5-1", points: n5S1, pathData: n5S1p },
      { id: "5-2", points: n5S2, pathData: n5S2p },
    ],
  },
  { letter: "6", phonetic: "Six", strokes: [{ id: "6-1", points: n6S1, pathData: n6S1p }] },
  { letter: "7", phonetic: "Seven", strokes: [{ id: "7-1", points: n7S1, pathData: n7S1p }] },
  { letter: "8", phonetic: "Eight", strokes: [{ id: "8-1", points: n8S1, pathData: n8S1p }] },
  { letter: "9", phonetic: "Nine", strokes: [{ id: "9-1", points: n9S1, pathData: n9S1p }] },
  {
    letter: "10",
    phonetic: "Ten",
    strokes: [
      { id: "10-1", points: n10S1, pathData: n10S1p },
      { id: "10-2", points: n10S2, pathData: n10S2p },
    ],
  },
];

/** Canonical symbol list for progress tracking */
export const NUMBER_SYMBOLS = NUMBER_DATA.map((n) => n.letter);
