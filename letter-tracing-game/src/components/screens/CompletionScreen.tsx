"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { StickerDisplay } from "@/components/illustrations/StickerDisplay";
import { CelebrationSparkles } from "@/components/animations/Sparkles";
import { STICKERS } from "@/constants/rewards";
import { useAudio } from "@/hooks/useAudio";
import { useGameStore } from "@/stores/gameStore";

interface CompletionScreenProps {
  onPlayAgain: () => void;
}

export function CompletionScreen({ onPlayAgain }: CompletionScreenProps) {
  const { playCelebration } = useAudio();
  const { resetProgress } = useGameStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ w: 360, h: 640 });

  useEffect(() => {
    const el = containerRef.current;
    if (el) setDimensions({ w: el.offsetWidth, h: el.offsetHeight });
  }, []);

  useEffect(() => {
    const t = setTimeout(playCelebration, 300);
    return () => clearTimeout(t);
  }, [playCelebration]);

  const handlePlayAgain = () => {
    resetProgress();
    onPlayAgain();
  };

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full flex-col items-center overflow-y-auto overflow-x-hidden"
      style={{ background: "linear-gradient(160deg, #F0E8FF 0%, #E8FFE8 50%, #E8F4FF 100%)" }}
    >
      <CelebrationSparkles active width={dimensions.w} height={dimensions.h} />

      {/* overflow-y-auto handles short landscape viewports without clipping */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-between overflow-y-auto px-6 py-8">
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className="font-rounded text-5xl font-black text-plum drop-shadow-sm"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            You did it!
          </motion.h1>
          <p className="mt-2 font-rounded text-xl font-bold text-plum/70">
            You learned all 26 letters!
          </p>
        </motion.div>

        {/* Alphabet badge */}
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 180, damping: 14 }}
        >
          <div className="flex flex-wrap justify-center gap-2 rounded-4xl bg-white/80 p-5 shadow-card max-w-[320px]">
            {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l, i) => (
              <motion.div
                key={l}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-plum shadow-sm"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3 + i * 0.04, type: "spring", stiffness: 240, damping: 20 }}
              >
                <span className="font-rounded text-sm font-black text-white">{l}</span>
              </motion.div>
            ))}
          </div>

          <p className="font-rounded text-base font-semibold text-plum/60 text-center">
            You collected {STICKERS.length} stickers along the way!
          </p>
        </motion.div>

        {/* Sticker collection preview */}
        <motion.div
          className="w-full max-w-sm"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="mb-3 text-center font-rounded text-sm font-bold text-plum/60">Your sticker collection</p>
          <div className="flex flex-wrap justify-center gap-2">
            {STICKERS.slice(0, 10).map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 + i * 0.05, type: "spring" }}
              >
                <StickerDisplay icon={s.icon} color={s.color} size={44} />
              </motion.div>
            ))}
            {STICKERS.length > 10 && (
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lavender">
                <span className="font-rounded text-xs font-bold text-plum">+{STICKERS.length - 10}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Play again */}
        <motion.div
          className="w-full max-w-sm"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Button size="xl" onClick={handlePlayAgain} className="w-full">
            Play Again
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
