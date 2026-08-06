import { buildPath } from "@/utils/pathUtils";
import type { LetterDefinition } from "@/types";

// Coordinate space: 200×200
// x-height region: y=90 (top) to y=170 (baseline)
// Ascenders: y=20
// Descenders: y=195

// ── a ─────────────────────────────────────────────────────────────────────────
const { points: aS1, pathData: aS1p } = buildPath([138, 108], [
  { type: "Q", c: [138, 90], to: [100, 90] },
  { type: "Q", c: [60, 90], to: [60, 130] },
  { type: "Q", c: [60, 170], to: [100, 170] },
  { type: "Q", c: [128, 170], to: [138, 150] },
]);
const { points: aS2, pathData: aS2p } = buildPath([138, 108], [{ type: "L", to: [138, 170] }]);

// ── b ─────────────────────────────────────────────────────────────────────────
const { points: bS1, pathData: bS1p } = buildPath([62, 20], [{ type: "L", to: [62, 170] }]);
const { points: bS2, pathData: bS2p } = buildPath([62, 90], [
  { type: "Q", c: [62, 68], to: [100, 68] },
  { type: "Q", c: [148, 68], to: [148, 120] },
  { type: "Q", c: [148, 170], to: [100, 170] },
  { type: "L", to: [62, 170] },
]);

// ── c ─────────────────────────────────────────────────────────────────────────
const { points: cS1, pathData: cS1p } = buildPath([138, 110], [
  { type: "Q", c: [130, 90], to: [100, 90] },
  { type: "Q", c: [60, 90], to: [60, 130] },
  { type: "Q", c: [60, 170], to: [100, 170] },
  { type: "Q", c: [130, 170], to: [138, 150] },
]);

// ── d ─────────────────────────────────────────────────────────────────────────
const { points: dS1, pathData: dS1p } = buildPath([138, 20], [{ type: "L", to: [138, 170] }]);
const { points: dS2, pathData: dS2p } = buildPath([138, 90], [
  { type: "Q", c: [138, 68], to: [100, 68] },
  { type: "Q", c: [60, 68], to: [60, 120] },
  { type: "Q", c: [60, 170], to: [100, 170] },
  { type: "L", to: [138, 170] },
]);

// ── e ─────────────────────────────────────────────────────────────────────────
const { points: eS1, pathData: eS1p } = buildPath([62, 128], [
  { type: "L", to: [142, 128] },
  { type: "Q", c: [142, 90], to: [100, 90] },
  { type: "Q", c: [60, 90], to: [60, 130] },
  { type: "Q", c: [60, 170], to: [100, 170] },
  { type: "Q", c: [130, 170], to: [140, 150] },
]);

// ── f ─────────────────────────────────────────────────────────────────────────
const { points: fS1, pathData: fS1p } = buildPath([140, 30], [
  { type: "Q", c: [140, 18], to: [108, 18] },
  { type: "Q", c: [76, 18], to: [76, 50] },
  { type: "L", to: [76, 170] },
]);
const { points: fS2, pathData: fS2p } = buildPath([52, 108], [{ type: "L", to: [118, 108] }]);

// ── g ─────────────────────────────────────────────────────────────────────────
const { points: gS1, pathData: gS1p } = buildPath([138, 108], [
  { type: "Q", c: [138, 90], to: [100, 90] },
  { type: "Q", c: [60, 90], to: [60, 130] },
  { type: "Q", c: [60, 170], to: [100, 170] },
  { type: "Q", c: [128, 170], to: [138, 150] },
]);
const { points: gS2, pathData: gS2p } = buildPath([138, 108], [
  { type: "L", to: [138, 185] },
  { type: "Q", c: [138, 198], to: [100, 198] },
  { type: "Q", c: [65, 198], to: [65, 182] },
]);

// ── h ─────────────────────────────────────────────────────────────────────────
const { points: hS1, pathData: hS1p } = buildPath([62, 20], [{ type: "L", to: [62, 170] }]);
const { points: hS2, pathData: hS2p } = buildPath([62, 110], [
  { type: "Q", c: [62, 88], to: [100, 88] },
  { type: "Q", c: [138, 88], to: [138, 120] },
  { type: "L", to: [138, 170] },
]);

