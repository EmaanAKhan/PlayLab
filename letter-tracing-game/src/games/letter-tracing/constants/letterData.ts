import { buildPath } from "@games/letter-tracing/utils/pathUtils";
import type { LetterDefinition } from "@games/letter-tracing/types";

const { points: aS1, pathData: aS1p } = buildPath([100, 20], [{ type: "L", to: [40, 180] }]);
const { points: aS2, pathData: aS2p } = buildPath([100, 20], [{ type: "L", to: [160, 180] }]);
const { points: aS3, pathData: aS3p } = buildPath([62, 118], [{ type: "L", to: [138, 118] }]);

const { points: bS1, pathData: bS1p } = buildPath([55, 20], [{ type: "L", to: [55, 180] }]);
const { points: bS2, pathData: bS2p } = buildPath([55, 20], [
  { type: "L", to: [110, 20] },
  { type: "Q", c: [145, 20], to: [145, 57] },
  { type: "Q", c: [145, 100], to: [55, 100] },
]);
const { points: bS3, pathData: bS3p } = buildPath([55, 100], [
  { type: "L", to: [118, 100] },
  { type: "Q", c: [155, 100], to: [155, 140] },
  { type: "Q", c: [155, 180], to: [55, 180] },
]);

const { points: cS1, pathData: cS1p } = buildPath([162, 58], [
  { type: "Q", c: [150, 20], to: [100, 20] },
  { type: "Q", c: [38, 20], to: [38, 100] },
  { type: "Q", c: [38, 180], to: [100, 180] },
  { type: "Q", c: [150, 180], to: [162, 142] },
]);

const { points: dS1, pathData: dS1p } = buildPath([80, 20], [{ type: "L", to: [80, 180] }]);
const { points: dS2, pathData: dS2p } = buildPath([80, 20], [
  { type: "L", to: [110, 20] },
  { type: "Q", c: [168, 20], to: [168, 100] },
  { type: "Q", c: [168, 180], to: [110, 180] },
  { type: "L", to: [80, 180] },
]);

const { points: eS1, pathData: eS1p } = buildPath([155, 20], [
  { type: "L", to: [48, 20] },
  { type: "L", to: [48, 180] },
  { type: "L", to: [155, 180] },
]);
const { points: eS2, pathData: eS2p } = buildPath([48, 104], [{ type: "L", to: [130, 104] }]);

const { points: fS1, pathData: fS1p } = buildPath([150, 20], [
  { type: "L", to: [60, 20] },
  { type: "L", to: [60, 180] },
]);
const { points: fS2, pathData: fS2p } = buildPath([60, 105], [{ type: "L", to: [135, 105] }]);

const { points: gS1, pathData: gS1p } = buildPath([162, 58], [
  { type: "Q", c: [150, 20], to: [100, 20] },
  { type: "Q", c: [38, 20], to: [38, 100] },
  { type: "Q", c: [38, 180], to: [100, 180] },
  { type: "Q", c: [150, 180], to: [162, 142] },
  { type: "L", to: [118, 142] },
]);

const { points: hS1, pathData: hS1p } = buildPath([52, 20], [{ type: "L", to: [52, 180] }]);
const { points: hS2, pathData: hS2p } = buildPath([52, 108], [{ type: "L", to: [148, 108] }]);
const { points: hS3, pathData: hS3p } = buildPath([148, 20], [{ type: "L", to: [148, 180] }]);

const { points: iS1, pathData: iS1p } = buildPath([100, 20], [{ type: "L", to: [100, 180] }]);
const { points: iS2, pathData: iS2p } = buildPath([72, 20], [{ type: "L", to: [128, 20] }]);
const { points: iS3, pathData: iS3p } = buildPath([72, 180], [{ type: "L", to: [128, 180] }]);

