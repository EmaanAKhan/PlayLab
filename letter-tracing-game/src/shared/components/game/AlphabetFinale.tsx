"use client";

import { useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import { CelebrationSparkles } from "@shared/components/animations/Sparkles";
import { useElementSize } from "@shared/hooks/useElementSize";
import { playCelebrationSound } from "@shared/audio/sfx";
import { playClip, stopVoice } from "@shared/audio/voice";

interface AlphabetFinaleProps {
  /** The alphabet in the case the child just finished — a…z or A…Z. */
  symbols: readonly string[];
  headline: string;
  subline: string;
  /** Narration clip id, played once after the fanfare. */
  clipId?: string;
  /** The game's own backdrop, so the finale stays in its world. */
  backdrop?: ReactNode;
  /** The game's mascot, celebrating. */
  mascot?: ReactNode;
  /** Per-game classes, so each finale keeps its palette. */
  rootClassName: string;
  headlineClassName: string;
  sublineClassName: string;
  tileClassName: string;
  primaryClassName: string;
  onPlayAgain: () => void;
  playAgainLabel: string;
  onExitPortal?: () => void;
}

/**
 * The "you finished the whole alphabet" screen, shared by Jungle Spy and
 * Letter Hunt.
 *
 * Both games needed the same finale — a cheer, the mascot, the full alphabet
 * with every letter ticked off, and a way to go again — so it lives here once
 * rather than being written twice. What differs between the two games is only
 * palette, mascot and wording, which arrive as props. The letter tracing game
 * keeps its own CompletionScreen: it also shows the sticker collection it
 * alone has, so it is a genuinely different screen rather than this one with
 * different colours.
 *
 * The alphabet is a CENTRED wrap: 26 tiles never divide evenly into rows, so a
 * grid would always leave the last row hanging to the left.
 */
export function AlphabetFinale({
  symbols,
  headline,
  subline,
  clipId,
  backdrop,
  mascot,
  rootClassName,
  headlineClassName,
  sublineClassName,
  tileClassName,
  primaryClassName,
  onPlayAgain,
  playAgainLabel,
  onExitPortal,
}: AlphabetFinaleProps) {
  const [rootRef, dims] = useElementSize();

  // Fanfare, then the spoken cheer — and nothing left talking on the way out.
  useEffect(() => {
    const a = setTimeout(playCelebrationSound, 250);
    const b = clipId ? setTimeout(() => void playClip(clipId), 900) : undefined;
    return () => {
      clearTimeout(a);
      if (b) clearTimeout(b);
      stopVoice();
    };
  }, [clipId]);

  return (
    <div
      ref={rootRef}
      className={`relative flex h-full w-full flex-col items-center overflow-y-auto overflow-x-hidden px-5 py-6 ${rootClassName}`}
    >
      {backdrop}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <CelebrationSparkles active width={dims.w} height={dims.h} />
      </div>

      {/* m-auto: short landscape viewports scroll from the top instead of clipping */}
      <div className="relative z-10 m-auto flex w-full max-w-2xl flex-col items-center gap-4">
        <motion.div
          className="text-center"
          initial={{ y: -18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className={`font-rounded font-black drop-shadow-sm ${headlineClassName}`}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {headline}
          </motion.h1>
          <p className={`mt-1.5 font-rounded font-bold ${sublineClassName}`}>{subline}</p>
        </motion.div>

        {mascot && (
          <motion.div
            initial={{ scale: 0.5, y: 20 }}
            animate={{ scale: 1, y: [0, -10, 0] }}
            transition={{
              scale: { type: "spring", stiffness: 200, damping: 15 },
              y: { duration: 1, repeat: 2, ease: "easeInOut", delay: 0.4 },
            }}
            aria-hidden="true"
          >
            {mascot}
          </motion.div>
        )}

        {/* The whole alphabet, every letter earned */}
        <motion.div
          className="flex max-w-[340px] flex-wrap justify-center gap-1.5 rounded-4xl bg-white/85 p-4 shadow-card sm:max-w-[420px]"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 180, damping: 16 }}
        >
          {symbols.map((l, i) => (
            <motion.span
              key={l}
              className={`flex h-8 w-8 items-center justify-center rounded-lg font-rounded text-sm font-black text-white ${tileClassName}`}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3 + i * 0.03, type: "spring", stiffness: 260, damping: 18 }}
            >
              {l}
            </motion.span>
          ))}
        </motion.div>

        <motion.div
          className="flex flex-col items-center gap-2.5 sm:flex-row"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={onPlayAgain}
            className={`min-h-[52px] rounded-full px-7 font-rounded text-base font-black text-white shadow-lg ${primaryClassName}`}
          >
            {playAgainLabel}
          </button>
          {onExitPortal && (
            <button
              onClick={onExitPortal}
              className="min-h-[52px] rounded-full bg-white/90 px-7 font-rounded text-base font-black text-plum shadow-soft"
            >
              Back to Games
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
