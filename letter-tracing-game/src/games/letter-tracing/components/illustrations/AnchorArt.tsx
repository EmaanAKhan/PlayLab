"use client";

/**
 * AnchorArt — 26 handcrafted pastel SVG illustrations, one per anchor word
 * (A apple, B ball, … Z zebra). Same rounded, friendly, soft-pastel visual
 * language as the rest of the game. Each is a pure, stateless component on a
 * 100×100 viewBox so the card can size them freely without distortion.
 */

import {
  Cat, Dog, Fish, Lion, Nest, Octopus, Rabbit, Zebra,
} from "@shared/components/illustrations/AnimalArt";

type Art = () => React.ReactElement;

const Apple: Art = () => (
  <svg viewBox="0 0 100 100">
    <path d="M50 30 Q52 18 60 14" stroke="#8B6F47" strokeWidth="5" fill="none" strokeLinecap="round" />
    <ellipse cx="66" cy="20" rx="10" ry="6" fill="#6ECF9A" transform="rotate(-24 66 20)" />
    <path d="M50 34 Q26 26 20 50 Q16 74 38 84 Q50 89 62 84 Q84 74 80 50 Q74 26 50 34 Z" fill="#FF8FA3" />
    <path d="M38 42 Q32 46 32 56" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.55" />
  </svg>
);

const Ball: Art = () => (
  <svg viewBox="0 0 100 100">
    <circle cx="50" cy="52" r="34" fill="#74B9FF" />
    <path d="M16 52 Q50 32 84 52" stroke="white" strokeWidth="6" fill="none" opacity="0.8" />
    <path d="M16 52 Q50 72 84 52" stroke="#FFD93D" strokeWidth="6" fill="none" opacity="0.9" />
    <circle cx="38" cy="40" r="7" fill="white" opacity="0.5" />
  </svg>
);



const Egg: Art = () => (
  <svg viewBox="0 0 100 100">
    <path d="M50 14 Q76 40 76 62 Q76 88 50 88 Q24 88 24 62 Q24 40 50 14 Z" fill="#FFF6E5" stroke="#F2DDB8" strokeWidth="3" />
    <ellipse cx="41" cy="42" rx="8" ry="12" fill="white" opacity="0.85" transform="rotate(-18 41 42)" />
  </svg>
);


const Goat: Art = () => (
  <svg viewBox="0 0 100 100">
    <path d="M32 26 Q26 14 32 8 M68 26 Q74 14 68 8" stroke="#B8AED0" strokeWidth="6" fill="none" strokeLinecap="round" />
    <ellipse cx="26" cy="42" rx="7" ry="12" fill="#E8E2F5" transform="rotate(26 26 42)" />
    <ellipse cx="74" cy="42" rx="7" ry="12" fill="#E8E2F5" transform="rotate(-26 74 42)" />
    <path d="M50 24 Q72 26 72 52 Q72 78 50 82 Q28 78 28 52 Q28 26 50 24 Z" fill="#F4F0FA" />
    <circle cx="41" cy="48" r="4" fill="#3D3D5C" />
    <circle cx="59" cy="48" r="4" fill="#3D3D5C" />
    <ellipse cx="50" cy="66" rx="10" ry="8" fill="#E8DFF5" />
    <circle cx="46" cy="65" r="2" fill="#8A7BA8" />
    <circle cx="54" cy="65" r="2" fill="#8A7BA8" />
    <path d="M50 78 Q50 88 46 92" stroke="#DED4EF" strokeWidth="5" fill="none" strokeLinecap="round" />
  </svg>
);

const Hat: Art = () => (
  <svg viewBox="0 0 100 100">
    <ellipse cx="50" cy="66" rx="38" ry="10" fill="#F2C94C" />
    <path d="M28 64 Q28 26 50 26 Q72 26 72 64 Z" fill="#FFD93D" />
    <path d="M28 58 Q50 66 72 58 L72 64 Q50 72 28 64 Z" fill="#FF8FA3" />
    <circle cx="64" cy="60" r="3.5" fill="white" opacity="0.8" />
  </svg>
);

const Igloo: Art = () => (
  <svg viewBox="0 0 100 100">
    <path d="M14 70 Q14 32 50 32 Q86 32 86 70 Z" fill="#EAF6FF" stroke="#C9E2F5" strokeWidth="3" />
    <path d="M30 70 Q30 50 50 50 Q70 50 70 70" stroke="#C9E2F5" strokeWidth="3" fill="none" />
    <path d="M25 51 L75 51 M20 61 L80 61 M38 41 L62 41" stroke="#C9E2F5" strokeWidth="3" strokeLinecap="round" />
    <path d="M40 70 Q40 54 50 54 Q60 54 60 70 Z" fill="#9ECDEF" />
    <ellipse cx="50" cy="74" rx="42" ry="5" fill="#DDEFFB" />
  </svg>
);

