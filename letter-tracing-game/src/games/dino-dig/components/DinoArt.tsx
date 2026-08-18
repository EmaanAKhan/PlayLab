"use client";

import { useId, type ReactElement } from "react";

/**
 * Alphabet Dino Dig — the handcrafted inline SVG cast, in the same style as
 * the platform's other art (SharkArt, AnimalArt, PennyArt): rounded, big
 * friendly eyes, never scary.
 *
 * SEVEN species, each with a genuinely different silhouette so no two read as
 * the same animal recoloured:
 *   Toro    — T-Rex           upright biped, big jaw, long tail
 *   Steggy  — Stegosaurus     long, LOW, arched back with plates
 *   Bronte  — Brontosaurus    TALL — a thin neck carrying a small head high
 *   Cera    — Triceratops     head-heavy: big frill + three horns
 *   Skye    — Pteranodon      airborne — spread wings, no legs on the ground
 *   Sail    — Spinosaurus     long and low with a big back sail + thin snout
 *   Dax     — Parasaurolophus slim biped with a back-swept head crest
 *
 * Proportions are deliberately LEAN: narrow torsos, long tapering tails and
 * necks, thin legs, plenty of negative space — closer to the reference
 * pattern's springy shapes than to round mascots.
 *
 * Following the project's styling rule, ILLUSTRATION palettes stay local and
 * named here. A dinosaur's belly colour is art direction, not a design token —
 * the tokens (navy, teal, orange, lime, dirt) are what the UI chrome around
 * this art is built from.
 */

const TORO = { body: "#FF7F00", shade: "#E56A00", belly: "#FFC169", spike: "#A8FF00", spot: "#FFD98A" } as const;
const STEGGY = { body: "#00C4CC", shade: "#00A0A8", belly: "#9BEDF1", plate: "#A8FF00", plateAlt: "#FF7F00", spot: "#CFF6F8" } as const;
const BRONTE = { body: "#E9B644", shade: "#C9992F", belly: "#F6D98A", spot: "#FBEBC0" } as const;
const CERA = { body: "#FF8FB0", shade: "#E06A92", belly: "#FFC6D8", frill: "#FFB3C9", frillDeep: "#E06A92", horn: "#F6EFE3" } as const;
const SKYE = { body: "#5D8FE8", shade: "#3B6BC2", belly: "#BCD3F8", crest: "#FF7F00", beak: "#F2B84D" } as const;
const SAIL = { body: "#B57DE8", shade: "#8F55C2", belly: "#E2CDF7", sail: "#D3B2F4" } as const;
const DAX = { body: "#9BD84A", shade: "#77B32E", belly: "#D8F3A8", crest: "#FF7F00" } as const;

const EYE = "#12233F";
const CHEEK = "#FF8FA3";

export type DinoMood = "idle" | "happy" | "cheer";

interface DinoProps {
  mood?: DinoMood;
}

