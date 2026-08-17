"use client";
import { StarRow } from "@shared/components/ui/StarRow";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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

/** Age-5 tuning: big, well-spaced letters; no failure states. Always exactly
 *  5 copies of the target to find (that is what the 5 stars count), among as
 *  many decoys as the measured play area comfortably holds — see bubbleCount. */
const TARGET_COUNT = 5;

/** ── Board layout ─────────────────────────────────────────────────────────
 *
 *  The board is laid out in PIXELS against the measured play area, then
 *  stored as percentages. Percentages alone are not enough: a 13%-of-width
 *  gap is 250px on a desktop and 45px on a phone, so a single set of percent
 *  numbers cannot keep letters both spread out AND non-overlapping on every
 *  screen. Working in pixels makes spacing mean the same thing everywhere;
 *  storing percentages means the board still reflows if the window changes.
 *
 *  Three things scale with the measured area:
 *    - the letter size (the CSS clamp used to be viewport-based, which on a
 *      short wide screen sized letters off the viewport HEIGHT while they
 *      were being spaced by container WIDTH — the two disagreed),
 *    - the spacing between letters, which is a multiple of the letter size,
 *    - how many letters the board holds, so a big screen fills out to its
 *      edges instead of leaving the sides empty.
 */
interface PlayArea {
  /** play-area size in CSS px */
  w: number;
  h: number;
  /** the animal's occupied box in px, relative to the play area */
  keep: { left: number; top: number; right: number; bottom: number };
}

/** Letter size tiers as a fraction of the play area's SHORT side, so letters
 *  stay in proportion whatever the aspect ratio. Bounded: never too small to
 *  tap, never comically large on a big display. */
const FONT_TIERS = [0.115, 0.096, 0.08, 0.065] as const;
const FONT_MIN = 30;
const FONT_MAX = 104;

function letterFontPx(tier: number, play: PlayArea): number {
  const base = Math.min(play.w, play.h);
  return Math.round(Math.min(FONT_MAX, Math.max(FONT_MIN, FONT_TIERS[tier] * base)));
}

/** How many letters a board holds: one per ~11,000px² of usable area (the
 *  play area minus the animal), bounded below so a small screen is still a
 *  real puzzle, and above by the decoy pool — 25 other letters exist, so 28
 *  is the most we can place without repeating one twice. */
function bubbleCount(play: PlayArea): number {
  const keepW = play.keep.right - play.keep.left;
  const keepH = play.keep.bottom - play.keep.top;
  const usable = play.w * play.h - Math.max(0, keepW) * Math.max(0, keepH);
  return Math.max(14, Math.min(28, Math.round(usable / 11000)));
}

/** Scatter `count` points across the WHOLE play area (percent coordinates).
 *
 *  Rejection sampling with two constraints, both measured in px:
 *    1. nothing lands on the animal — a target hidden behind the picture is
 *       unfindable, so the animal's real measured box is a keep-out;
 *    2. nothing lands within a letter's width of another letter.
 *  Spacing eases off in steps if a board proves hard to fill, so this always
 *  terminates and always places every letter.
 *
 *  Coordinates are rounded to 2dp — they end up in inline custom properties,
 *  and full float precision is a needless hydration risk. */
