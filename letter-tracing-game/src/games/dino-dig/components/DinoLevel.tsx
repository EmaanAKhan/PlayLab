"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { CelebrationOverlay } from "@shared/components/game/CelebrationOverlay";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { useElementSize } from "@shared/hooks/useElementSize";
import { useScheduler } from "@shared/hooks/useScheduler";
import { cssVars } from "@shared/styles/cssVars";
import { playClickSound, playCorrectSound, playIncorrectSound, playChime } from "@shared/audio/sfx";
import { playClip, playSequence, preloadClips, clipText, stopVoice } from "@shared/audio/voice";
import { shuffle } from "@shared/utils/random";
import { findDropTarget, registerTarget, toRootPoint } from "@shared/utils/pointer";
import {
  ROUNDS,
  TOTAL_ROUNDS,
  REVEALED_BEFORE,
  DIG_SITES,
  letterIndex,
  type DigSiteId,
} from "@games/dino-dig/constants/rounds";
import { DinoBackdrop } from "@games/dino-dig/components/DinoBackdrop";
import { AlphabetStrip } from "@games/dino-dig/components/AlphabetStrip";
import { Toro, Steggy, FossilRing, DigSite, LetterStone, type DinoMood } from "@games/dino-dig/components/DinoArt";

interface DinoLevelProps {
  roundIndex: number;
  onRoundComplete: () => void;
}

/** Generous overshoot around each dig site (px) — small fingers miss. */
const DROP_SLOP_PX = 30;
/** Beat between the second letter landing and the celebration wash. */
const CELEBRATE_AFTER_MS = 700;
/**
 * How long the celebration holds before auto-advancing.
 *
 * Sized against the REAL narration lengths in public/audio (letter clips run
 * ~1.5s, praise clips up to ~2.3s), because the level unmounts on advance and
 * its cleanup calls stopVoice: too short a window and the child is cut off
 * mid-word. The closing letter and the praise are chained (see land()), so the
 * window has to cover praise-start → praise-end with a little slack.
 */
const ROUND_DONE_MS = 3200;

/** Praise rotates per round so thirteen rounds never repeat one phrase twice. */
const CHEERS = [
  "cheer-great-job",
  "cheer-wonderful",
  "cheer-fantastic",
  "cheer-well-done",
  "cheer-amazing",
  "cheer-youre-doing-great",
] as const;

interface DragState {
  letter: string;
  /** Root-relative — never position:fixed, which breaks inside the
   *  transformed PAGE_TRANSITION ancestor (see shared/utils/pointer.ts). */
  x: number;
  y: number;
}

interface FlightState {
  letter: string;
  site: DigSiteId;
  fx: number;
  fy: number;
  tx: number;
  ty: number;
}

