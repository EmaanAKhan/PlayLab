"use client";

import { useId } from "react";

/**
 * Front-facing friendly shark + little fish — matched to the classic
 * worksheet layout: letter card sitting on the dorsal fin, googly eyes on
 * top, and a BIG open mouth (the drop target) ringed with small rounded
 * teeth. Cartoon-cute, never scary. Inline SVG in the same handcrafted
 * style as the platform's other art (AnimalArt, PennyArt).
 */

const BODY = "#57A7E3";
const DARK = "#3E7FC4";

export function FriendlyShark({
  letter,
  fedLower,
}: {
  letter: string;
  /** When set, this lowercase letter's fish is drawn snapped inside the mouth */
  fedLower?: string;
}) {
  // Unique per instance — two sharks render at once, ids must not collide
  const mouthClipId = useId();
  // Small, even, cartoon teeth built INTO the white smile band (like the
  // reference) — not floating rings in a dark hole. 8 up top, 7 below.
  const topTeeth = "M52 127 " + Array.from({ length: 8 }, () => "l6 10.5 l6 -10.5").join(" ");
  const bottomTeeth = "M58 170 " + Array.from({ length: 7 }, () => "l6 -9.5 l6 9.5").join(" ");

  return (
    <svg viewBox="0 0 200 210" className="h-full w-full" aria-hidden="true">
      {/* dorsal fin + letter card perched on it */}
      <path d="M100 40 L80 76 L120 76 Z" fill={DARK} />
      <rect x="70" y="2" width="60" height="44" rx="9" fill="white" stroke={DARK} strokeWidth="3" />
      <text x="100" y="26" textAnchor="middle" dominantBaseline="central" fontSize="31" fontWeight="900" fill="#2980B9" fontFamily="Nunito, sans-serif">
        {letter}
      </text>

      {/* soft rounded side fins, angled up-and-out (drawn first so the head
          overlaps their base) */}
      <path d="M40 138 Q10 128 8 106 Q34 112 46 130 Q45 136 40 138 Z" fill={DARK} />
      <path d="M160 138 Q190 128 192 106 Q166 112 154 130 Q155 136 160 138 Z" fill={DARK} />

      {/* one big ROUND head — the whole character is the head, like the
          reference; no long predator silhouette */}
      <circle cx="100" cy="120" r="76" fill={BODY} />
      {/* faint hexagon skin pattern on the forehead (reference detail) */}
      <g stroke="white" strokeWidth="1.5" fill="none" opacity="0.12">
        <path d="M92 56 l8 -5 8 5 0 9 -8 5 -8 -5 Z" />
        <path d="M74 66 l8 -5 8 5 0 9 -8 5 -8 -5 Z" />
        <path d="M110 66 l8 -5 8 5 0 9 -8 5 -8 -5 Z" />
      </g>

      {/* rosy cheeks */}
      <ellipse cx="36" cy="118" rx="8" ry="5.5" fill="#FF9EBC" opacity="0.55" />
      <ellipse cx="164" cy="118" rx="8" ry="5.5" fill="#FF9EBC" opacity="0.55" />

      {/* ── the SMILE: a wide white band with upturned corners; teeth are
             part of the band; warm red interior with a tongue. Big enough
             that the fed fish visibly sits INSIDE the mouth. ── */}
      <path d="M32 122 Q100 98 168 122 Q178 158 146 176 Q100 190 54 176 Q22 158 32 122 Z" fill="white" />
      <defs>
        <clipPath id={mouthClipId}>
          <path d="M44 128 Q100 110 156 128 Q163 154 138 168 Q100 179 62 168 Q37 154 44 128 Z" />
        </clipPath>
      </defs>
      <path d="M44 128 Q100 110 156 128 Q163 154 138 168 Q100 179 62 168 Q37 154 44 128 Z" fill="#A63A4E" />
      <g clipPath={`url(#${mouthClipId})`}>
        <ellipse cx="100" cy="163" rx="26" ry="10" fill="#D96C7B" />
        {fedLower && (
          <g transform="translate(100 146)">
            <ellipse cx="0" cy="0" rx="17" ry="11.5" fill="#FFB84D" />
            <path d="M15 0 L26 -8 L26 8 Z" fill="#F2913D" />
            <circle cx="-9" cy="-3" r="3" fill="white" />
            <circle cx="-9.5" cy="-2.6" r="1.5" fill="#3B3B4F" />
            <text x="2" y="1" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="900" fill="#7A4A12" fontFamily="Nunito, sans-serif">
              {fedLower}
            </text>
          </g>
        )}
        <path d={topTeeth} fill="white" stroke="white" strokeWidth="2" strokeLinejoin="round" />
        <path d={bottomTeeth} fill="white" stroke="white" strokeWidth="2" strokeLinejoin="round" />
      </g>

      {/* ENORMOUS friendly eyes — the reference's whole charm: big whites,
          big pupils, BIG highlights */}
      <circle cx="72" cy="93" r="21" fill="white" />
      <circle cx="128" cy="93" r="21" fill="white" />
      <circle cx="75" cy="96" r="11.5" fill="#2B2B3A" />
      <circle cx="125" cy="96" r="11.5" fill="#2B2B3A" />
      <circle cx="79" cy="91" r="4.5" fill="white" />
      <circle cx="129" cy="91" r="4.5" fill="white" />
      <circle cx="71" cy="100" r="2" fill="white" />
      <circle cx="121" cy="100" r="2" fill="white" />
      {/* soft raised brow dashes — curiosity, never a squint */}
      <path d="M58 68 Q70 62 82 66" stroke={DARK} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M118 66 Q130 62 142 68" stroke={DARK} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5" />
      {/* tiny nostril dots */}
      <circle cx="94" cy="112" r="1.8" fill={DARK} opacity="0.5" />
      <circle cx="106" cy="112" r="1.8" fill={DARK} opacity="0.5" />
    </svg>
  );
}

const FISH_COLORS = [
  { body: "#FFB84D", tail: "#F2913D", text: "#7A4A12" },
  { body: "#FF9EBC", tail: "#E85D9E", text: "#8A2B5C" },
  { body: "#8FD6A8", tail: "#3DAA72", text: "#1E5C3C" },
  { body: "#C9A9F5", tail: "#7C4DBE", text: "#4A2B7A" },
] as const;

/** Small colorful fish carrying a lowercase letter — the draggable piece. */
export function LetterFish({ letter, colorIndex = 0 }: { letter: string; colorIndex?: number }) {
  const c = FISH_COLORS[colorIndex % FISH_COLORS.length];
  return (
    <svg viewBox="0 0 100 70" className="h-full w-full" aria-hidden="true">
      <path d="M76 35 L96 20 L96 50 Z" fill={c.tail} />
      <ellipse cx="44" cy="35" rx="40" ry="27" fill={c.body} />
      <path d="M38 8 Q48 2 54 10 Q48 16 40 16 Z" fill={c.tail} />
      <circle cx="20" cy="28" r="6" fill="white" />
      <circle cx="19" cy="29" r="3" fill="#3B3B4F" />
      <path d="M10 42 Q14 46 20 45" stroke="#7A4A12" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6" />
      <text
        x="48" y="38"
        textAnchor="middle" dominantBaseline="central"
        fontSize="34" fontWeight="900" fill={c.text}
        fontFamily="Nunito, sans-serif"
      >
        {letter}
      </text>
    </svg>
  );
}