const { points: jS1, pathData: jS1p } = buildPath([128, 20], [
  { type: "L", to: [128, 152] },
  { type: "Q", c: [128, 185], to: [90, 185] },
  { type: "Q", c: [52, 185], to: [52, 155] },
]);
const { points: jS2, pathData: jS2p } = buildPath([110, 20], [{ type: "L", to: [146, 20] }]);

const { points: kS1, pathData: kS1p } = buildPath([52, 20], [{ type: "L", to: [52, 180] }]);
const { points: kS2, pathData: kS2p } = buildPath([148, 20], [
  { type: "L", to: [52, 102] },
]);
const { points: kS3, pathData: kS3p } = buildPath([52, 102], [
  { type: "L", to: [148, 180] },
]);

const { points: lS1, pathData: lS1p } = buildPath([80, 20], [
  { type: "L", to: [80, 180] },
  { type: "L", to: [152, 180] },
]);

const { points: mS1, pathData: mS1p } = buildPath([42, 180], [{ type: "L", to: [42, 20] }]);
const { points: mS2, pathData: mS2p } = buildPath([42, 20], [
  { type: "L", to: [100, 95] },
  { type: "L", to: [158, 20] },
]);
const { points: mS3, pathData: mS3p } = buildPath([158, 20], [{ type: "L", to: [158, 180] }]);

const { points: nS1, pathData: nS1p } = buildPath([52, 180], [{ type: "L", to: [52, 20] }]);
const { points: nS2, pathData: nS2p } = buildPath([52, 20], [{ type: "L", to: [148, 180] }]);
const { points: nS3, pathData: nS3p } = buildPath([148, 180], [{ type: "L", to: [148, 20] }]);

const { points: oS1, pathData: oS1p } = buildPath([100, 20], [
  { type: "Q", c: [168, 20], to: [168, 100] },
  { type: "Q", c: [168, 180], to: [100, 180] },
  { type: "Q", c: [32, 180], to: [32, 100] },
  { type: "Q", c: [32, 20], to: [100, 20] },
]);

const { points: pS1, pathData: pS1p } = buildPath([55, 20], [{ type: "L", to: [55, 185] }]);
const { points: pS2, pathData: pS2p } = buildPath([55, 20], [
  { type: "L", to: [115, 20] },
  { type: "Q", c: [152, 20], to: [152, 75] },
  { type: "Q", c: [152, 112], to: [55, 112] },
]);

const { points: qS1, pathData: qS1p } = buildPath([100, 20], [
  { type: "Q", c: [168, 20], to: [168, 100] },
  { type: "Q", c: [168, 180], to: [100, 180] },
  { type: "Q", c: [32, 180], to: [32, 100] },
  { type: "Q", c: [32, 20], to: [100, 20] },
]);
const { points: qS2, pathData: qS2p } = buildPath([132, 155], [{ type: "L", to: [168, 188] }]);

const { points: rS1, pathData: rS1p } = buildPath([55, 20], [{ type: "L", to: [55, 180] }]);
const { points: rS2, pathData: rS2p } = buildPath([55, 20], [
  { type: "L", to: [115, 20] },
  { type: "Q", c: [152, 20], to: [152, 75] },
  { type: "Q", c: [152, 112], to: [55, 112] },
]);
const { points: rS3, pathData: rS3p } = buildPath([55, 112], [{ type: "L", to: [150, 180] }]);

const { points: sS1, pathData: sS1p } = buildPath([160, 52], [
  { type: "Q", c: [158, 20], to: [100, 20] },
  { type: "Q", c: [40, 20], to: [40, 65] },
  { type: "Q", c: [40, 100], to: [100, 108] },
  { type: "Q", c: [162, 118], to: [162, 158] },
  { type: "Q", c: [162, 188], to: [100, 188] },
  { type: "Q", c: [42, 188], to: [40, 155] },
]);

const { points: tS1, pathData: tS1p } = buildPath([42, 20], [{ type: "L", to: [158, 20] }]);
const { points: tS2, pathData: tS2p } = buildPath([100, 20], [{ type: "L", to: [100, 180] }]);

