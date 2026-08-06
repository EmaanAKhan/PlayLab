"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { FloatingClouds } from "@/components/animations/FloatingClouds";
import { useAudio } from "@/hooks/useAudio";
import type { LetterDefinition } from "@/types";

interface LetterIntroScreenProps {
  letter: LetterDefinition;
  onStart: () => void;
  onHome: () => void;
}

const COLORS_BY_MOD = [
  { bg: "#DDD5F5", border: "#A882E8", text: "#7C5CBF", pill: "#A882E8" },
  { bg: "#FFD6BC", border: "#FFAA80", text: "#C06030", pill: "#FF9F43" },
  { bg: "#C8F0D8", border: "#66CC94", text: "#3DAA72", pill: "#3DAA72" },
  { bg: "#D4EEFF", border: "#74B9FF", text: "#2980B9", pill: "#54A0FF" },
  { bg: "#FFF0B3", border: "#FFD93D", text: "#B8860B", pill: "#F9CA24" },
];

export function LetterIntroScreen({ letter, onStart, onHome }: LetterIntroScreenProps) {
  const { pronounceLetter, pronouncePhonetic } = useAudio();

  const colorIndex = letter.letter.charCodeAt(0) % COLORS_BY_MOD.length;
  const colors = COLORS_BY_MOD[colorIndex];

  useEffect(() => {
    const t1 = setTimeout(() => pronounceLetter(letter.letter), 600);
    const t2 = setTimeout(() => pronouncePhonetic(letter.phonetic), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [letter, pronounceLetter, pronouncePhonetic]);

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden px-6 py-8"
      style={{ background: `linear-gradient(160deg, ${colors.bg} 0%, #F8F4FF 100%)` }}
    >
      <FloatingClouds />

      {/* Top row with home button + label */}
      <div className="relative z-10 flex w-full max-w-sm items-center justify-between">
        <motion.button
          onClick={onHome}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 shadow-soft"
          whileTap={{ scale: 0.93 }}
          whileHover={{ scale: 1.06 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
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

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span
            className="rounded-full px-5 py-1.5 font-rounded text-sm font-bold text-white shadow-soft"
            style={{ background: colors.pill }}
          >
            Letter {letter.letter}
          </span>
        </motion.div>

        {/* Spacer */}
        <div className="h-10 w-10" />
      </div>

      {/* Giant letter display */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-6"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.1 }}
      >
        <div
          className="flex h-48 w-48 items-center justify-center rounded-4xl shadow-card"
          style={{ background: colors.bg, border: `4px solid ${colors.border}` }}
        >
          <motion.span
            className="font-rounded font-black"
            style={{ fontSize: 120, lineHeight: 1, color: colors.text }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {letter.letter}
          </motion.span>
        </div>

        <motion.p
          className="font-rounded text-xl font-bold text-plum/80 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {letter.phonetic}
        </motion.p>

        {/* Small speaker icon to replay */}
        <motion.button
          className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-soft font-rounded text-sm font-bold text-plum/70 active:bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => { pronounceLetter(letter.letter); setTimeout(() => pronouncePhonetic(letter.phonetic), 700); }}
          aria-label="Replay pronunciation"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M11 5L6 9H2v6h4l5 4V5z" fill="#A882E8" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="#A882E8" strokeWidth="2" strokeLinecap="round" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="#A882E8" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Hear again
        </motion.button>
      </motion.div>

      {/* Start button */}
      <motion.div
        className="relative z-10 w-full max-w-sm"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Button size="xl" onClick={onStart} className="w-full" aria-label="Start tracing this letter">
          Start Tracing
        </Button>
      </motion.div>
    </div>
  );
}