/** Eyes + mouth shared by the whole cast, so their moods always agree. */
function Face({
  mood,
  cx,
  cy,
  scale = 1,
}: {
  mood: DinoMood;
  cx: number;
  cy: number;
  scale?: number;
}) {
  const happy = mood !== "idle";
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
      {mood === "cheer" ? (
        <>
          <path d="M-13 -2 q5 -7 10 0" stroke={EYE} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M4 -2 q5 -7 10 0" stroke={EYE} strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="-8" cy="-2" r="6.5" fill="white" />
          <circle cx="9" cy="-2" r="6.5" fill="white" />
          <circle cx="-7" cy="-1" r="3.4" fill={EYE} />
          <circle cx="10" cy="-1" r="3.4" fill={EYE} />
          <circle cx="-8.4" cy="-2.6" r="1.2" fill="white" />
          <circle cx="8.6" cy="-2.6" r="1.2" fill="white" />
        </>
      )}
      {happy ? (
        <path d="M-7 9 q7 8 14 0" stroke={EYE} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M-5 9 q5 4 10 0" stroke={EYE} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      )}
      <ellipse cx="-18" cy="6" rx="5" ry="3.4" fill={CHEEK} opacity="0.55" />
      <ellipse cx="20" cy="6" rx="5" ry="3.4" fill={CHEEK} opacity="0.55" />
    </g>
  );
}

/** TORO — slim upright T-Rex, big head over a narrow body. Faces right. */
export function Toro({ mood = "idle" }: DinoProps) {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      {/* long thin tapering tail */}
      <path d="M70 128 Q40 142 8 136 Q38 120 66 110 Z" fill={TORO.shade} />
      {/* slim drumstick legs */}
      <path d="M78 136 l-5 42 q0 6 8 6 h12 q-4 -10 -2 -48 Z" fill={TORO.shade} />
      <path d="M103 136 l-5 42 q0 6 8 6 h12 q-4 -10 -2 -48 Z" fill={TORO.body} />
      {/* narrow upright torso */}
      <path d="M66 130 Q60 94 84 72 Q102 56 116 62 L122 118 Q120 148 92 150 Q70 146 66 130 Z" fill={TORO.body} />
      <path d="M86 98 Q84 132 100 142 Q114 136 116 106 Q102 122 86 98 Z" fill={TORO.belly} opacity="0.9" />
      {/* tiny arms */}
      <path d="M112 106 q12 3 16 13 q-10 -3 -16 1 Z" fill={TORO.shade} />
      {/* big rounded head with a proper jaw */}
      <path d="M96 34 Q126 16 156 30 Q182 44 178 72 Q174 94 148 96 Q118 96 104 80 Q92 62 96 34 Z" fill={TORO.body} />
      <path d="M120 84 Q148 96 174 80 Q170 100 146 104 Q126 102 120 84 Z" fill={TORO.shade} opacity="0.5" />
      {/* lime back spikes */}
      <path d="M92 42 l-8 -13 l13 3 Z" fill={TORO.spike} />
      <path d="M80 60 l-11 -10 l12 -1 Z" fill={TORO.spike} />
      <path d="M72 82 l-13 -5 l11 -6 Z" fill={TORO.spike} />
      {/* dots */}
      <circle cx="84" cy="116" r="3.2" fill={TORO.spot} opacity="0.85" />
      <circle cx="104" cy="128" r="2.6" fill={TORO.spot} opacity="0.85" />
      <circle cx="140" cy="42" r="3" fill={TORO.spot} opacity="0.85" />
      <Face mood={mood} cx={140} cy={58} />
      <circle cx="170" cy="60" r="2.4" fill={TORO.shade} />
    </svg>
  );
}

/** STEGGY — long and LOW, an arched plated back, small head near the ground. */
export function Steggy({ mood = "idle" }: DinoProps) {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      {/* tail with thagomizer spikes */}
      <path d="M44 142 Q22 148 8 140 Q24 128 44 128 Z" fill={STEGGY.shade} />
      <path d="M15 132 l-9 -10 l12 2 Z" fill={STEGGY.plateAlt} />
      <path d="M24 128 l-4 -12 l10 4 Z" fill={STEGGY.plate} />
      {/* four short legs */}
      <path d="M62 150 l-2 27 q0 5 7 5 h9 q-3 -8 -2 -32 Z" fill={STEGGY.shade} />
      <path d="M124 150 l-2 27 q0 5 7 5 h9 q-3 -8 -2 -32 Z" fill={STEGGY.shade} />
      <path d="M82 152 l-2 27 q0 5 7 5 h9 q-3 -8 -2 -32 Z" fill={STEGGY.body} />
      <path d="M142 150 l-2 27 q0 5 7 5 h9 q-3 -8 -2 -32 Z" fill={STEGGY.body} />
      {/* long low arched body */}
      <path d="M40 138 Q48 104 92 98 Q140 94 160 116 Q170 132 160 146 Q118 160 66 155 Q44 150 40 138 Z" fill={STEGGY.body} />
      <path d="M64 147 Q110 157 152 145 Q140 154 100 156 Q76 154 64 147 Z" fill={STEGGY.belly} />
      {/* plates along the arch — alternating lime / orange */}
      <path d="M62 108 q-1 -18 11 -21 q7 12 1 23 Z" fill={STEGGY.plate} />
      <path d="M85 99 q1 -20 13 -22 q7 13 -1 24 Z" fill={STEGGY.plateAlt} />
      <path d="M109 96 q4 -19 16 -18 q4 13 -4 22 Z" fill={STEGGY.plate} />
      <path d="M133 100 q6 -16 17 -13 q2 12 -7 19 Z" fill={STEGGY.plateAlt} />
      {/* small head, low and to the right */}
      <path d="M156 120 Q176 112 188 122 Q194 132 186 141 Q172 147 158 141 Z" fill={STEGGY.body} />
      {/* dots */}
      <circle cx="76" cy="128" r="3.2" fill={STEGGY.spot} />
      <circle cx="102" cy="140" r="2.8" fill={STEGGY.spot} />
      <circle cx="128" cy="126" r="3.4" fill={STEGGY.spot} />
      <Face mood={mood} cx={175} cy={129} scale={0.56} />
    </svg>
  );
}