// ── i ─────────────────────────────────────────────────────────────────────────
const { points: iS1, pathData: iS1p } = buildPath([100, 90], [{ type: "L", to: [100, 170] }]);
// dot is implied by design; if you want it explicit add a short tick

// ── j ─────────────────────────────────────────────────────────────────────────
const { points: jS1, pathData: jS1p } = buildPath([118, 90], [
  { type: "L", to: [118, 185] },
  { type: "Q", c: [118, 198], to: [90, 198] },
  { type: "Q", c: [62, 198], to: [62, 180] },
]);

// ── k ─────────────────────────────────────────────────────────────────────────
const { points: kS1, pathData: kS1p } = buildPath([62, 20], [{ type: "L", to: [62, 170] }]);
const { points: kS2, pathData: kS2p } = buildPath([138, 90], [{ type: "L", to: [62, 128] }]);
const { points: kS3, pathData: kS3p } = buildPath([62, 128], [{ type: "L", to: [138, 170] }]);

// ── l ─────────────────────────────────────────────────────────────────────────
const { points: lS1, pathData: lS1p } = buildPath([100, 20], [
  { type: "L", to: [100, 162] },
  { type: "Q", c: [100, 174], to: [114, 174] },
]);

// ── m ─────────────────────────────────────────────────────────────────────────
const { points: mS1, pathData: mS1p } = buildPath([40, 170], [{ type: "L", to: [40, 90] }]);
const { points: mS2, pathData: mS2p } = buildPath([40, 110], [
  { type: "Q", c: [40, 88], to: [78, 88] },
  { type: "Q", c: [110, 88], to: [110, 120] },
  { type: "L", to: [110, 170] },
]);
const { points: mS3, pathData: mS3p } = buildPath([110, 110], [
  { type: "Q", c: [110, 88], to: [148, 88] },
  { type: "Q", c: [180, 88], to: [180, 120] },
  { type: "L", to: [180, 170] },
]);

// ── n ─────────────────────────────────────────────────────────────────────────
const { points: nS1, pathData: nS1p } = buildPath([60, 170], [{ type: "L", to: [60, 90] }]);
const { points: nS2, pathData: nS2p } = buildPath([60, 110], [
  { type: "Q", c: [60, 88], to: [100, 88] },
  { type: "Q", c: [140, 88], to: [140, 120] },
  { type: "L", to: [140, 170] },
]);

// ── o ─────────────────────────────────────────────────────────────────────────
const { points: oS1, pathData: oS1p } = buildPath([138, 130], [
  { type: "Q", c: [138, 90], to: [100, 90] },
  { type: "Q", c: [62, 90], to: [62, 130] },
  { type: "Q", c: [62, 170], to: [100, 170] },
  { type: "Q", c: [138, 170], to: [138, 130] },
]);

// ── p ─────────────────────────────────────────────────────────────────────────
const { points: pS1, pathData: pS1p } = buildPath([62, 90], [{ type: "L", to: [62, 198] }]);
const { points: pS2, pathData: pS2p } = buildPath([62, 90], [
  { type: "Q", c: [62, 68], to: [100, 68] },
  { type: "Q", c: [148, 68], to: [148, 120] },
  { type: "Q", c: [148, 170], to: [100, 170] },
  { type: "L", to: [62, 170] },
]);

// ── q ─────────────────────────────────────────────────────────────────────────
const { points: qS1, pathData: qS1p } = buildPath([62, 130], [
  { type: "Q", c: [62, 90], to: [100, 90] },
  { type: "Q", c: [138, 90], to: [138, 130] },
  { type: "Q", c: [138, 170], to: [100, 170] },
  { type: "L", to: [62, 170] },
]);
const { points: qS2, pathData: qS2p } = buildPath([138, 90], [{ type: "L", to: [138, 198] }]);

// ── r ─────────────────────────────────────────────────────────────────────────
const { points: rS1, pathData: rS1p } = buildPath([68, 170], [{ type: "L", to: [68, 90] }]);
const { points: rS2, pathData: rS2p } = buildPath([68, 108], [
  { type: "Q", c: [68, 90], to: [100, 90] },
  { type: "Q", c: [130, 90], to: [135, 108] },
]);

