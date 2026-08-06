"use client";

import { useState, useCallback, useRef, useEffect, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { CelebrationSparkles } from "@/components/animations/Sparkles";

interface LetterSequencingScreenProps {
  onHome: () => void;
}

type Difficulty = "easy" | "medium" | "hard";

interface Puzzle {
  letters: string[];
  shuffled: string[];
}

// ─── Audio helpers (Web Audio API, no files needed) ───────────────────────────

function playTone(frequencies: number[], duration: number, volume = 0.22) {
  if (typeof window === "undefined") return;
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    gain.connect(ctx.destination);
    for (const freq of frequencies) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.connect(gain);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    }
    setTimeout(() => ctx.close(), (duration + 0.1) * 1000);
  } catch (_) { /* silent fallback */ }
}

const playSuccessSound = () => playTone([523, 659, 784], 0.35);
const playErrorSound   = () => playTone([220, 196], 0.28, 0.15);

// ─── Puzzle generation ────────────────────────────────────────────────────────

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generatePuzzles(difficulty: Difficulty): Puzzle[] {
  const size = difficulty === "easy" ? 3 : difficulty === "medium" ? 6 : 9;
  const puzzles: Puzzle[] = [];
  for (let start = 0; start <= ALPHABET.length - size; start++) {
    const letters = ALPHABET.slice(start, start + size);
    let shuffled = shuffle(letters);
    while (shuffled.join("") === letters.join("")) shuffled = shuffle(letters);
    puzzles.push({ letters, shuffled });
  }
  for (let start = 0; start <= ALPHABET.length - size; start += 2) {
    const letters = ALPHABET.slice(start, start + size);
    const shuffled = [...letters].reverse();
    if (shuffled.join("") !== letters.join("")) puzzles.push({ letters, shuffled });
  }
  return puzzles;
}

const PUZZLES: Record<Difficulty, Puzzle[]> = {
  easy:   generatePuzzles("easy"),
  medium: generatePuzzles("medium"),
  hard:   generatePuzzles("hard"),
};

// ─── Tile colors ──────────────────────────────────────────────────────────────

const TILE_COLORS = [
  { bg: "#DDD5F5", border: "#A882E8", text: "#7C5CBF" },
  { bg: "#C8F0D8", border: "#66CC94", text: "#3DAA72" },
  { bg: "#FFD6BC", border: "#FFAA80", text: "#C06030" },
  { bg: "#D4EEFF", border: "#74B9FF", text: "#2980B9" },
  { bg: "#FFF0B3", border: "#FFD93D", text: "#B8860B" },
  { bg: "#FFD6E8", border: "#FF9EBC", text: "#C0408A" },
];

function getTileColor(letter: string) {
  return TILE_COLORS[(letter.charCodeAt(0) - 65) % TILE_COLORS.length];
}

// ─── Drag state ───────────────────────────────────────────────────────────────

