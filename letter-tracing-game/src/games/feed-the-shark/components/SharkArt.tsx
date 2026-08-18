"use client";

/**
 * The shark is a user-supplied image (public/games/feed-the-shark/shark.png)
 * with the game's functional bits — the uppercase letter card and the
 * fed-fish-in-mouth feedback — overlaid in the art's original 200×210
 * coordinate space so they scale with the image everywhere it appears.
 * LetterFish below is still the platform's handcrafted inline SVG.
 */

export function FriendlyShark({
  letter,
  fedLower,
}: {
  letter: string;
  /** When set, this lowercase letter's fish is shown snapped in the mouth */
  fedLower?: string;
}) {
  return (
    <div className="relative h-full w-full" aria-hidden="true">
      {/* ── YOUR SHARK IMAGE ──
          Drop the file at  public/games/feed-the-shark/shark.png  (or change
          the src below to match your filename). object-contain keeps its
          aspect ratio at every size the game renders it (splash, level,
          finale). eslint-disable: a local /public asset in a fixed-size box
          gains nothing from next/image optimization. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/games/feed-the-shark/shark.png"
        alt=""
        className="h-full w-full object-contain"
        draggable={false}
      />

      {/* Overlays live in ONE svg with the art's original 200×210 coordinate
          space, so they scale exactly with the image at every size. Nudge the
          x/y numbers below to sit them on YOUR image's fin and mouth. */}
      <svg viewBox="0 0 200 210" className="absolute inset-0 h-full w-full">
        {/* the uppercase letter card the fish must match — top-center */}
        <rect x="70" y="2" width="60" height="44" rx="9" fill="white" stroke="#3E7FC4" strokeWidth="3" />
        <text x="100" y="26" textAnchor="middle" dominantBaseline="central" fontSize="31" fontWeight="900" fill="#2980B9" fontFamily="Nunito, sans-serif">
          {letter}
        </text>

        {/* the fish that was just fed — sits over the mouth area */}
        {fedLower && (
          <g transform="translate(100 150)">
            <ellipse cx="0" cy="0" rx="17" ry="11.5" fill="#FFB84D" />
            <path d="M15 0 L26 -8 L26 8 Z" fill="#F2913D" />
            <circle cx="-9" cy="-3" r="3" fill="white" />
            <circle cx="-9.5" cy="-2.6" r="1.5" fill="#3B3B4F" />
            <text x="2" y="1" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="900" fill="#7A4A12" fontFamily="Nunito, sans-serif">
              {fedLower}
            </text>
          </g>
        )}
      </svg>
    </div>
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