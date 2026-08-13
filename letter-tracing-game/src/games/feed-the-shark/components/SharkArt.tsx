"use client";

import { useId } from "react";

/**
 * Front-facing friendly shark + little fish — matched to the classic
 * worksheet layout: letter card sitting on the dorsal fin, googly eyes on
 * top, and a BIG open mouth (the drop target) ringed with small rounded
 * teeth. Cartoon-cute, never scary. Inline SVG in the same handcrafted
 * style as the platform's other art (AnimalArt, PennyArt).
 */

const BODY = "#8FC6EA";
const DARK = "#5D9EC9";
const MOUTH = "#4A2C3E";
const THROAT = "#7A4A63";

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
  // Small rounded teeth: one zigzag ring along the top lip pointing down,
  // one along the bottom lip pointing up. strokeLinejoin round keeps every
  // point soft.
  const topTeeth = "M56 124 " + Array.from({ length: 8 }, () => "l5.5 10 l5.5 -10").join(" ");
  const bottomTeeth = "M62 166 " + Array.from({ length: 7 }, () => "l5.4 -9 l5.4 9").join(" ");

  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      {/* dorsal fin */}
      <path d="M100 36 L78 76 L122 76 Z" fill={DARK} />
      {/* letter card perched on the fin */}
      <rect x="70" y="4" width="60" height="46" rx="9" fill="white" stroke={DARK} strokeWidth="3" />
      <text
        x="100" y="30"
        textAnchor="middle" dominantBaseline="central"
        fontSize="32" fontWeight="900" fill="#2980B9"
        style={{ fontFamily: "Nunito, sans-serif" }}
      >
        {letter}
      </text>

      {/* side fins */}
      <path d="M20 132 Q2 148 6 166 Q28 158 36 144 Z" fill={DARK} />
      <path d="M180 132 Q198 148 194 166 Q172 158 164 144 Z" fill={DARK} />

      {/* head / body */}
      <ellipse cx="100" cy="134" rx="86" ry="62" fill={BODY} />
      {/* soft belly light at the bottom */}
      <path d="M28 158 Q100 202 172 158 Q140 190 100 190 Q60 190 28 158 Z" fill="#EAF6FF" opacity="0.7" />

      {/* googly eyes on top, peeking at the mouth */}
      <circle cx="74" cy="94" r="14" fill="white" />
      <circle cx="126" cy="94" r="14" fill="white" />
      <circle cx="77" cy="98" r="6.2" fill="#3B3B4F" />
      <circle cx="123" cy="98" r="6.2" fill="#3B3B4F" />
      <circle cx="79" cy="95.5" r="2" fill="white" />
      <circle cx="125" cy="95.5" r="2" fill="white" />

      {/* rosy cheeks */}
      <ellipse cx="42" cy="122" rx="8" ry="5" fill="#FF9EBC" opacity="0.5" />
      <ellipse cx="158" cy="122" rx="8" ry="5" fill="#FF9EBC" opacity="0.5" />

      {/* the BIG open mouth — the feed target */}
      <defs>
        {/* teeth are clipped to the mouth so they can never spill onto the
            cheeks — the zigzag rows only exist inside the mouth opening */}
        <clipPath id={mouthClipId}>
          <ellipse cx="100" cy="146" rx="52" ry="34" />
        </clipPath>
      </defs>
      <ellipse cx="100" cy="146" rx="52" ry="34" fill={MOUTH} />
      <ellipse cx="100" cy="151" rx="40" ry="24" fill={THROAT} />
      {/* fed fish snapped inside */}
      {fedLower && (
        <g transform="translate(100 149)">
          <ellipse cx="0" cy="0" rx="17" ry="11.5" fill="#FFB84D" />
          <path d="M15 0 L26 -8 L26 8 Z" fill="#F2913D" />
          <circle cx="-9" cy="-3" r="3" fill="white" />
          <circle cx="-9.5" cy="-2.6" r="1.5" fill="#3B3B4F" />
          <text
            x="2" y="1"
            textAnchor="middle" dominantBaseline="central"
            fontSize="14" fontWeight="900" fill="#7A4A12"
            style={{ fontFamily: "Nunito, sans-serif" }}
          >
            {fedLower}
          </text>
        </g>
      )}
      {/* rounded teeth rings — clipped to the mouth opening */}
      <g clipPath={`url(#${mouthClipId})`}>
        <path d={topTeeth} fill="white" stroke="white" strokeWidth="2" strokeLinejoin="round" />
        <path d={bottomTeeth} fill="white" stroke="white" strokeWidth="2" strokeLinejoin="round" />
      </g>
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
        fontSize="30" fontWeight="900" fill={c.text}
        style={{ fontFamily: "Nunito, sans-serif" }}
      >
        {letter}
      </text>
    </svg>
  );
}
