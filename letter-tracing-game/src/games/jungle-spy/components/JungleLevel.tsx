"use client";
import { StarRow } from "@shared/components/ui/StarRow";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useJungleStore } from "@games/jungle-spy/store/jungleStore";
import { animalFor, JUNGLE_ANIMALS, animalPhotoPath } from "@games/jungle-spy/constants/animals";
import { ANIMAL_ART } from "@shared/components/illustrations/AnimalArt";
import { AnimalDisplay } from "@games/jungle-spy/components/AnimalDisplay";
import { CelebrationOverlay } from "@shared/components/game/CelebrationOverlay";
import { useElementSize } from "@shared/hooks/useElementSize";
import { cssVars } from "@shared/styles/cssVars";
import { JungleBackdrop } from "@games/jungle-spy/components/JungleScreens";
import { shuffle } from "@shared/utils/random";
import {
  playCorrectSound,
  playIncorrectSound,
  playClickSound,
  playFanfare,
} from "@shared/audio/sfx";
import { playClip, preloadClips, clipText, stopVoice } from "@shared/audio/voice";

/** Age-5 tuning: HUGE, well-spaced bubbles; no failure states.
 *  Exactly 5 copies of the target to find, among 16 visible letters. */
const TOTAL_BUBBLES = 16;
const TARGET_COUNT = 5;

/** Bubble positions on two concentric ORBITS around the animal (percent of
 *  the play area) — a rounded ring composition instead of the old rigid
 *  edge rows, nudged downward so the top of the scene can breathe. Small
 *  random jitter per round keeps it organic without ever overlapping: ring
 *  spacing guarantees clearance and every point is clamped inside bounds. */
