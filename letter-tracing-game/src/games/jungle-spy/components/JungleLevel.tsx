"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useJungleStore } from "@games/jungle-spy/store/jungleStore";
import { animalFor, JUNGLE_ANIMALS } from "@games/jungle-spy/constants/animals";
import { ANIMAL_ART } from "@shared/components/illustrations/AnimalArt";
import { AnimalDisplay } from "@games/jungle-spy/components/AnimalDisplay";
import { JungleBackdrop } from "@games/jungle-spy/components/JungleScreens";
import { CelebrationSparkles } from "@shared/components/animations/Sparkles";
import { shuffle } from "@shared/utils/random";
import {
  playCorrectSound,
  playIncorrectSound,
  playClickSound,
  playFanfare,
} from "@shared/audio/sfx";
import { playClip, preloadClips, clipText, stopVoice } from "@shared/audio/voice";

/** Age-5 tuning: few, HUGE, well-spaced bubbles; no failure states. */
const TOTAL_BUBBLES = 15;
const MIN_TARGETS = 7;
const MAX_TARGETS = 8;

/** 16 hand-placed slots (percent of the play area) ringing the center so the
 *  animal stays clear; 15 are used per round. Big gaps — nothing tiny. */
const SLOTS: readonly [number, number][] = [
  [11, 12], [30, 8], [50, 6], [70, 8], [89, 12],
  [6, 33], [94, 33],
  [5, 56], [95, 56],
  [12, 78], [30, 87], [50, 91], [70, 87], [88, 78],
  [21, 55], [79, 55],
];

interface Bubble {
  id: number;
  letter: string;      // display letter (case follows mode)
  isTarget: boolean;
  x: number;
  y: number;
  popped: boolean;
  /** four size tiers — playful variety; tap area stays comfortable */
  size: 0 | 1 | 2 | 3;
  color: string;
}

/** Free-floating colorful letters in FOUR clearly different sizes, like a
 *  printed I-Spy sheet. The tap area stays ≥48px via button padding even for
 *  the smallest tier. */
const LETTER_FONT = [
  "clamp(46px, 9.5vmin, 80px)",
  "clamp(38px, 7.8vmin, 64px)",
  "clamp(30px, 6.2vmin, 52px)",
  "clamp(24px, 5vmin, 42px)",
] as const;

/** Bright, friendly letter colors (reference-sheet palette) */
const LETTER_COLORS = [
  "#E85D9E", // pink
  "#2BB3A3", // teal
  "#F2913D", // orange
  "#7C4DBE", // purple
  "#6FBF44", // green
  "#4D9EE8", // blue
  "#E8B33D", // golden
  "#E86A6A", // coral
];

function buildBubbles(target: string, letterCase: "upper" | "lower"): Bubble[] {
  const targetCount = MIN_TARGETS + Math.floor(Math.random() * (MAX_TARGETS - MIN_TARGETS + 1));
  const others = JUNGLE_ANIMALS.map((a) => a.letter).filter((l) => l !== target);
  const decoys = shuffle(others).slice(0, TOTAL_BUBBLES - targetCount);
  const letters = shuffle([
    ...Array.from({ length: targetCount }, () => ({ letter: target, isTarget: true })),
    ...decoys.map((l) => ({ letter: l, isTarget: false })),
  ]);
  const slots = shuffle(SLOTS).slice(0, TOTAL_BUBBLES);
  // Sizes cycle big→medium→small so every board mixes clearly different
  // bubble sizes without any becoming a tiny target
  return letters.map((l, i) => ({
    id: i,
    letter: letterCase === "lower" ? l.letter.toLowerCase() : l.letter,
    isTarget: l.isTarget,
    x: slots[i][0],
    y: slots[i][1],
    popped: false,
    size: (i % 4) as 0 | 1 | 2 | 3,
    color: LETTER_COLORS[i % LETTER_COLORS.length],
  }));
}

