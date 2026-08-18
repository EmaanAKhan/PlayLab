"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { CelebrationOverlay } from "@shared/components/game/CelebrationOverlay";
import { useElementSize } from "@shared/hooks/useElementSize";
import { useScheduler } from "@shared/hooks/useScheduler";
import {
  playClickSound,
  playCorrectSound,
  playIncorrectSound,
  playChime,
} from "@shared/audio/sfx";
import { playClip, preloadClips, clipText, stopVoice } from "@shared/audio/voice";
import { shuffle } from "@shared/utils/random";
import { toRootPoint } from "@shared/utils/pointer";
import {
  ALPHABET,
  FEED_TOTAL,
  FEED_DECOY_OFFSETS,
  decoysFor,
} from "@games/dino-dig/constants/rounds";
import { DinoBackdrop } from "@games/dino-dig/components/DinoBackdrop";
import { CAST, LetterStone, type DinoMood } from "@games/dino-dig/components/DinoArt";

interface FeedLevelProps {
  onComplete: (letters: string[]) => void;
}

/** Chomp beat before the next dino steps up to ask. */
const NEXT_AFTER_MS = 1100;
/** Final cheer window — the you-did-it clip runs ~1.9s (measured). */
const DONE_CHEER_MS = 2800;

/**
 * FEED THE DINOS — listening mode.
 *
 * A dinosaur asks for a letter out loud (the existing `hunt-find-*` narration:
 * "Find the letter X!") and shows it in a speech bubble for pre-readers and
 * muted phones. The child TAPS the matching stone from four — no dragging, so
 * the two modes feel like different games, not the same drag reskinned. The
 * stone flies into the dino's mouth, it chomps happily, and the next of the
 * seven cast members steps up. Ten letters, shuffled fresh each session, no
 * repeats, no fail state — a wrong stone just wobbles and stays.
 */
