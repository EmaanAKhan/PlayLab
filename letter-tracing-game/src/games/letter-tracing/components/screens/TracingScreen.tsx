"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, useAnimate, AnimatePresence } from "framer-motion";
import { TracingCanvas, type TracingPhase } from "@games/letter-tracing/components/tracing/TracingCanvas";
import { CelebrationSparkles } from "@shared/components/animations/Sparkles";
import { RotateDevicePrompt } from "@shared/components/ui/RotateDevicePrompt";
import { AnchorWordCard, type AnchorMode } from "@games/letter-tracing/components/ui/AnchorWordCard";
import { useAudio } from "@games/letter-tracing/hooks/useAudio";
import type { LetterDefinition, PracticeMode } from "@games/letter-tracing/types";

interface TracingScreenProps {
  letter: LetterDefinition;
  /** Free = one trace per letter; five-star = five traces per letter */
  mode: PracticeMode;
  onComplete: () => void;
  onHome: () => void;
}

const STAR_COUNT = 5;

// ─── Five-star mastery row ────────────────────────────────────────────────────
function StarRow({ stars }: { stars: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`${stars} of ${STAR_COUNT} stars earned`}>
      {Array.from({ length: STAR_COUNT }).map((_, i) => {
        const filled = i < stars;
        const justFilled = i === stars - 1;
        return (
          <motion.div
            key={i}
            className="relative"
            initial={false}
            animate={justFilled ? { scale: [1, 1.5, 1.05, 1.2, 1] } : { scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 1.5l2.9 6.8 7.4.6-5.6 4.9 1.7 7.2L12 17.1l-6.4 3.9 1.7-7.2-5.6-4.9 7.4-.6L12 1.5z"
                fill={filled ? "#FFD93D" : "#E7DFFA"}
                stroke={filled ? "#F4A73E" : "#D8CDF2"}
                strokeWidth="1"
              />
            </svg>
            {justFilled && (
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0.9, scale: 1 }}
                animate={{ opacity: 0, scale: 2.4 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                style={{
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(255,217,61,0.55), transparent 70%)",
                }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

export function TracingScreen({ letter, mode, onComplete, onHome }: TracingScreenProps) {
  const starTarget = mode === "five-star" ? STAR_COUNT : 1;
  const [progress, setProgress] = useState(0);
  const [stars, setStars] = useState(0);
  const [attempt, setAttempt] = useState(0); // bumps to remount the canvas per repeat
  const [phase, setPhase] = useState<TracingPhase>("demo-draw");
  const [replayToken, setReplayToken] = useState(0);
  const [burstActive, setBurstActive] = useState(false);
  const [dims, setDims] = useState({ w: 800, h: 600 });

  const [canvasScope, canvasAnimate] = useAnimate();
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    playSuccess,
    playStrokeComplete,
    playStarPop,
    playFiveStars,
    playOops,
    speakLetterIntro,
    preloadForLetter,
    sayWatchMe,
    sayNowYourTurn,
  } = useAudio();
  const hasAutoPlayed = useRef(false);
  const starsRef = useRef(0);
  // Tracks setTimeouts scheduled by handleLetterSuccess so they can be
  // cancelled if the child navigates away (e.g. taps Home) before they fire.
  // Without this, a stale timer could call onComplete() after the screen has
  // already changed, unexpectedly yanking the child back to "celebration".
  const successTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    return () => {
      successTimeoutsRef.current.forEach(clearTimeout);
      successTimeoutsRef.current = [];
    };
  }, []);
  const [introDone, setIntroDone] = useState(false);
  const [anchorMode, setAnchorMode] = useState<AnchorMode>("hidden");

  const isDemoing = phase.startsWith("demo");

  // Reset the whole practice loop whenever a new letter is shown
  useEffect(() => {
    setProgress(0);
    setStars(0);
    starsRef.current = 0;
    setAttempt(0);
    setPhase("demo-draw");
    setIntroDone(false);
    setAnchorMode("hidden");
    hasAutoPlayed.current = false;
  }, [letter.letter]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setDims({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Preload every clip this letter's flow needs the moment the screen mounts
  useEffect(() => {
    preloadForLetter(letter.letter);
  }, [letter.letter, preloadForLetter]);

  // The choreographed introduction, driven by REAL audio durations (no
  // guessed timers): letter appears → name → pause → phonics → pause →
  // anchor word (picture in sync) → "Watch carefully!" plays TO ITS END →
  // one deliberate beat → only then is the pencil released. Speech can never
  // overlap the demonstration.
  useEffect(() => {
    if (hasAutoPlayed.current) return;
    hasAutoPlayed.current = true;
    let cancelled = false;
    const t = setTimeout(() => {
      speakLetterIntro(
        letter.letter,
        () => {
          if (cancelled) return;
          // Picture docks to the edge as the instruction begins
          setAnchorMode("docked");
          void sayWatchMe().then(() => {
            if (cancelled) return;
            // brief intentional pause after the phrase fully ends
            setTimeout(() => !cancelled && setIntroDone(true), 350);
          });
        },
        () => setAnchorMode("hero") // fires exactly as the anchor word begins
      );
    }, 200);
    return () => { cancelled = true; clearTimeout(t); };
  }, [letter, speakLetterIntro, sayWatchMe, preloadForLetter]);

  const handleFirstTurn = useCallback(() => {
    sayNowYourTurn();
  }, [sayNowYourTurn]);

  // Subtle chime for every completed stroke except the letter's final one
  // (the final stroke triggers the bigger letter-success sound instead)
  const handleStrokeComplete = useCallback(
    (strokeIndex: number, total: number) => {
      if (strokeIndex < total - 1) playStrokeComplete();
    },
    [playStrokeComplete]
  );

  // Fires when the child has traced EVERY stroke = one complete letter.
  // Five-star mode: one gold star per complete letter, five to finish.
  // Free mode: a single complete letter finishes immediately.
  const handleLetterSuccess = useCallback(() => {
    playSuccess();
    const nextStars = Math.min(starTarget, starsRef.current + 1);
    starsRef.current = nextStars;
    setStars(nextStars);
    if (mode === "five-star") playStarPop();
    setBurstActive(true);

    // All of these are deliberately delayed for pacing — but if the child
    // navigates away in the meantime (e.g. taps Home), none of them should
    // still fire, so every id is tracked and cleared on unmount.
    const schedule = (fn: () => void, ms: number) => {
      successTimeoutsRef.current.push(setTimeout(fn, ms));
    };

    schedule(() => setBurstActive(false), 600);

    if (nextStars >= starTarget) {
      // Letter finished — celebration screen offers Again / Next
      if (mode === "five-star") schedule(() => playFiveStars(), 150);
      schedule(onComplete, 1100);
    } else {
      // Reset the SAME letter for another round — no dialogs, no buttons.
      // Repeat rounds skip the pencil demo (withDemo only on attempt 0).
      schedule(() => {
        setProgress(0);
        setAttempt((a) => a + 1);
      }, 800);
    }
  }, [playSuccess, playStarPop, playFiveStars, onComplete, mode, starTarget]);

  // Off-path scribble → gentle wiggle + soft "oops", never an error message
  const handleOffPath = useCallback(() => {
    playOops();
    if (canvasScope.current) {
      canvasAnimate(
        canvasScope.current,
        { x: [-7, 7, -6, 6, -3, 3, 0] },
        { duration: 0.4, ease: "easeInOut" }
      );
    }
  }, [canvasAnimate, canvasScope, playOops]);

  const handleReplayDemo = useCallback(() => {
    setProgress(0);
    setReplayToken((t) => t + 1);
  }, []);

  const caption = !introDone && attempt === 0
    ? "Listen..."
    : isDemoing
    ? "Watch carefully..."
    : phase === "await-lift"
    ? "Lift your finger!"
    : progress === 0
    ? "Now you try — start at the purple dot"
    : progress < 0.99
    ? "Keep going — one stroke at a time!"
    : "Wonderful! ✨";

  return (
    <div
      ref={containerRef}
      className="compact-on-short relative flex h-full w-full flex-col items-center overflow-hidden px-4 py-4 sm:px-6 sm:py-6"
      style={{ background: "linear-gradient(160deg, #F0E8FF 0%, #E8F4FF 100%)" }}
    >

      {/* Portrait-phone orientation prompt (CSS-only visibility) */}
      <RotateDevicePrompt />

      {burstActive && <CelebrationSparkles active width={dims.w} height={dims.h} />}

      {/* "b … buh … ball" — the picture appears exactly when the word is spoken */}
      <AnchorWordCard letter={letter.letter} mode={anchorMode} />

      {/* Top bar — [Home]  Trace X 🔊 ↻  ····  ☆☆☆☆☆ */}
      <motion.div
        className="relative z-10 w-full max-w-md md:max-w-2xl"
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <motion.button
            onClick={onHome}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/70 shadow-soft md:h-11 md:w-11"
            whileTap={{ scale: 0.93 }}
            whileHover={{ scale: 1.06 }}
            aria-label="Go back to main menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21V15C9 14.4477 9.44772 14 10 14H14C14.5523 14 15 14.4477 15 15V21M9 21H15"
                stroke="#7C5CBF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>

          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-rounded text-sm font-bold text-plum/60">Trace</span>
              <span className="font-rounded text-3xl font-black leading-none text-plum md:text-4xl">
                {letter.letter}
              </span>
              <motion.button
                onClick={() =>
                  speakLetterIntro(
                    letter.letter,
                    () => setAnchorMode("docked"),
                    () => setAnchorMode("hero")
                  )
                }
                className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/70 shadow-soft"
                whileTap={{ scale: 0.9 }}
                aria-label="Hear pronunciation"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" fill="#A882E8" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="#A882E8" strokeWidth="2" strokeLinecap="round" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="#A882E8" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </motion.button>
              {!isDemoing && (
                <motion.button
                  onClick={handleReplayDemo}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 shadow-soft"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Watch the pencil write this letter again, stroke by stroke"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 4v6h6M20 20v-6h-6M4.5 15a8 8 0 1 0 2-9.5L4 8"
                      stroke="#A882E8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.button>
              )}
            </div>

            {/* Five-star mastery row — one star per COMPLETE letter trace */}
            {mode === "five-star" && (
              <div className="rounded-full bg-white/70 px-3.5 py-2 shadow-soft">
                <StarRow stars={stars} />
              </div>
            )}
          </div>
        </div>

        {/* Letter progress bar — hidden on short landscape phones to give the board room */}
        <div className="hide-on-short mt-3 h-2.5 w-full overflow-hidden rounded-full bg-lavender/60">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: progress >= 0.99 ? "#66CC94" : progress >= 0.4 ? "#A882E8" : "#DDD5F5",
            }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </motion.div>

      {/* Tracing board — sized by the .trace-board CSS variable so it fills
          landscape phones, scales up on tablets/desktop, never distorts */}
      <div className="relative z-10 flex w-full flex-1 items-center justify-center">
        <motion.div
          ref={canvasScope}
          className="trace-board"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          style={{ boxShadow: "0 10px 36px rgba(124,92,191,0.16)", borderRadius: 28 }}
        >
          <TracingCanvas
            key={`${letter.letter}-${attempt}`}
            letter={letter}
            onComplete={handleLetterSuccess}
            onProgress={setProgress}
            onStrokeComplete={handleStrokeComplete}
            onOffPath={handleOffPath}
            withDemo={attempt === 0}
            holdDemo={attempt === 0 && !introDone}
            onFirstTurn={handleFirstTurn}
            onPhaseChange={setPhase}
            replayToken={replayToken}
          />
        </motion.div>
      </div>

      {/* Bottom caption — hidden on short landscape phones */}
      <motion.div
        className="hide-on-short relative z-10 flex w-full max-w-md flex-col items-center gap-3 pb-1 md:max-w-2xl"
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={caption}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-center font-rounded text-sm font-semibold text-plum/60 md:text-base"
          >
            {caption}
          </motion.p>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