// ── s ─────────────────────────────────────────────────────────────────────────
const { points: sS1, pathData: sS1p } = buildPath([140, 105], [
  { type: "Q", c: [140, 88], to: [100, 88] },
  { type: "Q", c: [62, 88], to: [62, 116] },
  { type: "Q", c: [62, 130], to: [100, 130] },
  { type: "Q", c: [140, 130], to: [140, 152] },
  { type: "Q", c: [140, 172], to: [100, 172] },
  { type: "Q", c: [62, 172], to: [62, 155] },
]);

// ── t ─────────────────────────────────────────────────────────────────────────
const { points: tS1, pathData: tS1p } = buildPath([100, 30], [
  { type: "L", to: [100, 162] },
  { type: "Q", c: [100, 175], to: [118, 175] },
]);
const { points: tS2, pathData: tS2p } = buildPath([64, 85], [{ type: "L", to: [140, 85] }]);

// ── u ─────────────────────────────────────────────────────────────────────────
const { points: uS1, pathData: uS1p } = buildPath([62, 90], [
  { type: "L", to: [62, 152] },
  { type: "Q", c: [62, 172], to: [100, 172] },
  { type: "Q", c: [138, 172], to: [138, 152] },
  { type: "L", to: [138, 90] },
]);

// ── v ─────────────────────────────────────────────────────────────────────────
const { points: vS1, pathData: vS1p } = buildPath([60, 90], [{ type: "L", to: [100, 172] }]);
const { points: vS2, pathData: vS2p } = buildPath([100, 172], [{ type: "L", to: [140, 90] }]);

// ── w ─────────────────────────────────────────────────────────────────────────
const { points: wS1, pathData: wS1p } = buildPath([35, 90], [{ type: "L", to: [65, 170] }]);
const { points: wS2, pathData: wS2p } = buildPath([65, 170], [{ type: "L", to: [100, 120] }]);
const { points: wS3, pathData: wS3p } = buildPath([100, 120], [{ type: "L", to: [135, 170] }]);
const { points: wS4, pathData: wS4p } = buildPath([135, 170], [{ type: "L", to: [165, 90] }]);

// ── x ─────────────────────────────────────────────────────────────────────────
const { points: xS1, pathData: xS1p } = buildPath([62, 90], [{ type: "L", to: [138, 170] }]);
const { points: xS2, pathData: xS2p } = buildPath([138, 90], [{ type: "L", to: [62, 170] }]);

// ── y ─────────────────────────────────────────────────────────────────────────
const { points: yS1, pathData: yS1p } = buildPath([62, 90], [{ type: "L", to: [100, 140] }]);
const { points: yS2, pathData: yS2p } = buildPath([138, 90], [
  { type: "L", to: [100, 140] },
  { type: "L", to: [70, 198] },
]);

// ── z ─────────────────────────────────────────────────────────────────────────
const { points: zS1, pathData: zS1p } = buildPath([62, 90], [
  { type: "L", to: [138, 90] },
  { type: "L", to: [62, 170] },
  { type: "L", to: [138, 170] },
]);

