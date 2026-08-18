"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { CelebrationOverlay } from "@shared/components/game/CelebrationOverlay";
import { AlphabetStrip } from "@games/dino-dig/components/AlphabetStrip";
import { useElementSize } from "@shared/hooks/useElementSize";
import { useScheduler } from "@shared/hooks/useScheduler";
import { cssVars } from "@shared/styles/cssVars";
import {
  playClickSound,
  playCorrectSound,
  playIncorrectSound,
  playChime,
} from "@shared/audio/sfx";
import {
  playClip,
  playSequence,
  preloadClips,
  clipText,
  stopVoice,
} from "@shared/audio/voice";
import { shuffle } from "@shared/utils/random";
import { findDropTarget, registerTarget, toRootPoint } from "@shared/utils/pointer";
import {
  STONE_GROUPS,
  TOTAL_CROSSINGS,
  PLACED_BEFORE,
  STONE_DECOY_OFFSETS,
  decoysFor,
} from "@games/dino-dig/constants/rounds";
import { DinoBackdrop } from "@games/dino-dig/components/DinoBackdrop";
import { CAST, LetterStone } from "@games/dino-dig/components/DinoArt";

interface StonesLevelProps {
  /** Which crossing this is (0–6) — also which cast member is waiting. */
  crossing: number;
  onCrossingDone: () => void;
}

/** Generous overshoot around the bridge gap (px) — small fingers miss. */
const DROP_SLOP_PX = 30;
/** The dino's hop across the finished bridge. */
const HOP_MS = 1700;
/** Cheer window after the hop — praise clips run up to ~2.3s (measured). */
const CHEER_MS = 2600;

/** Praise rotates per crossing so seven crossings never repeat back-to-back. */
const CHEERS = [
  "cheer-great-job",
  "cheer-wonderful",
  "cheer-fantastic",
  "cheer-well-done",
  "cheer-amazing",
  "cheer-youre-doing-great",
] as const;

/**
 * RIVER CROSSING — sequencing mode.
 *
 * The alphabet is a stepping-stone bridge built in seven crossings, one per
 * cast dinosaur (4+4+4+4+4+3+3 = 26 — see constants/rounds.ts). Each step, the
 * child drags the NEXT letter from three floating stones into the glowing gap;
 * when the crossing's stones are all placed, that dino hops across to the far
 * bank. Every correct answer produces a visible event — a stone thunks into
 * the bridge, and each finished group sends a dinosaur over the river.
 *
 * The drag engine is the same pointer-event pattern as the rest of the portal:
 * pointer capture, a root-relative ghost (never position:fixed — see
 * shared/utils/pointer.ts), and an inflated drop target.
 */
