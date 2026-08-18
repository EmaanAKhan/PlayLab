"use client";

import { ALPHABET } from "@games/dino-dig/constants/rounds";

interface AlphabetStripProps {
  /** Highest alphabet index dug up so far (-1 before anything). */
  revealedIndex: number;
  /** The letter on the fossil ring — glows orange. */
  current: string;
  /** Letters currently being played for — outlined until placed. */
  targets: readonly string[];
  /** Letters dropped into a site this round, even if out of order. */
  placed: readonly string[];
}

/**
 * The stone alphabet bar across the top: a…z, carved tiles that light up as the
 * child digs the alphabet out of the ground.
 *
 * It WRAPS rather than squeezing 26 tiles onto one line. A single row on a
 * 360px phone would force ~11px tiles — a progress ribbon nobody can read.
 * Wrapping keeps every tile legible and makes horizontal overflow impossible
 * at any width, which is the constraint that actually matters here.
 */
export function AlphabetStrip({ revealedIndex, current, targets, placed }: AlphabetStripProps) {
  const dug = revealedIndex + 1;

  return (
    <div
      className="dd-strip flex flex-wrap items-center justify-center gap-[2px] sm:gap-1"
      role="img"
      aria-label={`${dug} of ${ALPHABET.length} letters collected`}
    >
      {ALPHABET.map((letter, i) => {
        const isCurrent = letter === current;
        const isDug = i <= revealedIndex || placed.includes(letter);
        const isTarget = !isCurrent && !isDug && targets.includes(letter);

        const tone = isCurrent
          ? "dd-tile--current"
          : isTarget
          ? "dd-tile--target"
          : isDug
          ? "dd-tile--dug"
          : "dd-tile--pending";

        return (
          <span key={letter} className={`dd-tile ${tone}`} aria-hidden="true">
            {letter.toLowerCase()}
          </span>
        );
      })}
    </div>
  );
}