export const LOWERCASE_LETTER_DATA: LetterDefinition[] = [
  {
    letter: "a",
    phonetic: "A — aah as in apple",
    strokes: [
      { id: "a-s1", points: aS1, pathData: aS1p },
      { id: "a-s2", points: aS2, pathData: aS2p },
    ],
  },
  {
    letter: "b",
    phonetic: "B — buh as in ball",
    strokes: [
      { id: "b-s1", points: bS1, pathData: bS1p },
      { id: "b-s2", points: bS2, pathData: bS2p },
    ],
  },
  {
    letter: "c",
    phonetic: "C — kuh as in cat",
    strokes: [{ id: "c-s1", points: cS1, pathData: cS1p }],
  },
  {
    letter: "d",
    phonetic: "D — duh as in dog",
    strokes: [
      { id: "d-s1", points: dS1, pathData: dS1p },
      { id: "d-s2", points: dS2, pathData: dS2p },
    ],
  },
  {
    letter: "e",
    phonetic: "E — eh as in egg",
    strokes: [{ id: "e-s1", points: eS1, pathData: eS1p }],
  },
  {
    letter: "f",
    phonetic: "F — fuh as in fish",
    strokes: [
      { id: "f-s1", points: fS1, pathData: fS1p },
      { id: "f-s2", points: fS2, pathData: fS2p },
    ],
  },
  {
    letter: "g",
    phonetic: "G — guh as in goat",
    strokes: [
      { id: "g-s1", points: gS1, pathData: gS1p },
      { id: "g-s2", points: gS2, pathData: gS2p },
    ],
  },
  {
    letter: "h",
    phonetic: "H — huh as in hat",
    strokes: [
      { id: "h-s1", points: hS1, pathData: hS1p },
      { id: "h-s2", points: hS2, pathData: hS2p },
    ],
  },
  {
    letter: "i",
    phonetic: "I — ih as in insect",
    strokes: [{ id: "i-s1", points: iS1, pathData: iS1p }],
  },
  {
    letter: "j",
    phonetic: "J — juh as in jar",
    strokes: [{ id: "j-s1", points: jS1, pathData: jS1p }],
  },
  {
    letter: "k",
    phonetic: "K — kuh as in kite",
    strokes: [
      { id: "k-s1", points: kS1, pathData: kS1p },
      { id: "k-s2", points: kS2, pathData: kS2p },
      { id: "k-s3", points: kS3, pathData: kS3p },
    ],
  },
  {
    letter: "l",
    phonetic: "L — luh as in lion",
    strokes: [{ id: "l-s1", points: lS1, pathData: lS1p }],
  },
  {
    letter: "m",
    phonetic: "M — muh as in moon",
    strokes: [
      { id: "m-s1", points: mS1, pathData: mS1p },
      { id: "m-s2", points: mS2, pathData: mS2p },
      { id: "m-s3", points: mS3, pathData: mS3p },
    ],
  },
  {
    letter: "n",
    phonetic: "N — nuh as in nest",
    strokes: [
      { id: "n-s1", points: nS1, pathData: nS1p },
      { id: "n-s2", points: nS2, pathData: nS2p },
    ],
  },
  {
    letter: "o",
    phonetic: "O — oh as in orange",
    strokes: [{ id: "o-s1", points: oS1, pathData: oS1p }],
  },
  {
    letter: "p",
    phonetic: "P — puh as in pig",
    strokes: [
      { id: "p-s1", points: pS1, pathData: pS1p },
      { id: "p-s2", points: pS2, pathData: pS2p },
    ],
  },
  {
    letter: "q",
    phonetic: "Q — kwuh as in queen",
    strokes: [
      { id: "q-s1", points: qS1, pathData: qS1p },
      { id: "q-s2", points: qS2, pathData: qS2p },
    ],
  },
  {
    letter: "r",
    phonetic: "R — ruh as in rainbow",
    strokes: [
      { id: "r-s1", points: rS1, pathData: rS1p },
      { id: "r-s2", points: rS2, pathData: rS2p },
    ],
  },
  {
    letter: "s",
    phonetic: "S — suh as in sun",
    strokes: [{ id: "s-s1", points: sS1, pathData: sS1p }],
  },
  {
    letter: "t",
    phonetic: "T — tuh as in tree",
    strokes: [
      { id: "t-s1", points: tS1, pathData: tS1p },
      { id: "t-s2", points: tS2, pathData: tS2p },
    ],
  },
  {
    letter: "u",
    phonetic: "U — uh as in umbrella",
    strokes: [{ id: "u-s1", points: uS1, pathData: uS1p }],
  },
  {
    letter: "v",
    phonetic: "V — vuh as in van",
    strokes: [
      { id: "v-s1", points: vS1, pathData: vS1p },
      { id: "v-s2", points: vS2, pathData: vS2p },
    ],
  },
  {
    letter: "w",
    phonetic: "W — wuh as in water",
    strokes: [
      { id: "w-s1", points: wS1, pathData: wS1p },
      { id: "w-s2", points: wS2, pathData: wS2p },
      { id: "w-s3", points: wS3, pathData: wS3p },
      { id: "w-s4", points: wS4, pathData: wS4p },
    ],
  },
  {
    letter: "x",
    phonetic: "X — ks as in fox",
    strokes: [
      { id: "x-s1", points: xS1, pathData: xS1p },
      { id: "x-s2", points: xS2, pathData: xS2p },
    ],
  },
  {
    letter: "y",
    phonetic: "Y — yuh as in yellow",
    strokes: [
      { id: "y-s1", points: yS1, pathData: yS1p },
      { id: "y-s2", points: yS2, pathData: yS2p },
    ],
  },
  {
    letter: "z",
    phonetic: "Z — zuh as in zebra",
    strokes: [{ id: "z-s1", points: zS1, pathData: zS1p }],
  },
];