export function DinoLevel({ roundIndex, onRoundComplete }: DinoLevelProps) {
  const router = useRouter();
  const round = ROUNDS[roundIndex];

  /** Which letter each dig site is waiting for. */
  const expected = useMemo(
    () => ({ s1: round.first, s2: round.second }) as Record<DigSiteId, string>,
    [round]
  );

  /** The four stones, order shuffled once per round (the component is keyed by
   *  round upstream, so every round gets a fresh, stable order). */
  const stones = useMemo(
    () => shuffle([round.first, round.second, ...round.distractors]),
    [round]
  );

  const [filled, setFilled] = useState<DigSiteId[]>([]);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [flying, setFlying] = useState<FlightState | null>(null);
  const [hoverSite, setHoverSite] = useState<DigSiteId | null>(null);
  const [wrongSite, setWrongSite] = useState<DigSiteId | null>(null);
  const [burstSite, setBurstSite] = useState<DigSiteId | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [mood, setMood] = useState<DinoMood>("idle");
  const [hint, setHint] = useState<{ fx: number; fy: number; tx: number; ty: number } | null>(null);
  const hintDismissedRef = useRef(false);

  const [rootRef, dims] = useElementSize();
  const siteRefs = useRef<Map<DigSiteId, HTMLElement>>(new Map());
  const stoneRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Every timer tracked and cleared on unmount — nothing can advance a round
  // or set state on a screen the child has already left.
  const schedule = useScheduler();
  /** False once this round has unmounted — chained audio checks it before
   *  starting anything, so nothing can speak over the next round. */
  const aliveRef = useRef(true);
  /** Sites whose landing has already been processed. onAnimationComplete can
   *  in principle fire twice; a second land() would double the sound and
   *  double-schedule the round advance (skipping a round). */
  const landedRef = useRef<Set<DigSiteId>>(new Set());
  useEffect(() => {
    const alive = aliveRef;
    return () => {
      alive.current = false;
      stopVoice();
    };
  }, []);

  // ── Round narration ──────────────────────────────────────────────────────
  // The full instruction plays once, on the first round only; after that just
  // the anchor letter, so the child hears what the question is about without
  // the same sentence thirteen times. All clips are existing portal narration.
  useEffect(() => {
    preloadClips([
      "instr-put-letters-in-order",
      `letter-${round.current.toLowerCase()}`,
      `letter-${round.first.toLowerCase()}`,
      `letter-${round.second.toLowerCase()}`,
      CHEERS[roundIndex % CHEERS.length],
    ]);
    let cancelled = false;
    const t = setTimeout(() => {
      if (cancelled) return;
      const anchor = `letter-${round.current.toLowerCase()}`;
      void (roundIndex === 0
        ? playSequence(["instr-put-letters-in-order", anchor], 260)
        : playClip(anchor));
    }, 600);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIndex]);

  const toRoot = useCallback(
    (clientX: number, clientY: number) => toRootPoint(rootRef.current, clientX, clientY),
    [rootRef]
  );

  // ── Teaching nudge ───────────────────────────────────────────────────────
  // A ghost hand demonstrates the first move — pick up this stone, carry it to
  // that hole — measured from the REAL elements through the same toRoot() the
  // drag engine uses, so it always points where things actually are. It stops
  // for good the moment the child touches a stone.
  useEffect(() => {
    if (hintDismissedRef.current || celebrating) return;
    const t = setTimeout(() => {
      if (hintDismissedRef.current) return;
      const site = DIG_SITES.find((s) => !filled.includes(s));
      if (!site) return;
      const from = stoneRefs.current.get(expected[site]);
      const to = siteRefs.current.get(site);
      if (!from || !to) return;
      const f = from.getBoundingClientRect();
      const g = to.getBoundingClientRect();
      const a = toRoot(f.left + f.width / 2, f.top + f.height / 2);
      const b = toRoot(g.left + g.width / 2, g.top + g.height / 2);
      setHint({ fx: a.x, fy: a.y, tx: b.x, ty: b.y });
    }, 2200);
    return () => clearTimeout(t);
  }, [filled, expected, celebrating, toRoot]);

  // ── Drag engine — pointer events, so mouse/touch/stylus are one path ──────
  const startDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>, letter: string) => {
      if (celebrating || drag || flying) return;
      if (filled.some((s) => expected[s] === letter)) return; // already placed
      hintDismissedRef.current = true;
      setHint(null);
      e.currentTarget.setPointerCapture(e.pointerId);
      playClickSound();
      const p = toRoot(e.clientX, e.clientY);
      setDrag({ letter, x: p.x, y: p.y });
    },
    [celebrating, drag, flying, filled, expected, toRoot]
  );

  const moveDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag) return;
      const p = toRoot(e.clientX, e.clientY);
      setDrag((d) => (d ? { ...d, x: p.x, y: p.y } : d));
      const over = findDropTarget(
        siteRefs.current,
        e.clientX,
        e.clientY,
        DROP_SLOP_PX,
        (s) => !filled.includes(s)
      );
      setHoverSite((prev) => (prev === over ? prev : over));
    },
    [drag, filled, toRoot]
  );

  /** The stone has finished its flight — NOW the sound, the state flip and the
   *  praise, so audio lands with the visual instead of with the release. */
  const land = useCallback(
    (site: DigSiteId, letter: string) => {
      if (landedRef.current.has(site)) return; // already processed this landing
      landedRef.current.add(site);
      setFlying(null);
      playCorrectSound();
      setBurstSite(site);
      schedule(() => setBurstSite(null), 650);
      setMood("happy");
      schedule(() => setMood("idle"), 900);

      const now = [...filled, site];
      setFilled(now);
      const completesRound = now.length >= DIG_SITES.length;
      const letterClip = `letter-${letter.toLowerCase()}`;

      if (completesRound) {
        // The letter, THEN the praise — chained on playClip's real onend
        // (voice.ts resolves on Howler's end event) so the two can never talk
        // over each other and the child is never cut off mid-word. The whole
        // round recap — anchor letter at round start, first letter on its
        // landing, this letter now — is spoken across the interaction rather
        // than crammed into the celebration, where four back-to-back clips
        // would run past seven seconds between every round.
        void playClip(letterClip).then(() => {
          if (aliveRef.current) void playClip(CHEERS[roundIndex % CHEERS.length]);
        });
        schedule(() => {
          setCelebrating(true);
          setMood("cheer");
          playChime();
        }, CELEBRATE_AFTER_MS);
        schedule(onRoundComplete, CELEBRATE_AFTER_MS + ROUND_DONE_MS);
      } else {
        void playClip(letterClip);
      }
    },
    [filled, roundIndex, onRoundComplete, schedule]
  );

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag) return;
      const letter = drag.letter;
      setDrag(null);
      setHoverSite(null);

      const site = findDropTarget(
        siteRefs.current,
        e.clientX,
        e.clientY,
        DROP_SLOP_PX,
        (s) => !filled.includes(s)
      );
      // Dropped on open ground (or on a site already dug) — the stone simply
      // goes home. Never a failure, never a sound.
      if (!site) return;

      if (expected[site] === letter) {
        // CORRECT — the stone flies from the release point into the hollow.
        const el = siteRefs.current.get(site);
        const rootRect = rootRef.current?.getBoundingClientRect();
        if (el && rootRect) {
          const r = el.getBoundingClientRect();
          const p = toRoot(e.clientX, e.clientY);
          setFlying({
            letter,
            site,
            fx: p.x,
            fy: p.y,
            tx: r.left + r.width / 2 - rootRect.left,
            ty: r.top + r.height / 2 - rootRect.top,
          });
        } else {
          land(site, letter); // refs unavailable — land instantly rather than stall
        }
      } else {
        // WRONG — gentle two-note "oops", the hollow shakes, the stone returns.
        // The round does not advance, progress is untouched, the card stays in
        // the tray and the site stays empty.
        playIncorrectSound();
        setWrongSite(site);
        schedule(() => setWrongSite(null), 520);
      }
    },
    [drag, filled, expected, land, schedule, rootRef, toRoot]
  );

  // Contiguous progress: a letter only extends the frontier once the letter
  // BEFORE it is in the ground, so digging site 2 first cannot make the strip
  // claim a letter that is still missing.
  let revealedIndex = REVEALED_BEFORE[roundIndex];
  if (filled.includes("s1")) {
    revealedIndex = Math.max(revealedIndex, letterIndex(round.first));
    if (filled.includes("s2")) revealedIndex = Math.max(revealedIndex, letterIndex(round.second));
  }
  const placedLetters = filled.map((s) => expected[s]);

  return (
    <div
      ref={rootRef}
      className="dd-stage dd-bg relative flex h-full w-full flex-col items-center overflow-hidden px-3 py-3"
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <DinoBackdrop />

      {/* ── Top bar: back · round counter ── */}
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
            aria-label={`Round ${roundIndex + 1} of ${TOTAL_ROUNDS}`}
          >
            {roundIndex + 1} / {TOTAL_ROUNDS}
          </span>
        </div>
      </div>

      {/* ── The stone alphabet ── */}
      <div className="hide-on-short relative z-10 mt-2 w-full max-w-3xl">
        <AlphabetStrip
          revealedIndex={revealedIndex}
          current={round.current}
          targets={[round.first, round.second]}
          placed={placedLetters}
        />
      </div>

      {/* ── The question ── */}
      <div className="relative z-10 mt-2 flex flex-col items-center gap-1 text-center">
        <p className="dd-question rounded-full bg-white/90 px-4 py-1.5 font-rounded font-black text-dino-ink shadow-soft">
          What comes after the letter {round.current}?
        </p>
        <p className="dd-hint hide-on-short font-rounded font-bold text-dino-lime drop-shadow">
          Drag {round.first} and {round.second} to the dig sites
        </p>
      </div>

      {/* ── Play area: Toro · fossil ring + dig sites · Steggy ── */}
      <div className="relative z-10 flex w-full min-h-0 max-w-4xl flex-1 items-center justify-center gap-[2vw]">
        <motion.div
          className="dd-dino hidden shrink-0 sm:block"
          animate={mood === "idle" ? { y: [0, -6, 0] } : { y: [0, -16, 0] }}
          transition={
            mood === "idle"
              ? { duration: 3.6, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.55 }
          }
          aria-hidden="true"
        >
          <Toro mood={mood} />
        </motion.div>

        <div className="flex min-w-0 flex-col items-center gap-[1.5vh]">
          <FossilRing letter={round.current} />

          <div className="flex items-start justify-center gap-[4vw] sm:gap-8">
            {DIG_SITES.map((site, i) => {
              const isFilled = filled.includes(site);
              const letter = isFilled ? expected[site] : undefined;
              return (
                <motion.div
                  key={site}
                  ref={(el) => registerTarget(siteRefs.current, site, el)}
                  className="dd-site relative"
                  animate={wrongSite === site ? { x: [-7, 7, -5, 5, 0] } : { x: 0 }}
                  transition={{ duration: 0.45 }}
                  role="img"
                  aria-label={
                    isFilled
                      ? `Dig site ${i + 1} — letter ${letter} dug up!`
                      : `Dig site ${i + 1} — empty, drop the letter ${expected[site]} here`
                  }
                >
                  {/* "drop here" halo, brighter when the stone is right over it */}
                  {drag && !isFilled && (
                    <motion.div
                      className="dd-site-halo absolute -inset-2 rounded-[38%]"
                      animate={{
                        opacity: hoverSite === site ? 1 : 0.45,
                        scale: hoverSite === site ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.15 }}
                      aria-hidden="true"
                    />
                  )}

                  {/* landing burst */}
                  {burstSite === site && (
                    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                      <motion.div
                        className="dd-burst-ring absolute inset-0 rounded-[38%]"
                        initial={{ opacity: 0.85, scale: 1 }}
                        animate={{ opacity: 0, scale: 1.8 }}
                        transition={{ duration: 0.55, ease: "easeOut" }}
                      />
                      {[[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1.3]].map(([dx, dy], k) => (
                        <motion.span
                          key={k}
                          className="dd-crumb absolute left-1/2 top-1/2"
                          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                          animate={{ x: dx * 38, y: dy * 32, opacity: 0, scale: 0.4 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      ))}
                    </div>
                  )}

                  <motion.div
                    animate={isFilled ? { scale: [1.3, 1] } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 16 }}
                  >
                    <DigSite
                      letter={letter}
                      ordinal={i + 1}
                      state={isFilled ? "filled" : hoverSite === site ? "hover" : "empty"}
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          className="dd-dino hidden shrink-0 sm:block"
          animate={mood === "idle" ? { y: [0, -6, 0] } : { y: [0, -16, 0] }}
          transition={
            mood === "idle"
              ? { duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.9 }
              : { duration: 0.55, delay: 0.06 }
          }
          aria-hidden="true"
        >
          <Steggy mood={mood} />
        </motion.div>
      </div>

      {/* ── The stone tray ── */}
      <div className="dd-tray relative z-10 flex w-full max-w-3xl items-center justify-center gap-[3vw] sm:gap-5">
        <AnimatePresence mode="popLayout">
          {!celebrating &&
            stones.map((letter, i) => {
              const placed = placedLetters.includes(letter);
              if (placed) return null;
              const beingDragged = drag?.letter === letter;
              return (
                <motion.div
                  key={letter}
                  ref={(el) => registerTarget(stoneRefs.current, letter, el)}
                  className={`touch-none ${beingDragged ? "cursor-grabbing opacity-25" : "cursor-grab"}`}
                  initial={{ scale: 0, y: 24 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18, delay: i * 0.06 }}
                  onPointerDown={(e) => startDrag(e, letter)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Stone with the letter ${letter} — drag it to a dig site`}
                >
                  <LetterStone letter={letter} />
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>

      {/* The ghost hand — visual instructions first, so a child who cannot yet
          read can still start unaided. */}
      {hint && !drag && !flying && !celebrating && (
        <TeachingHand fx={hint.fx} fy={hint.fy} tx={hint.tx} ty={hint.ty} />
      )}

      {/* Correct-drop flight: the stone arcs from the release point into the
          hollow, then land() fires on arrival. */}
      {flying && (
        <motion.div
          className="pointer-events-none absolute z-40"
          initial={{ left: flying.fx, top: flying.fy }}
          animate={{ left: flying.tx, top: flying.ty }}
          transition={{ duration: 0.3, ease: [0.2, 0.8, 0.3, 1] }}
          onAnimationComplete={() => land(flying.site, flying.letter)}
          aria-hidden="true"
        >
          <div className="pl-center-self">
            <motion.div
              initial={{ scale: 1.2, rotate: -5 }}
              animate={{ scale: 0.9, rotate: 0 }}
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

      {/* ── Round complete ── */}
      <AnimatePresence>
        {celebrating && (
          <CelebrationOverlay tintClassName="dd-celebrate-tint" size={dims}>
            <motion.h2
              className="dd-cheer rounded-full bg-white/95 px-8 py-3 font-rounded font-black text-dino-ink shadow-card"
              initial={{ scale: 0.5, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 15 }}
            >
              {clipText(CHEERS[roundIndex % CHEERS.length])}
            </motion.h2>
            <p className="font-rounded text-xl font-black tracking-[0.3em] text-dino-lime drop-shadow">
              {round.current} {round.first} {round.second}
            </p>
          </CelebrationOverlay>
        )}
      </AnimatePresence>
    </div>
  );
}