/** BRONTE — the tall one: a long thin neck carrying a small head high up. */
export function Bronte({ mood = "idle" }: DinoProps) {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      {/* tail */}
      <path d="M56 152 Q30 162 8 152 Q30 140 56 138 Z" fill={BRONTE.shade} />
      {/* legs */}
      <path d="M62 160 l-2 22 q0 5 6 5 h9 q-2 -7 -1 -27 Z" fill={BRONTE.shade} />
      <path d="M102 160 l-2 22 q0 5 6 5 h9 q-2 -7 -1 -27 Z" fill={BRONTE.body} />
      {/* modest rounded body */}
      <ellipse cx="86" cy="146" rx="40" ry="26" fill={BRONTE.body} />
      <ellipse cx="88" cy="156" rx="28" ry="13" fill={BRONTE.belly} />
      {/* the long slim neck */}
      <path d="M110 130 Q122 88 124 44 Q125 28 137 26 Q149 26 149 40 Q147 92 131 136 Z" fill={BRONTE.body} />
      {/* small head at the top */}
      <ellipse cx="143" cy="32" rx="17" ry="13" fill={BRONTE.body} />
      {/* dots */}
      <circle cx="72" cy="138" r="3.4" fill={BRONTE.spot} />
      <circle cx="96" cy="146" r="2.8" fill={BRONTE.spot} />
      <circle cx="130" cy="80" r="2.6" fill={BRONTE.spot} />
      <Face mood={mood} cx={145} cy={31} scale={0.5} />
    </svg>
  );
}

/** CERA — head-heavy triceratops: big frill, three cream horns, sturdy legs. */
export function Cera({ mood = "idle" }: DinoProps) {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      {/* tail */}
      <path d="M46 140 Q26 146 14 138 Q28 128 46 128 Z" fill={CERA.shade} />
      {/* legs */}
      <path d="M64 150 l-2 26 q0 5 7 5 h9 q-3 -8 -2 -30 Z" fill={CERA.shade} />
      <path d="M102 152 l-2 24 q0 5 7 5 h9 q-3 -8 -2 -28 Z" fill={CERA.body} />
      {/* compact body */}
      <path d="M42 136 Q50 104 96 102 Q126 102 138 118 L136 148 Q100 160 60 154 Q44 148 42 136 Z" fill={CERA.body} />
      <path d="M66 146 Q104 156 132 146 Q118 155 88 156 Q72 152 66 146 Z" fill={CERA.belly} />
      {/* the frill, behind the head */}
      <circle cx="142" cy="92" r="33" fill={CERA.frillDeep} />
      <circle cx="142" cy="92" r="25" fill={CERA.frill} />
      {/* head + beak in front of the frill */}
      <path d="M132 98 Q160 84 182 98 Q189 111 178 121 Q158 130 140 122 Q129 112 132 98 Z" fill={CERA.body} />
      <path d="M178 102 q11 2 9 13 q-9 4 -15 -3 Z" fill={CERA.horn} />
      {/* horns — two brow, one nose */}
      <path d="M136 84 l-5 -17 l11 8 Z" fill={CERA.horn} />
      <path d="M155 81 l2 -18 l9 13 Z" fill={CERA.horn} />
      <path d="M170 95 l11 -9 l-2 13 Z" fill={CERA.horn} />
      <Face mood={mood} cx={153} cy={105} scale={0.55} />
    </svg>
  );
}