const Jam: Art = () => (
  <svg viewBox="0 0 100 100">
    <rect x="28" y="30" width="44" height="52" rx="10" fill="#F7D9E4" />
    <rect x="30" y="46" width="40" height="34" rx="8" fill="#E86A8A" opacity="0.85" />
    <rect x="24" y="20" width="52" height="14" rx="6" fill="#B9A7E8" />
    <circle cx="44" cy="58" r="3" fill="#C14C68" />
    <circle cx="58" cy="66" r="3" fill="#C14C68" />
    <circle cx="49" cy="72" r="2.4" fill="#C14C68" />
    <rect x="36" y="38" width="12" height="5" rx="2.5" fill="white" opacity="0.6" />
  </svg>
);

const Kite: Art = () => (
  <svg viewBox="0 0 100 100">
    <path d="M50 8 L76 40 L50 66 L24 40 Z" fill="#A882E8" />
    <path d="M50 8 L50 66 M24 40 L76 40" stroke="white" strokeWidth="3" opacity="0.6" />
    <path d="M50 66 Q46 78 52 84 Q58 90 54 96" stroke="#8A7BA8" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    <path d="M46 76 L54 74 M50 88 L58 86" stroke="#FF9EBC" strokeWidth="4" strokeLinecap="round" />
  </svg>
);


const Moon: Art = () => (
  <svg viewBox="0 0 100 100">
    <path d="M62 12 Q34 20 34 50 Q34 80 62 88 Q40 92 26 74 Q12 54 24 32 Q34 14 62 12 Z" fill="#FFE79C" />
    <circle cx="76" cy="26" r="3" fill="#FFD93D" />
    <circle cx="84" cy="46" r="2.4" fill="#FFD93D" />
    <circle cx="78" cy="66" r="3" fill="#FFD93D" />
  </svg>
);



const Pig: Art = () => (
  <svg viewBox="0 0 100 100">
    <path d="M30 30 L24 18 L38 24 Z" fill="#F5A8BC" />
    <path d="M70 30 L76 18 L62 24 Z" fill="#F5A8BC" />
    <circle cx="50" cy="52" r="30" fill="#FFC2D1" />
    <circle cx="40" cy="45" r="4" fill="#3D3D5C" />
    <circle cx="60" cy="45" r="4" fill="#3D3D5C" />
    <ellipse cx="50" cy="60" rx="11" ry="8" fill="#F79FB6" />
    <circle cx="46" cy="60" r="2.4" fill="#C96A85" />
    <circle cx="54" cy="60" r="2.4" fill="#C96A85" />
  </svg>
);

const Queen: Art = () => (
  <svg viewBox="0 0 100 100">
    <path d="M22 62 L18 30 L34 44 L50 22 L66 44 L82 30 L78 62 Z" fill="#FFD93D" />
    <rect x="22" y="62" width="56" height="12" rx="5" fill="#F2C94C" />
    <circle cx="50" cy="22" r="5" fill="#FF8FA3" />
    <circle cx="18" cy="30" r="4" fill="#74B9FF" />
    <circle cx="82" cy="30" r="4" fill="#74B9FF" />
    <circle cx="36" cy="68" r="3" fill="#A882E8" />
    <circle cx="50" cy="68" r="3" fill="#FF8FA3" />
    <circle cx="64" cy="68" r="3" fill="#A882E8" />
  </svg>
);


