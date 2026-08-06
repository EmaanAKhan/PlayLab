"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, useAnimate } from "framer-motion";
import { TracingCanvas } from "@/components/tracing/TracingCanvas";
import { useAudio } from "@/hooks/useAudio";
import type { LetterDefinition } from "@/types";

interface TracingScreenProps {
  letter: LetterDefinition;
  onComplete: () => void;
  onReplayDemo: () => void;
  onHome: () => void;
}

export function TracingScreen({ letter, onComplete, onReplayDemo, onHome }: TracingScreenProps) {
  const [coverage, setCoverage] = useState(0);
  const [canvasScope, canvasAnimate] = useAnimate();
  const { playSuccess, pronounceLetter, pronouncePhonetic } = useAudio();
  const hasAutoPlayed = useRef(false);

  // Reset coverage when letter changes
  useEffect(() => {
    setCoverage(0);
    hasAutoPlayed.current = false;
  }, [letter.letter]);

  // Auto-play pronunciation when the tracing screen opens
  useEffect(() => {
    if (hasAutoPlayed.current) return;
    hasAutoPlayed.current = true;
    const t1 = setTimeout(() => pronounceLetter(letter.letter), 400);
    const t2 = setTimeout(() => pronouncePhonetic(letter.phonetic), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [letter, pronounceLetter, pronouncePhonetic]);

  const handleComplete = useCallback(() => {
    playSuccess();
    setTimeout(onComplete, 600);
  }, [onComplete, playSuccess]);

  // Called by TracingCanvas when child drifts too far off-path — wiggle the canvas
  const handleOffPath = useCallback(() => {
    if (canvasScope.current) {
      canvasAnimate(
        canvasScope.current,
        { x: [-7, 7, -6, 6, -3, 3, 0] },
        { duration: 0.4, ease: "easeInOut" }
      );
    }
  }, [canvasAnimate, canvasScope]);

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden px-5 py-6"
      style={{ background: "linear-gradient(160deg, #F0E8FF 0%, #E8F4FF 100%)" }}
    >
      {/* Top bar */}
      <motion.div
        className="w-full max-w-sm"
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          {/* Home button */}
          <motion.button
            onClick={onHome}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/70 shadow-soft"
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

          {/* Title */}
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-rounded text-sm font-bold text-plum/60">Trace</span>
              <span className="font-rounded text-3xl font-black text-plum leading-none">
                {letter.letter}
              </span>
              {/* Speaker icon */}
              <motion.button
                onClick={() => {
                  pronounceLetter(letter.letter);
                  setTimeout(() => pronouncePhonetic(letter.phonetic), 700);
                }}
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
            </div>

            {/* Coverage percentage badge */}
            <motion.div
              className="rounded-full bg-white/70 px-3 py-1 shadow-soft"
              animate={{ scale: coverage > 0.5 ? [1, 1.08, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="font-rounded text-sm font-black text-plum">
                {Math.round(coverage * 100)}%
              </span>
            </motion.div>
          </div>
        </div>

        {/* Single coverage progress bar */}
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-lavender/60">
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                coverage >= 0.72
                  ? "#66CC94"
                  : coverage >= 0.4
                  ? "#A882E8"
                  : "#DDD5F5",
            }}
            animate={{ width: `${coverage * 100}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </motion.div>

      {/* Tracing canvas — wrapped for wiggle animation */}
      <motion.div
        ref={canvasScope}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        style={{ boxShadow: "0 8px 32px rgba(124,92,191,0.14)", borderRadius: 24 }}
      >
        <TracingCanvas
          letter={letter}
          onComplete={handleComplete}
          onProgress={setCoverage}
          onOffPath={handleOffPath}
        />
      </motion.div>

      {/* Bottom guidance */}
      <motion.div
        className="flex w-full max-w-sm flex-col items-center gap-3"
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-center font-rounded text-sm font-semibold text-plum/60">
          {coverage === 0
            ? "Start at the purple dot and trace the letter"
            : coverage < 0.72
            ? "Keep going — trace more of the letter!"
            : "Almost there! ✨"}
        </p>
      </motion.div>
    </div>
  );
}
