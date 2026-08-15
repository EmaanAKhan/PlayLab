"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@shared/components/ui/Button";
import { CelebrationSparkles } from "@shared/components/animations/Sparkles";
import { playCelebrationSound } from "@shared/audio/sfx";
import { playClip, clipText, stopVoice } from "@shared/audio/voice";
import { LETTERS } from "@games/feed-the-shark/constants/letters";
import { FriendlyShark } from "@games/feed-the-shark/components/SharkArt";
import { OceanBackdrop, BubbleStream } from "@games/feed-the-shark/components/OceanBackdrop";

interface SharkCompleteProps {
  onPlayAgain: () => void;
  onExitPortal: () => void;
}

export function SharkComplete({ onPlayAgain, onExitPortal }: SharkCompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 360, h: 640 });

  useEffect(() => {
    const el = containerRef.current;
    if (el) setDims({ w: el.offsetWidth, h: el.offsetHeight });
  }, []);

  // Voice cheer first, celebration jingle right after — never talking over
  // itself; stopped cleanly if the child leaves mid-celebration.
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      void playClip("cheer-amazing").then(() => {
        if (!cancelled) playCelebrationSound();
      });
    }, 350);
    return () => { cancelled = true; clearTimeout(t); stopVoice(); };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fs-bg relative flex h-full w-full flex-col overflow-y-auto overflow-x-hidden px-6 py-6"
    >
      <OceanBackdrop />
      <BubbleStream />
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <CelebrationSparkles active width={dims.w} height={dims.h} />
      </div>

      {/* m-auto: short viewports scroll from the top instead of clipping */}
      <div className="relative z-10 m-auto flex w-full flex-col items-center gap-4">

      {/* Header */}
      <motion.div
        className="relative z-10 text-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="font-rounded text-4xl font-black text-white drop-shadow-md md:text-5xl">
          {clipText("cheer-amazing")}
        </h1>
        <p className="mt-2 font-rounded text-lg font-bold text-white/90">
          You fed the sharks all 26 letters!
        </p>
      </motion.div>

      {/* A very happy, very full shark */}
      <motion.div
        className="fs-shark-finale relative z-10"
        initial={{ scale: 0.5, y: 24 }}
        animate={{ scale: 1, y: [0, -12, 0] }}
        transition={{
          scale: { type: "spring", stiffness: 200, damping: 15 },
          y: { duration: 1, repeat: 2, ease: "easeInOut", delay: 0.4 },
        }}
      >
        <FriendlyShark letter="A" fedLower="z" />
      </motion.div>

      {/* Alphabet badge — the same completion motif as the tracing game */}
      <motion.div
        className="relative z-10 flex max-w-[340px] flex-wrap justify-center gap-1.5 rounded-4xl bg-white/85 p-4 shadow-card"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        {LETTERS.map((l, i) => (
          <motion.span
            key={l.upper}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-ocean font-rounded text-xs font-black text-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.35 + i * 0.03, type: "spring", stiffness: 260, damping: 18 }}
          >
            {l.upper}{l.lower}
          </motion.span>
        ))}
      </motion.div>

      {/* Actions */}
      <motion.div
        className="relative z-10 flex w-full max-w-sm flex-col items-center gap-3"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Button size="xl" onClick={onPlayAgain} className="w-full" aria-label="Play again from the letter A">
          Play Again
        </Button>
        <Button size="md" variant="secondary" onClick={onExitPortal} className="w-full" aria-label="Back to the game portal">
          Back to Games
        </Button>
      </motion.div>
      </div>
    </div>
  );
}