/** SKYE — the flyer: spread wings, a crest, tiny feet tucked up. */
export function Skye({ mood = "idle" }: DinoProps) {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      {/* wings — wide, thin, swept */}
      <path d="M92 98 Q52 60 10 72 Q26 95 58 105 Q78 111 92 106 Z" fill={SKYE.shade} />
      <path d="M108 98 Q148 60 190 72 Q174 95 142 105 Q122 111 108 106 Z" fill={SKYE.shade} />
      <path d="M92 100 Q60 74 24 78 Q42 94 70 103 Q84 107 92 105 Z" fill={SKYE.body} />
      <path d="M108 100 Q140 74 176 78 Q158 94 130 103 Q116 107 108 105 Z" fill={SKYE.body} />
      {/* slim hanging body */}
      <path d="M100 82 Q114 90 112 122 Q110 148 100 154 Q90 148 88 122 Q86 90 100 82 Z" fill={SKYE.body} />
      <ellipse cx="100" cy="126" rx="9" ry="18" fill={SKYE.belly} />
      {/* tucked-up feet */}
      <path d="M94 150 l-5 13 l9 -3 Z" fill={SKYE.shade} />
      <path d="M106 150 l5 13 l-9 -3 Z" fill={SKYE.shade} />
      {/* head, back-swept crest, beak */}
      <ellipse cx="100" cy="64" rx="20" ry="16" fill={SKYE.body} />
      <path d="M110 52 Q130 36 144 41 Q133 56 114 60 Z" fill={SKYE.crest} />
      <path d="M84 66 Q66 68 58 77 Q71 81 86 76 Z" fill={SKYE.beak} />
      <Face mood={mood} cx={101} cy={63} scale={0.55} />
    </svg>
  );
}

/** SAIL — long and low with the big back sail and a thin crocodile snout. */
export function Sail({ mood = "idle" }: DinoProps) {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      {/* the sail */}
      <path d="M48 118 Q56 64 86 55 Q116 47 138 61 Q155 73 158 104 L48 124 Z" fill={SAIL.sail} />
      <path d="M68 114 Q72 78 88 63" stroke={SAIL.shade} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.45" />
      <path d="M92 110 Q96 74 108 61" stroke={SAIL.shade} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.45" />
      <path d="M118 106 Q124 78 132 67" stroke={SAIL.shade} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.45" />
      {/* tail */}
      <path d="M52 138 Q30 146 10 140 Q28 126 50 124 Z" fill={SAIL.shade} />
      {/* legs */}
      <path d="M70 148 l-2 26 q0 5 7 5 h9 q-3 -8 -2 -30 Z" fill={SAIL.shade} />
      <path d="M118 150 l-2 24 q0 5 7 5 h9 q-3 -8 -2 -28 Z" fill={SAIL.body} />
      {/* long low body */}
      <path d="M46 134 Q56 108 100 106 Q142 104 158 120 Q166 134 158 146 Q116 158 68 153 Q48 147 46 134 Z" fill={SAIL.body} />
      <path d="M70 146 Q112 155 150 144 Q134 153 100 154 Q80 152 70 146 Z" fill={SAIL.belly} />
      {/* thin crocodile snout */}
      <path d="M150 114 Q170 104 192 110 Q197 119 189 126 Q168 132 152 126 Z" fill={SAIL.body} />
      <circle cx="188" cy="115" r="1.8" fill={SAIL.shade} />
      <Face mood={mood} cx={161} cy={117} scale={0.5} />
    </svg>
  );
}

