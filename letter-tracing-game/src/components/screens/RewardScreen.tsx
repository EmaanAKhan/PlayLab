"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { StickerDisplay } from "@/components/illustrations/StickerDisplay";
import { STICKERS } from "@/constants/rewards";
import { useAudio } from "@/hooks/useAudio";

interface RewardScreenProps {
  letterIndex: number;
  onContinue: () => void;
  isLastLetter: boolean;
}

export function RewardScreen({ letterIndex, onContinue, isLastLetter }: RewardScreenProps) {
  const sticker = STICKERS[letterIndex % STICKERS.length];
  const { playSuccess } = useAudio();
  const letter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[letterIndex] ?? "A";

  const isThemeUnlock = (letterIndex + 1) % 5 === 0 && letterIndex > 0;
  const themeNames = ["Garden", "Ocean", "Sky", "Forest", "Safari", "Space"];
  const themeIndex = Math.floor((letterIndex + 1) / 5) - 1;
  const themeName = themeNames[themeIndex] ?? "New Theme";

  useEffect(() => {
    const t = setTimeout(playSuccess, 400);
    return () => clearTimeout(t);
  }, [playSuccess]);

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden px-6 py-8"
      style={{ background: "linear-gradient(160deg, #FFF0F8 0%, #F0E8FF 100%)" }}
    >
      {/* Floating decorative dots */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 8 + (i % 3) * 5,
              height: 8 + (i % 3) * 5,
              background: sticker.color,
              left: `${(i * 83 + 7) % 88}%`,
              top: `${(i * 61 + 10) % 80}%`,
              opacity: 0.15,
            }}
            animate={{ y: [0, -10, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 3 + (i % 3), delay: i * 0.15, repeat: Infinity }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.div
        className="relative z-10 text-center"
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <span
          className="rounded-full px-5 py-1.5 font-rounded text-sm font-bold text-white shadow-soft"
          style={{ background: sticker.color }}
        >
          New sticker unlocked!
        </span>
      </motion.div>

      {/* Sticker reveal */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <motion.div
          className="relative flex h-48 w-48 items-center justify-center rounded-4xl bg-white shadow-card"
          style={{ border: `4px solid ${sticker.color}55` }}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.1 }}
        >
          <StickerDisplay icon={sticker.icon} color={sticker.color} size={110} animate />

          {/* Letter badge overlay */}
          <motion.div
            className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-md"
            style={{ background: sticker.color }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <span className="font-rounded text-lg font-black">{letter}</span>
          </motion.div>
        </motion.div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h2 className="font-rounded text-3xl font-black text-plum">{sticker.name}</h2>
          <p className="mt-1 font-rounded text-base font-semibold text-plum/60">
            You earned this for learning letter {letter}
          </p>
        </motion.div>

        {/* Theme unlock bonus */}
        {isThemeUnlock && (
          <motion.div
            className="flex items-center gap-3 rounded-3xl bg-white/80 px-5 py-3 shadow-soft"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sunshine">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3z" fill="#F9CA24"/>
                <path d="M12 3v2M12 19v2M3 12H1M23 12h-2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M5.2 18.8l1.4-1.4M17.4 6.6l1.4-1.4" stroke="#B8860B" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="font-rounded text-sm font-bold text-plum">New background theme!</p>
              <p className="font-rounded text-xs font-semibold text-plum/60">{themeName} theme unlocked</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Continue button */}
      <motion.div
        className="relative z-10 w-full max-w-sm"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button size="xl" onClick={onContinue} className="w-full">
          {isLastLetter ? "See my collection" : "Next Letter"}
        </Button>
      </motion.div>
    </div>
  );
}