const { points: uS1, pathData: uS1p } = buildPath([52, 20], [
  { type: "L", to: [52, 148] },
  { type: "Q", c: [52, 185], to: [100, 185] },
  { type: "Q", c: [148, 185], to: [148, 148] },
  { type: "L", to: [148, 20] },
]);

const { points: vS1, pathData: vS1p } = buildPath([42, 20], [{ type: "L", to: [100, 182] }]);
const { points: vS2, pathData: vS2p } = buildPath([100, 182], [{ type: "L", to: [158, 20] }]);

const { points: wS1, pathData: wS1p } = buildPath([30, 20], [{ type: "L", to: [65, 180] }]);
const { points: wS2, pathData: wS2p } = buildPath([65, 180], [{ type: "L", to: [100, 100] }]);
const { points: wS3, pathData: wS3p } = buildPath([100, 100], [{ type: "L", to: [135, 180] }]);
const { points: wS4, pathData: wS4p } = buildPath([135, 180], [{ type: "L", to: [170, 20] }]);

const { points: xS1, pathData: xS1p } = buildPath([48, 20], [{ type: "L", to: [152, 180] }]);
const { points: xS2, pathData: xS2p } = buildPath([152, 20], [{ type: "L", to: [48, 180] }]);

const { points: yS1, pathData: yS1p } = buildPath([42, 20], [{ type: "L", to: [100, 105] }]);
const { points: yS2, pathData: yS2p } = buildPath([158, 20], [
  { type: "L", to: [100, 105] },
  { type: "L", to: [100, 180] },
]);

const { points: zS1, pathData: zS1p } = buildPath([48, 20], [
  { type: "L", to: [152, 20] },
  { type: "L", to: [48, 180] },
  { type: "L", to: [152, 180] },
]);