export function StonesLevel({ crossing, onCrossingDone }: StonesLevelProps) {
  const router = useRouter();
  const group = STONE_GROUPS[crossing];
  const crosser = CAST[crossing % CAST.length];
  const Crosser = crosser.Art;

  const [placedCount, setPlacedCount] = useState(0);
  const [drag, setDrag] = useState<{ letter: string; x: number; y: number } | null>(null);
  const [flying, setFlying] = useState<{
    letter: string;
    fx: number;
    fy: number;
    tx: number;
    ty: number;
  } | null>(null);
  const [hoverGap, setHoverGap] = useState(false);
  const [wrongShake, setWrongShake] = useState(false);
  const [walking, setWalking] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  const [rootRef, dims] = useElementSize();
  const targetRefs = useRef<Map<string, HTMLElement>>(new Map());
  const schedule = useScheduler();
  /** Steps already landed — guards a double onAnimationComplete, which would
   *  double the sound and double-schedule the crossing (skipping one). */
  const landedRef = useRef(-1);
  useEffect(() => () => stopVoice(), []);

  /** The letter the gap is waiting for; null once the bridge is complete. */
  const next = placedCount < group.length ? group[placedCount] : null;

  /** Three floating stones: the answer plus two far-away decoys, shuffled. */
  const candidates = useMemo(
    () => (next ? shuffle([next, ...decoysFor(next, STONE_DECOY_OFFSETS)]) : []),
    [next]
  );

  // Each gap announces its letter; the very first also explains the game.
  useEffect(() => {
    if (!next) return;
    preloadClips([`letter-${next.toLowerCase()}`, CHEERS[crossing % CHEERS.length]]);
    const t = setTimeout(() => {
      void (crossing === 0 && placedCount === 0
        ? playSequence(["instr-put-letters-in-order", `letter-${next.toLowerCase()}`], 260)
        : playClip(`letter-${next.toLowerCase()}`));
    }, 550);
    return () => clearTimeout(t);
  }, [crossing, placedCount, next]);

  const toRoot = useCallback(
    (x: number, y: number) => toRootPoint(rootRef.current, x, y),
    [rootRef]
  );

  // ── Drag engine — pointer events, so mouse/touch/stylus are one path ──────
  const startDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>, letter: string) => {
      if (walking || celebrating || drag || flying || !next) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      playClickSound();
      const p = toRoot(e.clientX, e.clientY);
      setDrag({ letter, x: p.x, y: p.y });
    },
    [walking, celebrating, drag, flying, next, toRoot]
  );

  const moveDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag) return;
      const p = toRoot(e.clientX, e.clientY);
      setDrag((d) => (d ? { ...d, x: p.x, y: p.y } : d));
      const over = findDropTarget(
        targetRefs.current,
        e.clientX,
        e.clientY,
        DROP_SLOP_PX,
        () => !!next
      );
      setHoverGap(over === "gap");
    },
    [drag, next, toRoot]
  );

  /** The stone has finished its flight into the gap — NOW the thunk, the
   *  bridge update and (on the last stone) the crossing. */
  const land = useCallback(
    (letter: string) => {
      if (landedRef.current >= placedCount) return;
      landedRef.current = placedCount;
      setFlying(null);
      playCorrectSound();
      void playClip(`letter-${letter.toLowerCase()}`);
      const now = placedCount + 1;
      setPlacedCount(now);
      if (now >= group.length) {
        schedule(() => setWalking(true), 500);
        schedule(() => {
          setCelebrating(true);
          playChime();
          void playClip(CHEERS[crossing % CHEERS.length]);
        }, 500 + HOP_MS);
        schedule(onCrossingDone, 500 + HOP_MS + CHEER_MS);
      }
    },
    [placedCount, group.length, crossing, onCrossingDone, schedule]
  );

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag) return;
      const letter = drag.letter;
      setDrag(null);
      setHoverGap(false);
      const over = findDropTarget(
        targetRefs.current,
        e.clientX,
        e.clientY,
        DROP_SLOP_PX,
        () => !!next
      );
      // Dropped on open water — the stone simply floats home. Never a failure.
      if (!over) return;

      if (letter === next) {
        const el = targetRefs.current.get("gap");
        const rootRect = rootRef.current?.getBoundingClientRect();
        if (el && rootRect) {
          const r = el.getBoundingClientRect();
          const p = toRoot(e.clientX, e.clientY);
          setFlying({
            letter,
            fx: p.x,
            fy: p.y,
            tx: r.left + r.width / 2 - rootRect.left,
            ty: r.top + r.height / 2 - rootRect.top,
          });
        } else {
          land(letter); // refs unavailable — land instantly rather than stall
        }
      } else {
        // WRONG — the gap shakes, the stone returns to the water. The bridge
        // is untouched and the stone stays available.
        playIncorrectSound();
        setWrongShake(true);
        schedule(() => setWrongShake(false), 520);
      }
    },
    [drag, next, land, schedule, rootRef, toRoot]
  );

  const revealedIndex = PLACED_BEFORE[crossing] + placedCount - 1;
  /** Up to two dinos queueing behind the crosser (hidden on narrow phones). */
  const waiting = CAST.slice(crossing + 1, crossing + 3);
  /** The most recent arrivals on the far bank. */
  const crossed = CAST.slice(0, crossing).slice(-2);

  return (
    <div
      ref={rootRef}
      className="dd-stage dd-bg relative flex h-full w-full flex-col items-center overflow-hidden px-3 py-3"
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <DinoBackdrop />

      {/* ── Top bar: back · crossing counter ── */}
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
            aria-label={`Crossing ${crossing + 1} of ${TOTAL_CROSSINGS}`}
          >
            {crossing + 1} / {TOTAL_CROSSINGS}
          </span>
        </div>
      </div>

      {/* ── The alphabet so far ── */}
      <div className="hide-on-short relative z-10 mt-2 w-full max-w-3xl">
        <AlphabetStrip
          revealedIndex={revealedIndex}
          current={next ?? ""}
          targets={[]}
          placed={[]}
        />
      </div>

      {/* ── The ask ── */}
      <div className="relative z-10 mt-2 flex flex-col items-center gap-1 text-center">
        <p className="dd-question rounded-full bg-white/90 px-4 py-1.5 font-rounded font-black text-dino-ink shadow-soft">
          {clipText("instr-put-letters-in-order")}
        </p>
        <p className="dd-hint hide-on-short font-rounded font-bold text-dino-lime drop-shadow">
          Help {crosser.name} cross the river!
        </p>
      </div>

      {/* ── The river ── */}
      <div className="relative z-10 flex w-full min-h-0 max-w-4xl flex-1 items-center justify-center">
        <div className="dd-river relative flex w-full items-center justify-between px-2 py-3 sm:px-4">
          {/* left bank: the crosser, and the queue behind it */}
          <div className="dd-bank flex flex-col items-center gap-1 px-1.5 py-2 sm:px-3">
            {!walking && (
              <motion.div
                className="dd-crosser"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden="true"
              >
                <Crosser mood="happy" />
              </motion.div>
            )}
            <div className="hidden items-end gap-0.5 sm:flex" aria-hidden="true">
              {waiting.map((m) => {
                const Mini = m.Art;
                return (
                  <div key={m.id} className="dd-mini opacity-80">
                    <Mini mood="idle" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* the bridge: placed stones · the glowing gap · stones still to come */}
          <div className="relative mx-1 flex flex-1 items-center justify-center gap-1.5 sm:mx-3 sm:gap-2">
            {group.map((letter, i) => {
              if (i < placedCount) {
                return (
                  <motion.div
                    key={letter}
                    className="dd-bstone dd-bstone--set font-rounded"
                    initial={{ scale: 1.25 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 16 }}
                  >
                    {letter}
                  </motion.div>
                );
              }
              if (i === placedCount) {
                return (
                  <motion.div
                    key={letter}
                    ref={(el) => registerTarget(targetRefs.current, "gap", el)}
                    className={`dd-bstone dd-bstone--gap font-rounded ${
                      hoverGap ? "dd-bstone--hot" : ""
                    }`}
                    animate={wrongShake ? { x: [-6, 6, -4, 4, 0] } : { x: 0 }}
                    transition={{ duration: 0.42 }}
                    role="img"
                    aria-label={`Bridge gap — drop the letter ${letter} here`}
                  >
                    ?
                  </motion.div>
                );
              }
              return <div key={letter} className="dd-bstone dd-bstone--faint" aria-hidden="true" />;
            })}

            {/* the hop across the finished bridge */}
            {walking && (
              <motion.div
                className="dd-crosser pointer-events-none absolute bottom-1/4"
                initial={{ left: "-10%" }}
                animate={{ left: "94%", y: [0, -12, 0, -12, 0, -12, 0, -12, 0] }}
                transition={{ duration: HOP_MS / 1000, ease: "linear" }}
                aria-hidden="true"
              >
                <Crosser mood="cheer" />
              </motion.div>
            )}
          </div>

          {/* right bank: everyone who has already made it */}
          <div className="dd-bank flex min-h-[44px] items-end gap-0.5 px-1.5 py-2 sm:px-3" aria-hidden="true">
            {crossed.map((m) => {
              const Mini = m.Art;
              return (
                <div key={m.id} className="dd-mini">
                  <Mini mood="happy" />
                </div>
              );
            })}
            {crossed.length === 0 && <div className="dd-mini opacity-0" />}
          </div>
        </div>
      </div>

      {/* ── The floating stones ── */}
      <div className="dd-tray relative z-10 flex w-full max-w-3xl items-center justify-center gap-[3vw] sm:gap-5">
        <AnimatePresence mode="popLayout">
          {!celebrating &&
            candidates.map((letter, i) => {
              const beingDragged = drag?.letter === letter;
              return (
                <motion.div
                  key={`${placedCount}-${letter}`}
                  className={`touch-none ${beingDragged ? "cursor-grabbing opacity-25" : "cursor-grab"}`}
                  initial={{ scale: 0, y: 24 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18, delay: i * 0.06 }}
                  onPointerDown={(e) => startDrag(e, letter)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Stone with the letter ${letter} — drag it to the bridge gap`}
                >
                  <LetterStone letter={letter} />
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>

      {/* Correct-drop flight: the stone arcs from the release point into the
          gap, then land() fires on arrival. */}
      {flying && (
        <motion.div
          className="pointer-events-none absolute z-40"
          initial={{ left: flying.fx, top: flying.fy }}
          animate={{ left: flying.tx, top: flying.ty }}
          transition={{ duration: 0.3, ease: [0.2, 0.8, 0.3, 1] }}
          onAnimationComplete={() => land(flying.letter)}
          aria-hidden="true"
        >
          <div className="pl-center-self">
            <motion.div
              initial={{ scale: 1.2, rotate: -5 }}
              animate={{ scale: 0.8, rotate: 0 }}
              transition={{ duration: 0.3 }}
            >
              <LetterStone letter={flying.letter} />
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Drag ghost — root-relative absolute, never position:fixed. */}
      {drag && (
        <div
          className="dd-ghost pl-at pointer-events-none absolute z-40"
          style={cssVars({ "--pl-x": `${drag.x}px`, "--pl-y": `${drag.y}px` })}
          aria-hidden="true"
        >
          <LetterStone letter={drag.letter} />
        </div>
      )}

      {/* ── One more dino across ── */}
      <AnimatePresence>
        {celebrating && (
          <CelebrationOverlay tintClassName="dd-celebrate-tint" size={dims}>
            <motion.h2
              className="dd-cheer rounded-full bg-white/95 px-8 py-3 font-rounded font-black text-dino-ink shadow-card"
              initial={{ scale: 0.5, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 15 }}
            >
              {clipText(CHEERS[crossing % CHEERS.length])}
            </motion.h2>
            <p className="font-rounded text-xl font-black tracking-[0.2em] text-dino-lime drop-shadow">
              {crosser.name} made it! {group.join(" ")}
            </p>
          </CelebrationOverlay>
        )}
      </AnimatePresence>
    </div>
  );
}