/** DAX — a slim biped with the parasaur's back-swept head crest. */
export function Dax({ mood = "idle" }: DinoProps) {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      {/* tail */}
      <path d="M64 130 Q36 145 10 138 Q34 122 60 114 Z" fill={DAX.shade} />
      {/* slim legs */}
      <path d="M76 138 l-5 40 q0 6 8 6 h11 q-4 -10 -2 -46 Z" fill={DAX.shade} />
      <path d="M100 138 l-5 40 q0 6 8 6 h11 q-4 -10 -2 -46 Z" fill={DAX.body} />
      {/* narrow upright body */}
      <path d="M64 132 Q60 96 86 76 Q104 62 116 68 L120 118 Q118 146 90 150 Q68 146 64 132 Z" fill={DAX.body} />
      <path d="M84 100 Q82 130 98 140 Q112 132 114 106 Q100 122 84 100 Z" fill={DAX.belly} />
      {/* small arms */}
      <path d="M108 106 q11 3 14 12 q-9 -2 -14 1 Z" fill={DAX.shade} />
      {/* rounded head with the back-swept crest */}
      <ellipse cx="128" cy="52" rx="25" ry="19" fill={DAX.body} />
      <path d="M118 38 Q96 17 77 20 Q87 38 108 46 Z" fill={DAX.crest} />
      <path d="M147 49 q15 2 17 13 q-11 4 -19 -3 Z" fill={DAX.shade} opacity="0.55" />
      <Face mood={mood} cx={128} cy={52} scale={0.72} />
    </svg>
  );
}

/** The whole cast, in parade order. */
export interface CastMember {
  id: string;
  /** Spoken-style name, for labels: "Toro the T-Rex". */
  name: string;
  Art: (props: DinoProps) => ReactElement;
}

export const CAST: readonly CastMember[] = [
  { id: "toro", name: "Toro the T-Rex", Art: Toro },
  { id: "steggy", name: "Steggy the Stegosaurus", Art: Steggy },
  { id: "bronte", name: "Bronte the Brontosaurus", Art: Bronte },
  { id: "cera", name: "Cera the Triceratops", Art: Cera },
  { id: "skye", name: "Skye the Pteranodon", Art: Skye },
  { id: "sail", name: "Sail the Spinosaurus", Art: Sail },
  { id: "dax", name: "Dax the Parasaurolophus", Art: Dax },
];

/**
 * The fossil ring — a carved stone disc holding the letter the child already
 * knows. The letter is deliberately the largest, highest-contrast thing on the
 * screen: it is the question.
 */
export function FossilRing({ letter }: { letter: string }) {
  const gradId = useId();
  return (
    <div className="dd-ring relative">
      <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id={gradId} cx="38%" cy="32%">
            <stop offset="0%" stopColor="#F3F7FC" />
            <stop offset="100%" stopColor="#B9C6D8" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="94" fill="#5A6E8C" opacity="0.45" />
        <circle cx="100" cy="100" r="86" fill={`url(#${gradId})`} />
        <circle cx="100" cy="100" r="70" fill="#0A1A3A" opacity="0.08" />
        <circle
          cx="100"
          cy="100"
          r="78"
          fill="none"
          stroke="#FF7F00"
          strokeWidth="6"
          strokeDasharray="12 9"
          opacity="0.9"
        />
        {/* little fossil chips around the rim */}
        {[18, 74, 132, 206, 262, 318].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <circle
              key={deg}
              cx={100 + Math.cos(rad) * 88}
              cy={100 + Math.sin(rad) * 88}
              r="5"
              fill="#8B9BB0"
            />
          );
        })}
      </svg>
      {/* The letter is real text, not an SVG <text>: it inherits the product
          font and scales with the ring through one CSS variable. */}
      <span className="dd-ring-letter absolute inset-0 flex items-center justify-center font-rounded font-black">
        {letter}
      </span>
    </div>
  );
}

/**
 * A draggable letter card — a chipped stone tablet. Large, high contrast and
 * comfortably over the 44px touch minimum at every viewport (see the sizing
 * chain in dino-dig.css).
 */
export function LetterStone({ letter }: { letter: string }) {
  return (
    <div className="dd-stone relative flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path
          d="M12 8 L88 5 L96 46 L90 92 L46 96 L8 88 L5 44 Z"
          fill="#DCE5F0"
          stroke="#7C8CA6"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path d="M12 8 L88 5 L92 30 L14 34 Z" fill="#F2F6FB" opacity="0.85" />
        <circle cx="24" cy="76" r="3.5" fill="#B9C6D8" />
        <circle cx="80" cy="70" r="3" fill="#B9C6D8" />
      </svg>
      <span className="dd-stone-letter relative font-rounded font-black">{letter}</span>
    </div>
  );
}