function scatterSlots(count: number, play: PlayArea): [number, number][] {
  const letter = letterFontPx(0, play);
  const baseGap = letter * 1.05;
  const pad = letter * 0.55; // keep whole glyphs inside the edges
  const margin = letter * 0.6; // clearance around the animal
  const keep = {
    left: play.keep.left - margin,
    right: play.keep.right + margin,
    top: play.keep.top - margin,
    bottom: play.keep.bottom + margin,
  };

  const pts: [number, number][] = [];
  const spanX = Math.max(1, play.w - pad * 2);
  const spanY = Math.max(1, play.h - pad * 2);

  for (let relax = 0; relax < 9 && pts.length < count; relax++) {
    const gap = Math.max(baseGap * 0.55, baseGap * (1 - relax * 0.09));
    for (let tries = 0; tries < 700 && pts.length < count; tries++) {
      const x = pad + Math.random() * spanX;
      const y = pad + Math.random() * spanY;
      if (x > keep.left && x < keep.right && y > keep.top && y < keep.bottom) continue;
      if (pts.some(([px, py]) => Math.hypot(px - x, py - y) < gap)) continue;
      pts.push([
        Number(((x / play.w) * 100).toFixed(2)),
        Number(((y / play.h) * 100).toFixed(2)),
      ]);
    }
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

function buildBubbles(target: string, letterCase: "upper" | "lower", play: PlayArea): Bubble[] {
  const total = bubbleCount(play);
  const others = JUNGLE_ANIMALS.map((a) => a.letter).filter((l) => l !== target);
  const decoys = shuffle(others).slice(0, total - TARGET_COUNT);
  const letters = shuffle([
    ...Array.from({ length: TARGET_COUNT }, () => ({ letter: target, isTarget: true })),
    ...decoys.map((l) => ({ letter: l, isTarget: false })),
  ]);
  const slots = scatterSlots(letters.length, play);
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

/** Re-scatter the letters already on the board into a changed play area —
 *  after an orientation flip or a window resize. Every letter, and every
 *  letter already found, is preserved: only the positions change, so a child
 *  mid-puzzle never loses progress to a layout change. */
function respread(bubbles: Bubble[], play: PlayArea): Bubble[] {
  const slots = scatterSlots(bubbles.length, play);
  if (slots.length < bubbles.length) return bubbles; // keep what works
  return bubbles.map((b, i) => ({ ...b, x: slots[i][0], y: slots[i][1] }));
}

export function JungleLevel() {
  const router = useRouter();
  const { currentLetter, letterCase, markFound, setLetter } = useJungleStore();
  const animal = animalFor(currentLetter);
  const Art = ANIMAL_ART[animal.art];
  const display = letterCase === "lower" ? currentLetter.toLowerCase() : currentLetter;

  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [shakeId, setShakeId] = useState<number | null>(null);
  const [won, setWon] = useState(false);
  const [round, setRound] = useState(0);

  // The board is scattered against the MEASURED play area and the animal's
  // MEASURED box, so it fills whatever screen it is on and never covers the
  // picture. Measured in a layout effect (before paint) and re-measured on
  // resize, so an orientation flip re-scatters into the new shape.
  const playRef = useRef<HTMLDivElement>(null);
  const animalRef = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState<PlayArea | null>(null);
  useLayoutEffect(() => {
    const el = playRef.current;
    if (!el) return;
    const measure = () => {
      const box = el.getBoundingClientRect();
      const a = animalRef.current?.getBoundingClientRect();
      const keep = a
        ? {
            left: a.left - box.left,
            top: a.top - box.top,
            right: a.right - box.left,
            bottom: a.bottom - box.top,
          }
        : { left: box.width * 0.36, top: box.height * 0.3, right: box.width * 0.64, bottom: box.height * 0.8 };
      setPlay({ w: el.offsetWidth, h: el.offsetHeight, keep });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /** A coarse fingerprint of the play area: changes on a real resize or an
   *  orientation flip, not on every sub-pixel reflow. */
  const layoutKey = play ? `${Math.round(play.w / 40)}x${Math.round(play.h / 40)}` : null;
  const boardKey = `${currentLetter}|${letterCase}|${round}`;
  const builtRef = useRef<{ board: string; layout: string } | null>(null);
  // Measured from the actual rendered root — NOT window.innerWidth/height via
  // position:fixed, which breaks (confetti bunches to one side) inside any
  // transformed Framer Motion ancestor. This matches the tracing game's
  // reliable CelebrationScreen pattern.
  const [rootRef, dims] = useElementSize();

  const targetsLeft = useMemo(
    () => (bubbles.length ? bubbles.filter((b) => b.isTarget && !b.popped).length : TARGET_COUNT),
    [bubbles]
  );
  const targetsTotal = useMemo(
    () => (bubbles.length ? bubbles.filter((b) => b.isTarget).length : TARGET_COUNT),
    [bubbles]
  );

  // A fresh board for a new letter / replay, and a re-scatter (progress kept)
  // when the play area itself changes shape.
  useEffect(() => {
    if (!play || !layoutKey) return;
    const prev = builtRef.current;
    if (prev?.board === boardKey && prev.layout === layoutKey) return;
    if (prev?.board === boardKey) {
      builtRef.current = { board: boardKey, layout: layoutKey };
      setBubbles((current) => (current.length ? respread(current, play) : current));
      return;
    }
    builtRef.current = { board: boardKey, layout: layoutKey };
    setBubbles(buildBubbles(currentLetter, letterCase, play));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardKey, layoutKey, play]);

  // Fresh board + the pre-generated intro sentence on letter change / replay;
  // preload everything this level needs (same clip system as letter tracing)
  useEffect(() => {
    const l = currentLetter.toLowerCase();
    preloadClips([
      `jungle-find-${l}`, `letter-${l}`,
      "instr-try-again", "cheer-great-job", "instr-again", "instr-next",
    ]);
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

      {/* Play area — FULL WIDTH on purpose. It used to be capped at max-w-3xl
          (768px), so on any wider screen the letters could only ever be
          scattered inside a centred 768px column and the sides of the screen
          stayed empty however many letters were added. */}
      <div ref={playRef} className="relative z-10 mt-1 w-full flex-1">
        {/* Animal center */}
        {/* anchored at (50%, 55%) — the SAME point ANIMAL_KEEP_OUT excludes,
            so a scattered letter can never land on top of the picture */}
        <div
          ref={animalRef}
          className="pointer-events-none absolute left-1/2 top-[55%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
        >
        <motion.div
          className="flex flex-col items-center"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          aria-label={animal.name}
          role="img"
        >
          {/* the animal as a framed print — a square photo with a thin white
              border, so nothing of the animal is cropped away by a circle */}
          <div className="jsp-photo-frame flex items-center justify-center shadow-lg">
            <AnimalDisplay art={animal.art} />
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
                    style={cssVars({
                      "--pl-color": b.color,
                      "--pl-font-size": `${play ? letterFontPx(b.size, play) : 40}px`,
                    })}
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
              className="jsp-photo-frame jsp-win-photo shadow-lg"
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
