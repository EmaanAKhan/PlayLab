"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CelebrationSparkles } from "@/components/animations/Sparkles";
import { useAudio } from "@/hooks/useAudio";

interface CelebrationScreenProps {
  letter: string;
  onContinue: () => void;
}

const PRAISE_MESSAGES = [
  "Amazing work!",
  "You did it!",
  "Wonderful!",
  "Brilliant!",
  "Fantastic!",
  "You are a star!",
  "So impressive!",
  "Keep it up!",
];

export function CelebrationScreen({ letter, onContinue }: CelebrationScreenProps) {
  const { sayGreat, playCelebration } = useAudio();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ w: 360, h: 640 });
  const praise = PRAISE_MESSAGES[(letter.charCodeAt(0) - 65) % PRAISE_MESSAGES.length];

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      setDimensions({ w: el.offsetWidth, h: el.offsetHeight });
    }
  }, []);

  useEffect(() => {
    const t1 = setTimeout(playCelebration, 200);
    const t2 = setTimeout(sayGreat, 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [playCelebration, sayGreat]);

  // Auto-advance after a pause
  useEffect(() => {
    const t = setTimeout(onContinue, 3200);
    return () => clearTimeout(t);
  }, [onContinue]);

  const LETTER_COLORS = [
    "#7C5CBF", "#E07040", "#3DAA72", "#2980B9", "#C0960C",
    "#C0396A", "#207060", "#704090", "#306080", "#506020",
    "#205070", "#B05030", "#508010", "#404090", "#505050",
    "#804020", "#205040", "#703060", "#806010", "#205060",
    "#B03030", "#106040", "#507010", "#405090", "#604010", "#204060",
  ];
  const color = LETTER_COLORS[(letter.charCodeAt(0) - 65) % LETTER_COLORS.length];

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(160deg, #F0E8FF 0%, #E8FFE8 100%)" }}
    >
      {/* Full-screen sparkles */}
      <CelebrationSparkles active width={dimensions.w} height={dimensions.h} />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Big letter badge */}
        <motion.div
          className="flex h-52 w-52 items-center justify-center rounded-4xl shadow-card"
          style={{ background: "white", border: `5px solid ${color}33` }}
          initial={{ scale: 0.3, rotate: -15, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
        >
          <motion.span
            className="font-rounded font-black"
            style={{ fontSize: 128, lineHeight: 1, color }}
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
          <h2 className="font-rounded text-5xl font-black text-plum drop-shadow-sm">
            {praise}
          </h2>
          <p className="mt-2 font-rounded text-lg font-semibold text-plum/60">
            You traced letter {letter} perfectly!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