function orbitSlots(): [number, number][] {
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  const pts: [number, number][] = [];
  const CX = 50;
  const CY = 55; // ring center sits below screen-center — breathing room up top
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2 + (Math.random() - 0.5) * 0.14;
    pts.push([clamp(CX + 44 * Math.cos(a), 5, 95), clamp(CY + 40 * Math.sin(a), 8, 93)]);
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2 + Math.PI / 6 + (Math.random() - 0.5) * 0.16;
    // inner ring pushed out (29,25 → 35,31) so even the largest medallion
    // size keeps clear water between the animal and the nearest letters
    pts.push([clamp(CX + 35 * Math.cos(a), 8, 92), clamp(CY + 31 * Math.sin(a), 12, 90)]);
  }
  return pts;
}

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
  "clamp(56px, 11.5vmin, 96px)",
  "clamp(48px, 9.6vmin, 80px)",
  "clamp(40px, 8vmin, 66px)",
  "clamp(32px, 6.5vmin, 54px)",
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
  const others = JUNGLE_ANIMALS.map((a) => a.letter).filter((l) => l !== target);
  const decoys = shuffle(others).slice(0, TOTAL_BUBBLES - TARGET_COUNT);
  const letters = shuffle([
    ...Array.from({ length: TARGET_COUNT }, () => ({ letter: target, isTarget: true })),
    ...decoys.map((l) => ({ letter: l, isTarget: false })),
  ]);
  const slots = orbitSlots();
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
  const router = useRouter();
  const { currentLetter, letterCase, markFound, setLetter } = useJungleStore();
  const animal = animalFor(currentLetter);
  const Art = ANIMAL_ART[animal.art];
  const display = letterCase === "lower" ? currentLetter.toLowerCase() : currentLetter;

  const [bubbles, setBubbles] = useState<Bubble[]>(() => buildBubbles(currentLetter, letterCase));
  const [shakeId, setShakeId] = useState<number | null>(null);
  const [won, setWon] = useState(false);
  const [round, setRound] = useState(0);
  // Measured from the actual rendered root — NOT window.innerWidth/height via
  // position:fixed, which breaks (confetti bunches to one side) inside any
  // transformed Framer Motion ancestor. This matches the tracing game's
  // reliable CelebrationScreen pattern.
  const [rootRef, dims] = useElementSize();

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
              // warm the next letter's photo while the child celebrates
              const idx = JUNGLE_ANIMALS.findIndex((a) => a.letter === currentLetter);
              const nxt = JUNGLE_ANIMALS[(idx + 1) % JUNGLE_ANIMALS.length];
              new Image().src = animalPhotoPath(nxt.art);
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
    stopVoice(); // never let the cheer keep talking into the next level
    void playClip("instr-next");
    const idx = JUNGLE_ANIMALS.findIndex((a) => a.letter === currentLetter);
    const next = JUNGLE_ANIMALS[(idx + 1) % JUNGLE_ANIMALS.length];
    setRound((r) => r + 1); // fresh keys — the win overlay and board fully reset
    setLetter(next.letter);
  }, [currentLetter, setLetter]);

  const playAgain = useCallback(() => {
    void playClip("instr-again");
    setRound((r) => r + 1);
  }, []);

  return (
    <div
      ref={rootRef}
      className="bg-wash-mint relative flex h-full w-full flex-col items-center overflow-hidden px-4 py-3">
      <JungleBackdrop />

      {/* Top bar */}
      <div className="relative z-10 flex w-full max-w-2xl items-center justify-between gap-2">
        <button
          onClick={() => { playClickSound(); router.back(); }}
          className="flex min-h-[44px] items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-2 shadow-soft"
          aria-label="Back to the letter grid"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#3DAA72" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-rounded text-xs font-bold text-jungle">Letters</span>
        </button>

        <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-soft">
          <span className="font-rounded text-sm font-bold text-plum/70">I spy the letter</span>
          <span className="font-rounded text-2xl font-black text-jungle">{display}</span>
        </div>

        {/* spacer balances the back button so the title stays centered */}
        <div className="min-h-[44px] w-[84px]" aria-hidden="true" />
      </div>

      {/* Collected stars — the shared gold-star row every game uses */}
      <div
        className="relative z-10 mt-2 flex items-center justify-center rounded-2xl bg-white/85 px-4 py-1.5 shadow-soft"
        role="status"
      >
        <StarRow earned={targetsTotal - targetsLeft} total={targetsTotal} />
      </div>

      {/* Play area */}
      <div className="relative z-10 mt-1 w-full max-w-3xl flex-1">
        {/* Animal center */}
        {/* anchored at (50%, 55%) — the SAME center orbitSlots() rings around,
            so the letter ring and the animal can never drift apart */}
        <div className="pointer-events-none absolute left-1/2 top-[55%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
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
            className="jsp-medallion flex items-center justify-center rounded-full shadow-lg"
          >
            <div className="jsp-medallion-photo flex items-center justify-center overflow-hidden rounded-full">
              <AnimalDisplay art={animal.art} />
            </div>
          </div>
          <p
            className="jsp-animal-name mt-1.5 rounded-full bg-white/85 px-3 py-0.5 text-center font-rounded font-black text-plum/80 shadow-soft"
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
                  className="jsp-bubble pl-at absolute flex min-h-[48px] min-w-[48px] items-center justify-center p-1.5"
                  style={cssVars({ "--pl-x": `${b.x}%`, "--pl-y": `${b.y}%` })}
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
                    className="pl-glyph pl-tint font-rounded font-black leading-none drop-shadow-sm"
                    style={cssVars({ "--pl-color": b.color, "--pl-font-size": LETTER_FONT[b.size] })}
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
          <CelebrationOverlay tintClassName="jsp-win-tint" gapClassName="gap-4" blur="3px" size={dims}>
            <motion.div
              className="jsp-win-photo overflow-hidden rounded-full"
              initial={{ scale: 0.5, y: 20 }}
              animate={{ scale: 1, y: [0, -14, 0] }}
              transition={{
                scale: { type: "spring", stiffness: 220, damping: 16 },
                y: { duration: 0.9, repeat: 2, ease: "easeInOut", delay: 0.3 },
              }}
            >
              <AnimalDisplay art={animal.art} />
            </motion.div>
            <h2 className="jsp-win-heading font-rounded font-black text-plum">
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
                className="min-h-[52px] rounded-full bg-jungle px-6 font-rounded text-base font-black text-white shadow-lg"
                aria-label="Go to the next letter"
              >
                <span>Next</span>
              </button>
            </div>
          </CelebrationOverlay>
        )}
      </AnimatePresence>
    </div>
  );
}
