"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ANCHOR_ART } from "@/components/illustrations/AnchorArt";
import { getLetterWord } from "@/constants/phonics";

export type AnchorMode = "hidden" | "hero" | "docked";

interface AnchorWordCardProps {
  /** The letter whose anchor word is being shown ("B" → ball 🖼️) */
  letter: string;
  /** hero = big and centered while the word is spoken;
   *  docked = slides to the right edge and stays as a small reminder */
  mode: AnchorMode;
}

/**
 * The anchor-word picture ("ball" + a handcrafted pastel ball).
 * Appears big and centered exactly when the word is spoken (hero), then
 * glides to the right end of the board area and STAYS there, small, for the
 * rest of the letter (docked) — a quiet visual reminder that never competes
 * with tracing. Purely visual: pointer-events none.
 */
export function AnchorWordCard({ letter, mode }: AnchorWordCardProps) {
  const key = letter.toUpperCase();
  const Art = ANCHOR_ART[key];
  const word = getLetterWord(letter);
  if (!Art || !word) return null;

  const docked = mode === "docked";

  return (
    <div
      className="pointer-events-none absolute inset-x-3 z-20 flex"
      style={{
        top: "max(64px, 11%)",
        justifyContent: docked ? "flex-end" : "center",
      }}
    >
      <AnimatePresence>
        {mode !== "hidden" && (
          <motion.div
            layout
            className="flex flex-col items-center rounded-3xl bg-white/95 shadow-lg"
            style={{
              gap: docked ? 2 : 6,
              padding: docked ? "8px 10px 6px" : "16px 20px 12px",
            }}
            initial={{ scale: 0.6, opacity: 0, y: 14 }}
            animate={{ scale: 1, opacity: docked ? 0.92 : 1, y: 0 }}
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
              style={{
                width: docked ? "clamp(36px, 7vmin, 56px)" : "clamp(64px, 12vmin, 104px)",
                height: docked ? "clamp(36px, 7vmin, 56px)" : "clamp(64px, 12vmin, 104px)",
              }}
            >
              <Art />
            </motion.div>
            <motion.p
              layout
              className="font-rounded font-black lowercase text-plum"
              style={{ fontSize: docked ? 11 : "clamp(15px, 2.4vmin, 19px)" }}
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