const Sun: Art = () => (
  <svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="22" fill="#FFD93D" />
    {Array.from({ length: 10 }).map((_, i) => {
      const a = (i * Math.PI) / 5;
      return (
        <line
          key={i}
          x1={50 + Math.cos(a) * 30}
          y1={50 + Math.sin(a) * 30}
          x2={50 + Math.cos(a) * 42}
          y2={50 + Math.sin(a) * 42}
          stroke="#FFD93D"
          strokeWidth="6"
          strokeLinecap="round"
        />
      );
    })}
    <circle cx="43" cy="47" r="3" fill="#E8A33D" />
    <circle cx="57" cy="47" r="3" fill="#E8A33D" />
    <path d="M44 56 Q50 61 56 56" stroke="#E8A33D" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

const Tiger: Art = () => (
  <svg viewBox="0 0 100 100">
    <circle cx="30" cy="28" r="9" fill="#F4A73E" />
    <circle cx="70" cy="28" r="9" fill="#F4A73E" />
    <circle cx="50" cy="52" r="30" fill="#F8B25C" />
    <path d="M30 38 Q35 44 33 50 M70 38 Q65 44 67 50 M50 22 L50 32" stroke="#C77B3F" strokeWidth="5" strokeLinecap="round" />
    <circle cx="40" cy="48" r="4" fill="#3D3D5C" />
    <circle cx="60" cy="48" r="4" fill="#3D3D5C" />
    <ellipse cx="50" cy="60" rx="9" ry="7" fill="#FFE0B8" />
    <ellipse cx="50" cy="57" rx="4" ry="3" fill="#C77B3F" />
  </svg>
);

const Umbrella: Art = () => (
  <svg viewBox="0 0 100 100">
    <path d="M14 48 Q14 16 50 16 Q86 16 86 48 Q80 42 72 48 Q64 42 57 48 Q50 42 43 48 Q36 42 28 48 Q20 42 14 48 Z" fill="#FF8FA3" />
    <path d="M50 16 Q30 22 26 46 M50 16 Q70 22 74 46" stroke="white" strokeWidth="3" fill="none" opacity="0.5" />
    <path d="M50 48 L50 78 Q50 88 42 88 Q36 88 36 81" stroke="#8A7BA8" strokeWidth="5" fill="none" strokeLinecap="round" />
  </svg>
);

const Van: Art = () => (
  <svg viewBox="0 0 100 100">
    <path d="M14 62 L14 42 Q14 34 24 34 L58 34 Q64 34 68 40 L80 40 Q86 42 86 50 L86 62 Z" fill="#8FD6A8" />
    <rect x="22" y="40" width="14" height="12" rx="3" fill="#EAF6FF" />
    <rect x="42" y="40" width="14" height="12" rx="3" fill="#EAF6FF" />
    <rect x="66" y="44" width="12" height="9" rx="3" fill="#EAF6FF" />
    <circle cx="30" cy="64" r="8" fill="#5C6672" />
    <circle cx="70" cy="64" r="8" fill="#5C6672" />
    <circle cx="30" cy="64" r="3.4" fill="#C9D2DC" />
    <circle cx="70" cy="64" r="3.4" fill="#C9D2DC" />
  </svg>
);

const Water: Art = () => (
  <svg viewBox="0 0 100 100">
    <path d="M50 12 Q76 46 76 62 Q76 86 50 86 Q24 86 24 62 Q24 46 50 12 Z" fill="#8FD0FF" />
    <path d="M38 58 Q34 64 36 70" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.7" />
    <path d="M12 94 Q25 88 38 94 Q51 100 64 94 Q77 88 90 94" stroke="#74B9FF" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />
  </svg>
);

const Box: Art = () => (
  <svg viewBox="0 0 100 100">
    <rect x="22" y="40" width="56" height="42" rx="6" fill="#DBA974" />
    <rect x="16" y="30" width="68" height="14" rx="5" fill="#C89B6E" />
    <rect x="46" y="30" width="8" height="52" fill="#FFD93D" opacity="0.85" />
    <path d="M40 30 Q50 16 50 30 Q50 16 60 30" stroke="#FFD93D" strokeWidth="5" fill="none" strokeLinecap="round" />
  </svg>
);

const YoYo: Art = () => (
  <svg viewBox="0 0 100 100">
    <path d="M50 14 Q68 20 62 44" stroke="#B8AED0" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    <circle cx="50" cy="62" r="26" fill="#FF8FA3" />
    <circle cx="50" cy="62" r="16" fill="#FFC2D1" />
    <circle cx="50" cy="62" r="6" fill="white" />
    <path d="M30 44 Q40 38 50 40" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.6" />
  </svg>
);


/** Registry keyed by UPPERCASE letter */
export const ANCHOR_ART: Record<string, Art> = {
  A: Apple, B: Ball, C: Cat, D: Dog, E: Egg, F: Fish, G: Goat, H: Hat,
  I: Igloo, J: Jam, K: Kite, L: Lion, M: Moon, N: Nest, O: Octopus,
  P: Pig, Q: Queen, R: Rabbit, S: Sun, T: Tiger, U: Umbrella, V: Van,
  W: Water, X: Box, Y: YoYo, Z: Zebra,
};