export function JungleLevel() {
  const { currentLetter, letterCase, markFound, setLetter, setScreen } = useJungleStore();
  const animal = animalFor(currentLetter);
  const Art = ANIMAL_ART[animal.art];
  const display = letterCase === "lower" ? currentLetter.toLowerCase() : currentLetter;

  const [bubbles, setBubbles] = useState<Bubble[]>(() => buildBubbles(currentLetter, letterCase));
  const [shakeId, setShakeId] = useState<number | null>(null);
  const [won, setWon] = useState(false);
  const [round, setRound] = useState(0);

  const targetsLeft = useMemo(
    () => bubbles.filter((b) => b.isTarget && !b.popped).length,
    [bubbles]
  );
  const targetsTotal = useMemo(() => bubbles.filter((b) => b.isTarget).length, [bubbles]);

  // Fresh board + the pre-generated intro sentence on letter change / replay;
  // preload everything this level needs (same clip system as letter tracing)
  useEffect(() => {
    const l = currentLetter.toLowerCase();
    preloadClips([
      `jungle-find-${l}`, `letter-${l}`,
      "instr-try-again", "cheer-great-job", "instr-again", "instr-next",
    ]);
    setBubbles(buildBubbles(currentLetter, letterCase));
    setWon(false);
    const t = setTimeout(() => void playClip(`jungle-find-${l}`), 350);
    return () => { clearTimeout(t); stopVoice(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLetter, letterCase, round]);

  const tapBubble = useCallback(
    (b: Bubble) => {
      if (won || b.popped) return;
      if (b.isTarget) {
        playCorrectSound();
        void playClip(`letter-${currentLetter.toLowerCase()}`);
        setBubbles((prev) => {
          const next = prev.map((p) => (p.id === b.id ? { ...p, popped: true } : p));
          if (next.every((p) => !p.isTarget || p.popped)) {
            // Level complete
            setTimeout(() => {
              setWon(true);
              markFound(currentLetter);
              void playClip("cheer-great-job").then(() => playFanfare());
            }, 350);
          }
          return next;
        });
      } else {
        // Never a failure — a gentle wiggle and a friendly nudge
        playIncorrectSound();
        setShakeId(b.id);
        setTimeout(() => setShakeId(null), 500);
        void playClip("instr-try-again");
      }
    },
    [won, currentLetter, markFound]
  );

  const goNext = useCallback(() => {
    void playClip("instr-next");
    const idx = JUNGLE_ANIMALS.findIndex((a) => a.letter === currentLetter);
    const next = JUNGLE_ANIMALS[(idx + 1) % JUNGLE_ANIMALS.length];
    setLetter(next.letter);
  }, [currentLetter, setLetter]);

  const playAgain = useCallback(() => {
    void playClip("instr-again");
    setRound((r) => r + 1);
  }, []);

  return (
    <div
      className="relative flex h-full w-full flex-col items-center overflow-hidden px-4 py-3"
      style={{ background: "linear-gradient(165deg, #E8F8EE 0%, #FFF6D6 100%)" }}
    >
      <JungleBackdrop />

      {/* Top bar */}
      <div className="relative z-10 flex w-full max-w-2xl items-center justify-between gap-2">
        <button
          onClick={() => { playClickSound(); setScreen("grid"); }}
          className="flex min-h-[44px] items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-2 shadow-soft"
          aria-label="Back to the letter grid"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#3DAA72" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-rounded text-xs font-bold" style={{ color: "#3DAA72" }}>Letters</span>
        </button>

        <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-soft">
          <span className="font-rounded text-sm font-bold text-plum/70">I spy the letter</span>
          <span className="font-rounded text-2xl font-black" style={{ color: "#3DAA72" }}>{display}</span>
        </div>

        {/* spacer balances the back button so the title stays centered */}
        <div className="min-h-[44px] w-[84px]" aria-hidden="true" />
      </div>

      {/* Checklist strip — one slot per hidden letter; each fills in colored
          with a little pop as it is found (like the worksheet's top row) */}
      <div
        className="relative z-10 mt-2 flex items-center justify-center gap-2 rounded-2xl bg-white/85 px-4 py-1.5 shadow-soft"
        role="status"
        aria-label={`${targetsTotal - targetsLeft} of ${targetsTotal} letters found`}
      >
        {Array.from({ length: targetsTotal }).map((_, i) => {
          const isFound = i < targetsTotal - targetsLeft;
          return (
            <motion.span
              key={i}
              className="font-rounded font-black"
              style={{ fontSize: "clamp(18px, 3.6vmin, 28px)", lineHeight: 1 }}
              initial={false}
              animate={{
                color: isFound ? "#3DAA72" : "rgba(107, 91, 123, 0.22)",
                scale: isFound ? [1, 1.45, 1] : 1,
              }}
              transition={{ duration: 0.4 }}
              aria-hidden="true"
            >
              {display}
            </motion.span>
          );
        })}
      </div>

      {/* Play area */}
      <div className="relative z-10 mt-1 w-full max-w-3xl flex-1">
        {/* Animal center */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          aria-label={animal.name}
          role="img"
        >
          {/* soft medallion keeps the animal the unmistakable centerpiece */}
          <div
            className="flex items-center justify-center rounded-full shadow-lg"
            style={{
              width: "clamp(140px, 32vmin, 240px)",
              height: "clamp(140px, 32vmin, 240px)",
              background: "radial-gradient(circle, #FFFFFF 55%, #EAF9F0 100%)",
              border: "4px solid #A8E3BC",
            }}
          >
            <div className="flex items-center justify-center overflow-hidden rounded-full" style={{ width: "86%", height: "86%" }}>
              <AnimalDisplay art={animal.art} />
            </div>
          </div>
          <p
            className="mt-1.5 rounded-full bg-white/85 px-3 py-0.5 text-center font-rounded font-black text-plum/80 shadow-soft"
            style={{ fontSize: "clamp(13px, 2.6vmin, 17px)" }}
          >
            {animal.name}
          </p>
        </motion.div>
        </div>

        {/* Letter bubbles */}
        <AnimatePresence>
          {bubbles.map(
            (b) =>
              !b.popped && (
                <motion.button
                  key={`${round}-${b.id}`}
                  onClick={() => tapBubble(b)}
                  className="absolute flex min-h-[48px] min-w-[48px] items-center justify-center p-1.5"
                  style={{
                    left: `${b.x}%`,
                    top: `${b.y}%`,
                    transform: "translate(-50%, -50%)",
                    touchAction: "manipulation",
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={
                    shakeId === b.id
                      ? { scale: 1, opacity: 1, x: [-6, 6, -5, 5, -3, 3, 0] }
                      : { scale: 1, opacity: 1, x: 0 }
                  }
                  exit={{ scale: 1.5, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 320, damping: 18 }}
                  aria-label={`Letter ${b.letter}`}
                >
                  <span
                    className="font-rounded font-black drop-shadow-sm"
                    style={{ color: b.color, fontSize: LETTER_FONT[b.size], lineHeight: 1 }}
                  >
                    {b.letter}
                  </span>
                </motion.button>
              )
          )}
        </AnimatePresence>
      </div>

      {/* Win overlay */}
      <AnimatePresence>
        {won && (
          <motion.div
            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 px-6"
            style={{ background: "rgba(232, 248, 238, 0.92)", backdropFilter: "blur(3px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="pointer-events-none fixed inset-0" aria-hidden="true">
              <CelebrationSparkles
                active
                width={typeof window !== "undefined" ? window.innerWidth : 800}
                height={typeof window !== "undefined" ? window.innerHeight : 600}
              />
            </div>
            <motion.div
              className="overflow-hidden rounded-full"
              style={{ width: "clamp(120px, 28vmin, 210px)", height: "clamp(120px, 28vmin, 210px)" }}
              initial={{ scale: 0.5, y: 20 }}
              animate={{ scale: 1, y: [0, -14, 0] }}
              transition={{
                scale: { type: "spring", stiffness: 220, damping: 16 },
                y: { duration: 0.9, repeat: 2, ease: "easeInOut", delay: 0.3 },
              }}
            >
              <AnimalDisplay art={animal.art} />
            </motion.div>
            <h2 className="font-rounded font-black text-plum" style={{ fontSize: "clamp(28px, 7vmin, 44px)" }}>
              {clipText("cheer-great-job")}
            </h2>
            <p className="font-rounded text-base font-semibold text-plum/60">
              You found every {display}! {display} is for {animal.name}.
            </p>
            <div className="flex gap-4">
              <button
                onClick={playAgain}
                className="min-h-[52px] rounded-full bg-white px-6 font-rounded text-base font-black text-plum shadow-lg"
                aria-label="Play this letter again"
              >
                Again
              </button>
              <button
                onClick={goNext}
                className="inline-flex min-h-[52px] items-center gap-2 rounded-full px-7 font-rounded text-base font-black text-white shadow-lg"
                style={{ background: "#3DAA72" }}
                aria-label="Go to the next letter"
              >
                <span>Next</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 6l6 6-6 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