export const LETTER_DATA: LetterDefinition[] = [
  {
    letter: "A",
    phonetic: "A — like in Apple",
    strokes: [
      { id: "A-1", points: aS1, pathData: aS1p },
      { id: "A-2", points: aS2, pathData: aS2p },
      { id: "A-3", points: aS3, pathData: aS3p },
    ],
  },
  {
    letter: "B",
    phonetic: "B — like in Ball",
    strokes: [
      { id: "B-1", points: bS1, pathData: bS1p },
      { id: "B-2", points: bS2, pathData: bS2p },
      { id: "B-3", points: bS3, pathData: bS3p },
    ],
  },
  {
    letter: "C",
    phonetic: "C — like in Cat",
    strokes: [{ id: "C-1", points: cS1, pathData: cS1p }],
  },
  {
    letter: "D",
    phonetic: "D — like in Dog",
    strokes: [
      { id: "D-1", points: dS1, pathData: dS1p },
      { id: "D-2", points: dS2, pathData: dS2p },
    ],
  },
  {
    letter: "E",
    phonetic: "E — like in Egg",
    strokes: [
      { id: "E-1", points: eS1, pathData: eS1p },
      { id: "E-2", points: eS2, pathData: eS2p },
    ],
  },
  {
    letter: "F",
    phonetic: "F — like in Fish",
    strokes: [
      { id: "F-1", points: fS1, pathData: fS1p },
      { id: "F-2", points: fS2, pathData: fS2p },
    ],
  },
  {
    letter: "G",
    phonetic: "G — like in Goat",
    strokes: [{ id: "G-1", points: gS1, pathData: gS1p }],
  },
  {
    letter: "H",
    phonetic: "H — like in Hat",
    strokes: [
      { id: "H-1", points: hS1, pathData: hS1p },
      { id: "H-2", points: hS2, pathData: hS2p },
      { id: "H-3", points: hS3, pathData: hS3p },
    ],
  },
  {
    letter: "I",
    phonetic: "I — like in Igloo",
    strokes: [
      { id: "I-1", points: iS2, pathData: iS2p },
      { id: "I-2", points: iS1, pathData: iS1p },
      { id: "I-3", points: iS3, pathData: iS3p },
    ],
  },
  {
    letter: "J",
    phonetic: "J — like in Jar",
    strokes: [
      { id: "J-1", points: jS2, pathData: jS2p },
      { id: "J-2", points: jS1, pathData: jS1p },
    ],
  },
  {
    letter: "K",
    phonetic: "K — like in Kite",
    strokes: [
      { id: "K-1", points: kS1, pathData: kS1p },
      { id: "K-2", points: kS2, pathData: kS2p },
      { id: "K-3", points: kS3, pathData: kS3p },
    ],
  },
  {
    letter: "L",
    phonetic: "L — like in Lion",
    strokes: [{ id: "L-1", points: lS1, pathData: lS1p }],
  },
  {
    letter: "M",
    phonetic: "M — like in Moon",
    strokes: [
      { id: "M-1", points: mS1, pathData: mS1p },
      { id: "M-2", points: mS2, pathData: mS2p },
      { id: "M-3", points: mS3, pathData: mS3p },
    ],
  },
  {
    letter: "N",
    phonetic: "N — like in Nest",
    strokes: [
      { id: "N-1", points: nS1, pathData: nS1p },
      { id: "N-2", points: nS2, pathData: nS2p },
      { id: "N-3", points: nS3, pathData: nS3p },
    ],
  },
  {
    letter: "O",
    phonetic: "O — like in Owl",
    strokes: [{ id: "O-1", points: oS1, pathData: oS1p }],
  },
  {
    letter: "P",
    phonetic: "P — like in Pen",
    strokes: [
      { id: "P-1", points: pS1, pathData: pS1p },
      { id: "P-2", points: pS2, pathData: pS2p },
    ],
  },
  {
    letter: "Q",
    phonetic: "Q — like in Queen",
    strokes: [
      { id: "Q-1", points: qS1, pathData: qS1p },
      { id: "Q-2", points: qS2, pathData: qS2p },
    ],
  },
  {
    letter: "R",
    phonetic: "R — like in Rain",
    strokes: [
      { id: "R-1", points: rS1, pathData: rS1p },
      { id: "R-2", points: rS2, pathData: rS2p },
      { id: "R-3", points: rS3, pathData: rS3p },
    ],
  },
  {
    letter: "S",
    phonetic: "S — like in Sun",
    strokes: [{ id: "S-1", points: sS1, pathData: sS1p }],
  },
  {
    letter: "T",
    phonetic: "T — like in Tree",
    strokes: [
      { id: "T-1", points: tS1, pathData: tS1p },
      { id: "T-2", points: tS2, pathData: tS2p },
    ],
  },
  {
    letter: "U",
    phonetic: "U — like in Umbrella",
    strokes: [{ id: "U-1", points: uS1, pathData: uS1p }],
  },
  {
    letter: "V",
    phonetic: "V — like in Van",
    strokes: [
      { id: "V-1", points: vS1, pathData: vS1p },
      { id: "V-2", points: vS2, pathData: vS2p },
    ],
  },
  {
    letter: "W",
    phonetic: "W — like in Wind",
    strokes: [
      { id: "W-1", points: wS1, pathData: wS1p },
      { id: "W-2", points: wS2, pathData: wS2p },
      { id: "W-3", points: wS3, pathData: wS3p },
      { id: "W-4", points: wS4, pathData: wS4p },
    ],
  },
  {
    letter: "X",
    phonetic: "X — like in X-ray",
    strokes: [
      { id: "X-1", points: xS1, pathData: xS1p },
      { id: "X-2", points: xS2, pathData: xS2p },
    ],
  },
  {
    letter: "Y",
    phonetic: "Y — like in Yak",
    strokes: [
      { id: "Y-1", points: yS1, pathData: yS1p },
      { id: "Y-2", points: yS2, pathData: yS2p },
    ],
  },
  {
    letter: "Z",
    phonetic: "Z — like in Zebra",
    strokes: [{ id: "Z-1", points: zS1, pathData: zS1p }],
  },
];