interface DragState {
  letter: string;
  /** where in available[] it came from (-1 = from a slot) */
  sourceAvailableIndex: number;
  /** index in slots[] it came from, or -1 */
  sourceSlotIndex: number;
  /** cursor position */
  x: number;
  y: number;
  /** offset from tile origin so it doesn't jump */
  offsetX: number;
  offsetY: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LetterSequencingScreen({ onHome }: LetterSequencingScreenProps) {
  const [phase, setPhase] = useState<"select-difficulty" | "playing" | "success">("select-difficulty");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [slots, setSlots] = useState<(string | null)[]>([]);
  const [available, setAvailable] = useState<string[]>([]);
  const [celebrating, setCelebrating] = useState(false);
  const [shakeLetter, setShakeLetter] = useState<string | null>(null);
  const [tryAgainVisible, setTryAgainVisible] = useState(false);
  const [drag, setDrag] = useState<DragState | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [dimensions] = useState({ w: 380, h: 700 });

  const currentPuzzle = PUZZLES[difficulty][puzzleIndex];

  const startGame = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    const puzzle = PUZZLES[diff][0];
    setSlots(new Array(puzzle.letters.length).fill(null));
    setAvailable([...puzzle.shuffled]);
    setPuzzleIndex(0);
    setPhase("playing");
    setDrag(null);
    setShakeLetter(null);
  }, []);

  // ── Drag handlers ────────────────────────────────────────────────────────

  const startDrag = useCallback(
    (
      letter: string,
      sourceAvailableIndex: number,
      sourceSlotIndex: number,
      e: React.PointerEvent<HTMLElement>
    ) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      const rect = e.currentTarget.getBoundingClientRect();
      setDrag({
        letter,
        sourceAvailableIndex,
        sourceSlotIndex,
        x: e.clientX,
        y: e.clientY,
        offsetX: e.clientX - rect.left - rect.width / 2,
        offsetY: e.clientY - rect.top - rect.height / 2,
      });
    },
    []
  );

  const moveDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag) return;
      setDrag((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
    },
    [drag]
  );

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag) return;
      const { letter, sourceAvailableIndex, sourceSlotIndex } = drag;
      setDrag(null);

      // Find which slot the pointer landed on
      let targetSlotIndex = -1;
      for (let i = 0; i < slotRefs.current.length; i++) {
        const el = slotRefs.current[i];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          targetSlotIndex = i;
          break;
        }
      }

      if (targetSlotIndex === -1) {
        // Dropped nowhere — return to source (state unchanged, tile was hidden during drag, restore it)
        return;
      }

      // Check if slot is already occupied
      if (slots[targetSlotIndex] !== null && targetSlotIndex !== sourceSlotIndex) {
        // Occupied — shake and error
        playErrorSound();
        setShakeLetter(letter);
        setTryAgainVisible(true);
        setTimeout(() => { setShakeLetter(null); setTryAgainVisible(false); }, 900);
        return;
      }

      // Place the letter
      const newSlots = [...slots];
      // If came from a slot, clear it first
      if (sourceSlotIndex !== -1) newSlots[sourceSlotIndex] = null;
      newSlots[targetSlotIndex] = letter;

      // Update available
      const newAvailable =
        sourceAvailableIndex !== -1
          ? available.filter((_, idx) => idx !== sourceAvailableIndex)
          : [...available];

      // Check correctness for THIS slot position
      const isCorrectSlot = currentPuzzle.letters[targetSlotIndex] === letter;

      if (!isCorrectSlot) {
        playErrorSound();
        setShakeLetter(letter);
        setTryAgainVisible(true);
        // Return letter to where it came from
        setTimeout(() => {
          setShakeLetter(null);
          setTryAgainVisible(false);
        }, 900);
        return; // don't commit — tile flies back via drag ghost disappearing
      }

      // Correct placement
      playSuccessSound();
      setSlots(newSlots);
      setAvailable(newAvailable);

      // Check if all filled and correct
      if (newSlots.every((s) => s !== null) && newSlots.every((s, i) => s === currentPuzzle.letters[i])) {
        setCelebrating(true);
        setTimeout(() => {
          setCelebrating(false);
          const puzzles = PUZZLES[difficulty];
          if (puzzleIndex + 1 < puzzles.length) {
            const next = puzzles[puzzleIndex + 1];
            setSlots(new Array(next.letters.length).fill(null));
            setAvailable([...next.shuffled]);
            setPuzzleIndex((p) => p + 1);
          } else {
            setPhase("success");
          }
        }, 2200);
      }
    },
    [drag, slots, available, currentPuzzle, difficulty, puzzleIndex]
  );

  // ── Tile sizing ──────────────────────────────────────────────────────────
  const size = difficulty === "easy" ? 3 : difficulty === "medium" ? 6 : 9;
  const tileSize = size <= 3 ? 72 : size <= 6 ? 56 : 44;
  const fontSize = size <= 3 ? 28 : size <= 6 ? 22 : 18;

  // ── Select difficulty ─────────────────────────────────────────────────────

  if (phase === "select-difficulty") {
    return (
      <div
        className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden px-6 py-8"
        style={{ background: "linear-gradient(160deg, #E8F4FF 0%, #F0E8FF 100%)" }}
      >
        <div className="flex w-full max-w-sm items-center">
          <motion.button
            onClick={onHome}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 shadow-soft"
            whileTap={{ scale: 0.93 }}
            aria-label="Go back to main menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21V15C9 14.4477 9.44772 14 10 14H14C14.5523 14 15 14.4477 15 15V21M9 21H15" stroke="#7C5CBF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        </div>

        <motion.div
          className="flex flex-col items-center gap-2 text-center"
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h2 className="font-rounded text-3xl font-black text-plum">Letter Order</h2>
          <p className="font-rounded text-base font-semibold text-plum/60">
            Drag the letters into the right order!
          </p>
        </motion.div>

        <div className="flex w-full max-w-sm flex-col gap-4">
          {(["easy", "medium", "hard"] as Difficulty[]).map((diff, i) => {
            const labels = {
              easy:   { title: "Easy",   sub: "3 letters",  color: "#C8F0D8", border: "#66CC94", text: "#3DAA72", example: "A B C" },
              medium: { title: "Medium", sub: "6 letters",  color: "#DDD5F5", border: "#A882E8", text: "#7C5CBF", example: "D E F G H I" },
              hard:   { title: "Hard",   sub: "9 letters",  color: "#FFD6BC", border: "#FFAA80", text: "#C06030", example: "J K L M N O P Q R" },
            }[diff];
            return (
              <motion.button
                key={diff}
                onClick={() => startGame(diff)}
                className="w-full rounded-3xl p-4 text-left shadow-lg"
                style={{ background: labels.color, border: `2.5px solid ${labels.border}` }}
                initial={{ x: -24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-rounded text-lg font-black" style={{ color: labels.text }}>{labels.title}</p>
                    <p className="font-rounded text-sm font-semibold" style={{ color: labels.text, opacity: 0.7 }}>{labels.sub}</p>
                    <p className="mt-1 font-rounded text-xs font-bold" style={{ color: labels.text, opacity: 0.5 }}>e.g. {labels.example}</p>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: labels.text, opacity: 0.6 }}>
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </motion.button>
            );
          })}
        </div>
        <div className="h-4" />
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────

  if (phase === "success") {
    return (
      <div
        className="relative flex h-full w-full flex-col items-center justify-center gap-8 overflow-hidden px-6"
        style={{ background: "linear-gradient(160deg, #F0E8FF 0%, #E8FFE8 100%)" }}
      >
        <CelebrationSparkles active width={dimensions.w} height={dimensions.h} />
        <motion.div
          className="relative z-10 flex flex-col items-center gap-4 text-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 16 }}
        >
          <div className="text-6xl">🎉</div>
          <h2 className="font-rounded text-4xl font-black text-plum">Amazing!</h2>
          <p className="font-rounded text-lg font-semibold text-plum/70">
            You finished all the puzzles!
          </p>
        </motion.div>
        <motion.div
          className="relative z-10 flex w-full max-w-sm flex-col gap-3"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button size="xl" onClick={() => startGame(difficulty)} className="w-full">Play Again</Button>
          <Button size="md" variant="secondary" onClick={onHome} className="w-full">Back to Menu</Button>
        </motion.div>
      </div>
    );
  }

  // ── Game ──────────────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden px-5 py-6"
      style={{ background: "linear-gradient(160deg, #F0E8FF 0%, #E8F4FF 100%)", touchAction: "none" }}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {celebrating && <CelebrationSparkles active width={dimensions.w} height={dimensions.h} />}

      {/* Top bar */}
      <div className="flex w-full max-w-sm items-center gap-3">
        <motion.button
          onClick={onHome}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/70 shadow-soft"
          whileTap={{ scale: 0.93 }}
          aria-label="Back to main menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21V15C9 14.4477 9.44772 14 10 14H14C14.5523 14 15 14.4477 15 15V21M9 21H15" stroke="#7C5CBF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>
        <div className="flex-1">
          <p className="font-rounded text-sm font-bold text-plum/60">
            Letter Order · <span className="capitalize">{difficulty}</span>
          </p>
          <p className="font-rounded text-xs font-semibold text-plum/40">
            Puzzle {puzzleIndex + 1} of {PUZZLES[difficulty].length}
          </p>
        </div>
      </div>

      {/* Instruction + "Try Again" feedback */}
      <motion.div
        className="text-center"
        key={puzzleIndex}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="font-rounded text-base font-bold text-plum/70">
          Put the letters in ABC order
        </p>
        <AnimatePresence>
          {tryAgainVisible ? (
            <motion.p
              key="try-again"
              className="font-rounded text-sm font-bold text-[#FF9EBC]"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              Try Again! 💪
            </motion.p>
          ) : (
            <motion.p
              key="instruction"
              className="font-rounded text-sm font-semibold text-plum/45"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Press and drag a letter into the right slot
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Answer slots */}
      <motion.div
        key={`slots-${puzzleIndex}`}
        className="flex flex-wrap justify-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {slots.map((slotLetter, i) => {
          const colors = slotLetter ? getTileColor(slotLetter) : null;
          const isBeingDragged = drag?.letter === slotLetter && drag?.sourceSlotIndex === i;
          return (
            <div
              key={i}
              ref={(el) => { slotRefs.current[i] = el; }}
              className="flex items-center justify-center rounded-2xl border-2 border-dashed transition-colors"
              style={{
                width: tileSize,
                height: tileSize,
                background: colors && !isBeingDragged ? colors.bg : "white",
                borderColor: colors && !isBeingDragged ? colors.border : "#DDD5F5",
              }}
            >
              {slotLetter && !isBeingDragged && (
                <motion.div
                  className="flex h-full w-full items-center justify-center rounded-2xl"
                  style={{ background: colors?.bg, cursor: "grab" }}
                  animate={shakeLetter === slotLetter ? { x: [-6, 6, -5, 5, -3, 3, 0] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                  onPointerDown={(e) => startDrag(slotLetter, -1, i, e)}
                >
                  <span
                    className="font-rounded font-black select-none"
                    style={{ fontSize, color: colors?.text }}
                  >
                    {slotLetter}
                  </span>
                </motion.div>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* Available letters */}
      <div className="flex w-full max-w-sm flex-col items-center gap-3">
        <p className="font-rounded text-sm font-semibold text-plum/50">
          Drag a letter to the right slot
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <AnimatePresence>
            {available.map((letter, idx) => {
              const colors = getTileColor(letter);
              const isBeingDragged = drag?.letter === letter && drag?.sourceAvailableIndex === idx;
              return (
                <motion.div
                  key={letter}
                  className="flex items-center justify-center rounded-2xl shadow-lg"
                  style={{
                    width: tileSize,
                    height: tileSize,
                    background: colors.bg,
                    border: `2.5px solid ${colors.border}`,
                    cursor: isBeingDragged ? "grabbing" : "grab",
                    opacity: isBeingDragged ? 0.35 : 1,
                    touchAction: "none",
                  }}
                  initial={{ scale: 0 }}
                  animate={
                    shakeLetter === letter
                      ? { scale: 1, x: [-6, 6, -5, 5, -3, 3, 0] }
                      : { scale: 1, x: 0 }
                  }
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  onPointerDown={(e) => startDrag(letter, idx, -1, e)}
                  aria-label={`Drag letter ${letter}`}
                >
                  <span
                    className="font-rounded font-black select-none"
                    style={{ fontSize, color: colors.text }}
                  >
                    {letter}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Reset nudge */}
      <motion.button
        onClick={() => {
          setSlots(new Array(currentPuzzle.letters.length).fill(null));
          setAvailable([...currentPuzzle.shuffled]);
          setDrag(null);
        }}
        className="font-rounded text-sm font-semibold text-plum/40 underline-offset-2 hover:underline"
        whileTap={{ scale: 0.95 }}
      >
        Start over
      </motion.button>

      {/* Drag ghost — follows the pointer */}
      <AnimatePresence>
        {drag && (() => {
          const colors = getTileColor(drag.letter);
          return (
            <motion.div
              key="ghost"
              className="pointer-events-none fixed z-50 flex items-center justify-center rounded-2xl shadow-2xl"
              style={{
                width: tileSize,
                height: tileSize,
                background: colors.bg,
                border: `2.5px solid ${colors.border}`,
                left: drag.x - tileSize / 2,
                top: drag.y - tileSize / 2,
                rotate: 5,
              }}
              initial={{ scale: 1.1, opacity: 0.9 }}
              animate={{ scale: 1.18, opacity: 0.95 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <span
                className="font-rounded font-black select-none"
                style={{ fontSize, color: colors.text }}
              >
                {drag.letter}
              </span>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
