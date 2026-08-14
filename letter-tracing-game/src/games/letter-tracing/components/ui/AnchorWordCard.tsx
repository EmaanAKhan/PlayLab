"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ANCHOR_ART } from "@games/letter-tracing/components/illustrations/AnchorArt";
import { getLetterWord } from "@games/letter-tracing/constants/phonics";

export type AnchorMode = "hidden" | "hero" | "docked";

/** Real object photos live at public/games/letter-tracing/objects/<word>.jpg
 *  (lowercase, spaces → dashes: apple.jpg, yo-yo.jpg). Drop files in one at
 *  a time — any letter without a photo falls back to its pastel SVG art. */
function objectPhotoPath(word: string): string {
  return `/games/letter-tracing/objects/${word.toLowerCase().replace(/\s+/g, "-")}.jpg`;
}

interface AnchorWordCardProps {
  /** The letter whose anchor word is being shown ("B" → ball 🖼️) */
  letter: string;
  /** hero = big and centered while the word is spoken;
   *  docked = large, on the RIGHT edge, overlapping the tracing board with a
   *  playful tilt — a big decorative object, not a shrunken thumbnail */
  mode: AnchorMode;
}

/**
 * The anchor-word picture ("ball" + a real photo when available).
 * Appears big and centered exactly when the word is spoken (hero), then
 * glides to the right side and STAYS LARGE — floating over the edge of the
 * tracing container at a slight diagonal, like a big sticker beside the
 * board. Purely visual: pointer-events none, so it can never block tracing.
 */
export function AnchorWordCard({ letter, mode }: AnchorWordCardProps) {
  const key = letter.toUpperCase();
  const Art = ANCHOR_ART[key];
  const word = getLetterWord(letter);

  // Photo-first with silent SVG fallback; failure resets per letter so one
  // missing jpg never forces later letters onto the fallback.
  const [photoFailed, setPhotoFailed] = useState(false);
  useEffect(() => setPhotoFailed(false), [key]);

  if (!word || (!Art && photoFailed)) return null;

  const docked = mode === "docked";
  const imgSize = docked
    ? "clamp(110px, 24vmin, 200px)" // stays LARGE when docked
    : "clamp(140px, 32vmin, 260px)";

  return (
    <div
      className="pointer-events-none absolute z-20 flex"
      style={{
        // hero: centered over the board; docked: hugging the right edge,
        // overlapping the board's frame slightly (negative right inset)
        top: docked ? "max(72px, 13%)" : "max(64px, 11%)",
        left: docked ? "auto" : 12,
        right: docked ? "clamp(-14px, -1.2vmin, -6px)" : 12,
        justifyContent: docked ? "flex-end" : "center",
      }}
    >
      <AnimatePresence>
        {mode !== "hidden" && (
          <motion.div
            layout
            className="flex flex-col items-center rounded-3xl bg-white/95 shadow-lg"
            style={{
              gap: docked ? 4 : 6,
              padding: docked ? "10px 12px 8px" : "16px 20px 12px",
            }}
            initial={{ scale: 0.6, opacity: 0, y: 14, rotate: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
              // slight diagonal tilt when docked — playful, organic
              rotate: docked ? 7 : 0,
            }}
            exit={{ scale: 0.85, opacity: 0, y: -8 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 24,
              layout: { type: "spring", stiffness: 190, damping: 26 },
            }}
            role="img"
            aria-label={`${word} — the word for the letter ${letter}`}
          >
            <motion.div
              layout
              className="flex items-center justify-center overflow-hidden rounded-2xl"
              style={{ width: imgSize, height: imgSize }}
            >
              {!photoFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={key}
                  src={objectPhotoPath(word)}
                  alt=""
                  className="h-full w-full rounded-2xl object-cover"
                  onError={() => setPhotoFailed(true)}
                  draggable={false}
                />
              ) : (
                Art && <Art />
              )}
            </motion.div>
            <motion.p
              layout
              className="font-rounded font-black lowercase text-plum"
              style={{ fontSize: docked ? "clamp(13px, 2vmin, 16px)" : "clamp(15px, 2.4vmin, 19px)" }}
            >
              <span style={{ color: "#8B63D6" }}>{word.charAt(0)}</span>
              {word.slice(1)}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
