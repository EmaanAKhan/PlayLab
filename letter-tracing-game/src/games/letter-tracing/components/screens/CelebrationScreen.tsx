"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CelebrationSparkles } from "@shared/components/animations/Sparkles";
import { Button } from "@shared/components/ui/Button";
import { useAudio } from "@games/letter-tracing/hooks/useAudio";
import { clipText } from "@shared/audio/voice";
import { cssVars } from "@shared/styles/cssVars";

interface CelebrationScreenProps {
  letter: string;
  /** Replay the current letter (resets stars in 5 Star Mode) */
  onAgain: () => void;
  /** Move on to the next letter */
  onNext: () => void;
}

/** Deterministic per letter. The DISPLAYED text is read from the manifest via
 *  clipText(), and the SPOKEN clip is the same id — so screen and voice can
 *  never say different things (the audio spec's celebration-sync rule). */
const CHEER_IDS = [
  "cheer-well-done",
  "cheer-you-did-it",
  "cheer-wonderful",
  "cheer-great-job",
  "cheer-fantastic",
  "cheer-amazing",
  "cheer-youre-doing-great",
];

export function CelebrationScreen({ letter, onAgain, onNext }: CelebrationScreenProps) {
  const { sayCheer, sayAgainButton, sayNextButton, playCelebration } = useAudio();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ w: 360, h: 640 });
  const cheerId = CHEER_IDS[(letter.charCodeAt(0) - 65 + 26) % CHEER_IDS.length];
  const praise = clipText(cheerId);

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      setDimensions({ w: el.offsetWidth, h: el.offsetHeight });
    }
  }, []);

  // Choreography (audio-lifecycle-driven, not guessed): the message is shown,
  // its MATCHING voice clip plays, and the big celebration jingle follows the
  // spoken phrase rather than talking over it.
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      void sayCheer(cheerId).then(() => {
        if (!cancelled) playCelebration();
      });
    }, 350);
    return () => { cancelled = true; clearTimeout(t); };
  }, [cheerId, sayCheer, playCelebration]);

  const LETTER_COLORS = [
    "#7C5CBF", "#E07040", "#3DAA72", "#2980B9", "#C0960C",
    "#C0396A", "#207060", "#704090", "#306080", "#506020",
    "#205070", "#B05030", "#508010", "#404090", "#505050",
    "#804020", "#205040", "#703060", "#806010", "#205060",
    "#B03030", "#106040", "#507010", "#405090", "#604010", "#204060",
  ];
  // +LETTER_COLORS.length before % guards against a negative index for
  // non-A-Z characters (the Numbers module passes digits like "1".."10",
  // whose char codes are below 65 — without this the badge silently lost
  // its themed color/border on every number).
  const color =
    LETTER_COLORS[
      ((letter.charCodeAt(0) - 65) % LETTER_COLORS.length + LETTER_COLORS.length) % LETTER_COLORS.length
    ];

  return (
    <div
      ref={containerRef}
      className="bg-wash-lavender-mint relative flex h-full w-full flex-col items-center overflow-y-auto overflow-x-hidden px-4 py-3">
      {/* Full-screen sparkles */}
      <CelebrationSparkles active width={dimensions.w} height={dimensions.h} />

      <div className="relative z-10 my-auto flex flex-col items-center gap-[clamp(12px,3vmin,32px)]">
        {/* Big letter badge — sized by the SHORT edge so landscape always fits */}
        <motion.div
          className="lt-celebration-badge flex items-center justify-center rounded-4xl shadow-card"
          style={cssVars({ "--pl-border": `${color}33` })}
          initial={{ scale: 0.3, rotate: -15, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
        >
          <motion.span
            className="lt-celebration-letter pl-tint font-rounded font-black leading-none"
            style={cssVars({ "--pl-color": color })}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 0.6, repeat: 2, ease: "easeInOut" }}
          >
            {letter}
          </motion.span>
        </motion.div>

        {/* Praise text */}
        <motion.div
          className="text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <h2 className="lt-celebration-praise font-rounded font-black text-plum drop-shadow-sm">
            {praise}
          </h2>
          <p className="lt-celebration-sub mt-1 font-rounded font-semibold text-plum/60">
            You traced letter {letter} perfectly!
          </p>
        </motion.div>

        {/* Again / Next — the child chooses, the game never rushes ahead */}
        <motion.div
          className="flex w-full max-w-sm items-center justify-center gap-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            size="lg"
            variant="secondary"
            onClick={() => { void sayAgainButton(); onAgain(); }}
            className="flex-1"
            aria-label="Trace this letter again"
          >
            Again
          </Button>
          <Button
            size="lg"
            onClick={() => { void sayNextButton(); onNext(); }}
            className="flex-1"
            aria-label="Go to the next letter"
          >
            Next
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
