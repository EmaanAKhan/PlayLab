"use client";

/**
 * Magnet Match characters — hand-drawn SVG in the platform's pastel style,
 * matched to the provided references: a cute round-faced boy chef with a
 * tall white hat and double-breasted coat, a big friendly steel soup pot,
 * and a small owl mascot for the progress bar. Front-facing, preschool
 * proportions, nothing realistic.
 */

/** The chef — the game's mascot. `happy` swaps to a celebrating pose. */
export function ChefArt({ happy = false }: { happy?: boolean }) {
  return (
    <svg viewBox="0 0 200 240" className="h-full w-full" aria-hidden="true">
      {/* tall puffy chef hat */}
      <ellipse cx="100" cy="46" rx="52" ry="34" fill="white" />
      <circle cx="58" cy="52" r="20" fill="white" />
      <circle cx="142" cy="52" r="20" fill="white" />
      <rect x="62" y="62" width="76" height="26" rx="8" fill="#F4F1EA" />
      <path d="M62 66 Q100 58 138 66" stroke="#E3DED2" strokeWidth="2.5" fill="none" />

      {/* hair peeking out */}
      <path d="M60 92 Q56 104 62 112 L70 96 Z" fill="#3B2A20" />
      <path d="M140 92 Q144 104 138 112 L130 96 Z" fill="#3B2A20" />

      {/* face */}
      <circle cx="100" cy="118" r="38" fill="#FFDDBC" />
      {/* ears */}
      <circle cx="62" cy="118" r="8" fill="#FFDDBC" />
      <circle cx="138" cy="118" r="8" fill="#FFDDBC" />
      {/* big friendly eyes */}
      <circle cx="86" cy="112" r="10" fill="white" />
      <circle cx="114" cy="112" r="10" fill="white" />
      <circle cx="87" cy="114" r="5" fill="#2B2B3A" />
      <circle cx="113" cy="114" r="5" fill="#2B2B3A" />
      <circle cx="89" cy="112" r="1.8" fill="white" />
      <circle cx="115" cy="112" r="1.8" fill="white" />
      {/* brows */}
      <path d="M78 100 Q86 96 94 99" stroke="#3B2A20" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M106 99 Q114 96 122 100" stroke="#3B2A20" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* rosy cheeks */}
      <ellipse cx="74" cy="126" rx="7" ry="4.5" fill="#FF9EBC" opacity="0.6" />
      <ellipse cx="126" cy="126" rx="7" ry="4.5" fill="#FF9EBC" opacity="0.6" />
      {/* open happy smile */}
      {happy ? (
        <path d="M86 132 Q100 148 114 132 Q100 154 86 132 Z" fill="#8A4A3A" />
      ) : (
        <path d="M88 132 Q100 144 112 132 Q100 150 88 132 Z" fill="#8A4A3A" />
      )}
      <path d="M92 139 Q100 146 108 139 L106 142 Q100 147 94 142 Z" fill="#E8746A" />

      {/* double-breasted coat */}
      <path d="M58 158 Q100 146 142 158 L150 226 Q100 238 50 226 Z" fill="white" />
      <path d="M58 158 Q100 146 142 158 L140 172 Q100 160 60 172 Z" fill="#F4F1EA" />
      <circle cx="86" cy="186" r="4" fill="#D9D2C2" />
      <circle cx="114" cy="186" r="4" fill="#D9D2C2" />
      <circle cx="86" cy="206" r="4" fill="#D9D2C2" />
      <circle cx="114" cy="206" r="4" fill="#D9D2C2" />

      {/* arms: one waving (or raised in celebration), one holding a ladle */}
      <g transform={happy ? "rotate(-18 52 176)" : undefined}>
        <path d="M58 168 Q34 158 26 138 Q38 132 48 140 Q58 150 64 164 Z" fill="white" />
        <circle cx="28" cy="134" r="10" fill="#FFDDBC" />
      </g>
      <path d="M142 168 Q160 176 162 196 Q150 200 142 190 Z" fill="white" />
      {/* ladle */}
      <rect x="156" y="150" width="6" height="46" rx="3" fill="#8B6547" transform="rotate(14 159 173)" />
      <ellipse cx="170" cy="200" rx="12" ry="9" fill="#A5B2BE" />
    </svg>
  );
}

/** Big friendly steel soup pot; children render inside via the slot layer. */
export function SoupPot() {
  return (
    <svg viewBox="0 0 260 240" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
      {/* handles */}
      <path d="M8 66 Q-4 78 8 92 L26 86 L26 72 Z" fill="#8C99A6" />
      <path d="M252 66 Q264 78 252 92 L234 86 L234 72 Z" fill="#8C99A6" />
      {/* body */}
      <path d="M22 52 L28 214 Q30 232 130 232 Q230 232 232 214 L238 52 Z" fill="#C3CDD6" />
      <path d="M22 52 L28 214 Q29 226 74 230 L66 52 Z" fill="#D5DEE6" />
      <path d="M238 52 L232 214 Q231 224 196 229 L204 52 Z" fill="#AAB6C1" />
      {/* rim */}
      <ellipse cx="130" cy="52" rx="108" ry="22" fill="#8C99A6" />
      {/* soup surface */}
      <ellipse cx="130" cy="52" rx="94" ry="16" fill="#F2B84D" />
      <ellipse cx="102" cy="48" rx="16" ry="4.5" fill="#F8CE7E" />
      <ellipse cx="160" cy="55" rx="11" ry="3.5" fill="#F8CE7E" />
    </svg>
  );
}

/** Small owl mascot — perches by the progress bar, hops when it advances. */
export function OwlArt() {
  return (
    <svg viewBox="0 0 60 60" className="h-full w-full" aria-hidden="true">
      <ellipse cx="30" cy="34" rx="22" ry="23" fill="#E8B33D" />
      <path d="M12 18 Q8 8 18 12 Z" fill="#C08A2D" />
      <path d="M48 18 Q52 8 42 12 Z" fill="#C08A2D" />
      <ellipse cx="30" cy="42" rx="13" ry="12" fill="#F8E3B0" />
      <circle cx="22" cy="28" r="8.5" fill="white" />
      <circle cx="38" cy="28" r="8.5" fill="white" />
      <circle cx="23" cy="29" r="4" fill="#2B2B3A" />
      <circle cx="37" cy="29" r="4" fill="#2B2B3A" />
      <circle cx="24.5" cy="27.5" r="1.4" fill="white" />
      <circle cx="38.5" cy="27.5" r="1.4" fill="white" />
      <path d="M27 36 L30 41 L33 36 Z" fill="#E8863D" />
    </svg>
  );
}