export function FeedLevel({ onComplete }: FeedLevelProps) {
  const router = useRouter();
  const [fed, setFed] = useState(0);
  const [locked, setLocked] = useState(false);
  const [wrongLetter, setWrongLetter] = useState<string | null>(null);
  const [flying, setFlying] = useState<{
    letter: string;
    fx: number;
    fy: number;
    tx: number;
    ty: number;
  } | null>(null);
  const [mood, setMood] = useState<DinoMood>("idle");
  const [celebrating, setCelebrating] = useState(false);

  const [rootRef, dims] = useElementSize();
  const dinoRef = useRef<HTMLDivElement | null>(null);
  const schedule = useScheduler();
  /** Servings already swallowed — onAnimationComplete can fire twice, and a
   *  second swallow would double-schedule the advance and skip a serving. */
  const servedRef = useRef(-1);
  useEffect(() => () => stopVoice(), []);

  /** This session's menu: ten letters, shuffled once per mount, no repeats. */
  const menu = useMemo(() => shuffle([...ALPHABET]).slice(0, FEED_TOTAL), []);
  const servingIndex = Math.min(fed, FEED_TOTAL - 1);
  const target = menu[servingIndex];
  const feeder = CAST[servingIndex % CAST.length];
  const Feeder = feeder.Art;
  const findClip = `hunt-find-${target.toLowerCase()}`;

  /** Four stones: the answer plus three far-away decoys, shuffled. */
  const candidates = useMemo(
    () => shuffle([target, ...decoysFor(target, FEED_DECOY_OFFSETS)]),
    [target]
  );

  // Each serving announces itself: "Find the letter X!"
  useEffect(() => {
    if (fed >= FEED_TOTAL) return;
    setLocked(false);
    preloadClips([findClip, `letter-${target.toLowerCase()}`]);
    const t = setTimeout(() => void playClip(findClip), 550);
    return () => clearTimeout(t);
  }, [fed, target, findClip]);

  const swallow = useCallback(
    (letter: string) => {
      if (servedRef.current >= servingIndex) return;
      servedRef.current = servingIndex;
      setFlying(null);
      playCorrectSound();
      void playClip(`letter-${letter.toLowerCase()}`);
      setMood("cheer");
      schedule(() => setMood("idle"), 850);
      const next = fed + 1;
      if (next >= FEED_TOTAL) {
        setFed(next);
        schedule(() => {
          setCelebrating(true);
          setMood("cheer");
          playChime();
          void playClip("cheer-you-did-it");
        }, 650);
        schedule(() => onComplete([...menu]), 650 + DONE_CHEER_MS);
      } else {
        schedule(() => setFed(next), NEXT_AFTER_MS);
      }
    },
    [fed, servingIndex, menu, onComplete, schedule]
  );

  const chooseStone = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, letter: string) => {
      if (locked || celebrating || flying || fed >= FEED_TOTAL) return;
      if (letter !== target) {
        // Never a failure — a two-note "oops", a wobble, and the stone stays.
        playIncorrectSound();
        setWrongLetter(letter);
        schedule(() => setWrongLetter(null), 500);
        return;
      }
      setLocked(true);
      playClickSound();
      const r = e.currentTarget.getBoundingClientRect();
      const d = dinoRef.current?.getBoundingClientRect();
      if (d) {
        const from = toRootPoint(rootRef.current, r.left + r.width / 2, r.top + r.height / 2);
        const to = toRootPoint(rootRef.current, d.left + d.width / 2, d.top + d.height * 0.55);
        setFlying({ letter, fx: from.x, fy: from.y, tx: to.x, ty: to.y });
      } else {
        swallow(letter); // ref unavailable — swallow instantly rather than stall
      }
    },
    [locked, celebrating, flying, fed, target, schedule, swallow, rootRef]
  );

  return (
    <div
      ref={rootRef}
      className="dd-stage dd-bg relative flex h-full w-full flex-col items-center overflow-hidden px-3 py-3"
    >
      <DinoBackdrop />

      {/* ── Top bar: back · fed counter ── */}
      <div className="relative z-10 flex w-full max-w-3xl items-center justify-between gap-2">
        <NavPillButton
          label="Back"
          ariaLabel="Back to the start screen"
          tone="dino"
          surface="strong"
          onClick={() => {
            playClickSound();
            stopVoice();
            router.back();
          }}
        />
        <div className="flex min-h-[44px] items-center rounded-full bg-white/85 px-4 shadow-soft">
          <span
            className="font-rounded text-sm font-black text-dino-ink"
            aria-label={`${fed} of ${FEED_TOTAL} dinos fed`}
          >
            {fed} / {FEED_TOTAL}
          </span>
        </div>
      </div>

      {/* tummy dots */}
      <div
        className="relative z-10 mt-2 flex items-center gap-1.5"
        role="img"
        aria-label={`${fed} of ${FEED_TOTAL} letters fed`}
      >
        {Array.from({ length: FEED_TOTAL }, (_, i) => (
          <span key={i} className={`dd-dot ${i < fed ? "dd-dot--full" : ""}`} />
        ))}
      </div>

      {/* ── The ask ── */}
      <div className="relative z-10 mt-2 flex flex-col items-center gap-1 text-center">
        <p className="dd-question rounded-full bg-white/90 px-4 py-1.5 font-rounded font-black text-dino-ink shadow-soft">
          {clipText(findClip)}
        </p>
        <p className="dd-hint hide-on-short font-rounded font-bold text-dino-lime drop-shadow">
          {feeder.name} is hungry!
        </p>
      </div>

      {/* ── The hungry dino + speech bubble ── */}
      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center gap-2 sm:gap-6">
        <motion.button
          type="button"
          className="dd-feeder relative"
          onClick={() => {
            playClickSound();
            void playClip(findClip);
          }}
          aria-label={`${feeder.name} — tap to hear the letter again`}
          animate={mood === "cheer" ? { scale: [1, 1.12, 1] } : { y: [0, -7, 0] }}
          transition={
            mood === "cheer"
              ? { duration: 0.6 }
              : { duration: 3.4, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <div ref={dinoRef} className="h-full w-full">
            <Feeder mood={mood} />
          </div>
        </motion.button>

        <AnimatePresence mode="wait">
          {!celebrating && (
            <motion.div
              key={`${servingIndex}-bubble`}
              className="dd-bubble flex flex-col items-center bg-white/95 px-4 py-2 shadow-card"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 17 }}
              aria-hidden="true"
            >
              <span className="font-rounded text-[10px] font-black uppercase tracking-wide text-dino-ink/70 sm:text-xs">
                I want
              </span>
              <span className="dd-bubble-letter font-rounded font-black">{target}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── The stone tray ── */}
      <div className="dd-tray relative z-10 flex w-full max-w-3xl items-center justify-center gap-[3vw] sm:gap-5">
        <AnimatePresence mode="popLayout">
          {!celebrating &&
            candidates.map((letter, i) => (
              <motion.button
                key={`${servingIndex}-${letter}`}
                type="button"
                className={flying?.letter === letter ? "opacity-25" : ""}
                initial={{ scale: 0, y: 24 }}
                animate={
                  wrongLetter === letter
                    ? { scale: 1, y: 0, x: [-7, 7, -5, 5, 0] }
                    : { scale: 1, y: 0, x: 0 }
                }
                exit={{ scale: 0, opacity: 0 }}
                transition={
                  wrongLetter === letter
                    ? { duration: 0.45 }
                    : { type: "spring", stiffness: 260, damping: 18, delay: i * 0.05 }
                }
                onClick={(e) => chooseStone(e, letter)}
                aria-label={`Stone with the letter ${letter} — feed it to ${feeder.name}`}
              >
                <LetterStone letter={letter} />
              </motion.button>
            ))}
        </AnimatePresence>
      </div>

      {/* Correct pick: the stone flies into the dino's mouth, THEN the chomp
          lands — sound with the visual, not with the tap. */}
      {flying && (
        <motion.div
          className="pointer-events-none absolute z-40"
          initial={{ left: flying.fx, top: flying.fy }}
          animate={{ left: flying.tx, top: flying.ty }}
          transition={{ duration: 0.35, ease: [0.2, 0.8, 0.3, 1] }}
          onAnimationComplete={() => swallow(flying.letter)}
          aria-hidden="true"
        >
          <div className="pl-center-self">
            <motion.div
              initial={{ scale: 1.1 }}
              animate={{ scale: 0.45, rotate: 8 }}
              transition={{ duration: 0.35 }}
            >
              <LetterStone letter={flying.letter} />
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* ── All ten served ── */}
      <AnimatePresence>
        {celebrating && (
          <CelebrationOverlay tintClassName="dd-celebrate-tint" size={dims}>
            <motion.h2
              className="dd-cheer rounded-full bg-white/95 px-8 py-3 font-rounded font-black text-dino-ink shadow-card"
              initial={{ scale: 0.5, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 15 }}
            >
              {clipText("cheer-you-did-it")}
            </motion.h2>
            <p className="font-rounded text-xl font-black tracking-[0.2em] text-dino-lime drop-shadow">
              {menu.join(" ")}
            </p>
          </CelebrationOverlay>
        )}
      </AnimatePresence>
    </div>
  );
}
