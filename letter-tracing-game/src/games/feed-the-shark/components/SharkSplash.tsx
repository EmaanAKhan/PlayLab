"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@shared/components/ui/Button";
import { playClickSound } from "@shared/audio/sfx";
import { playClip, preloadClips, stopVoice } from "@shared/audio/voice";
import { FriendlyShark, LetterFish } from "@games/feed-the-shark/components/SharkArt";
import { OceanBackdrop, BubbleStream } from "@games/feed-the-shark/components/OceanBackdrop";

interface SharkSplashProps {
  onStart: () => void;
  onExitPortal?: () => void;
  /** True when saved progress exists — the button reads Continue instead */
  hasProgress: boolean;
}

export function SharkSplash({ onStart, onExitPortal, hasProgress }: SharkSplashProps) {
  // Narration on entry — the same delayed-clip pattern as the other games'
  // home screens, with stopVoice cleanup so leaving never leaves it talking.
  useEffect(() => {
    preloadClips(["shark-intro", "shark-instruction"]);
    const t = setTimeout(() => void playClip("shark-intro"), 500);
    return () => {
      clearTimeout(t);
      stopVoice();
    };
  }, []);

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-y-auto overflow-x-hidden px-6 py-6"
      style={{ background: "linear-gradient(180deg, #6FC7EF 0%, #3FA7DC 55%, #2E8FC4 100%)" }}
    >
      <OceanBackdrop />
      <BubbleStream />

      {onExitPortal && (
        <button
          onClick={() => { playClickSound(); onExitPortal(); }}
          className="absolute left-4 top-4 z-20 flex min-h-[44px] items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-2 shadow-soft"
          aria-label="Back to the game portal"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#2980B9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-rounded text-xs font-bold" style={{ color: "#2980B9" }}>Back to Games</span>
        </button>
      )}

      {/* m-auto (not justify-center on the root): when the content is taller
          than a short viewport it scrolls from the TOP instead of clipping
          both ends — flexbox centering + overflow clips the start otherwise */}
      <div className="relative z-10 m-auto flex flex-col items-center gap-5">
        {/* Title */}
        <motion.div
        className="relative z-10 flex flex-col items-center gap-1 text-center"
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="font-rounded text-3xl font-black text-white drop-shadow-md md:text-5xl">
          Letters A–Z
        </h1>
        <h2 className="font-rounded text-2xl font-black md:text-4xl" style={{ color: "#FFE79C", textShadow: "0 2px 6px rgba(0,60,100,0.3)" }}>
          Feed the Shark
        </h2>
        <p className="mt-1 rounded-full bg-white/80 px-4 py-1 font-rounded text-xs font-bold text-plum/70 md:text-sm">
          Match BIG letters with little letters
        </p>
      </motion.div>

      {/* The shark + two little fish */}
      <motion.div
        className="relative z-10 flex items-center justify-center"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 16 }}
      >
        <div style={{ width: "clamp(150px, 40vmin, 300px)" }}>
          <FriendlyShark letter="C" />
        </div>
        <div className="flex flex-col gap-2">
          <motion.div
            style={{ width: "clamp(56px, 12vmin, 92px)" }}
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="rounded-full bg-white/75 p-1.5 shadow-soft"><LetterFish letter="b" colorIndex={1} /></div>
          </motion.div>
          <motion.div
            style={{ width: "clamp(56px, 12vmin, 92px)" }}
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            <div className="rounded-full bg-white/75 p-1.5 shadow-soft"><LetterFish letter="c" colorIndex={0} /></div>
          </motion.div>
        </div>
      </motion.div>

      {/* Start */}
      <motion.div
        className="relative z-10"
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        <Button
          size="xl"
          onClick={() => { playClickSound(); onStart(); }}
          aria-label={hasProgress ? "Continue feeding the sharks" : "Start feeding the sharks"}
        >
          {hasProgress ? "Continue" : "Start"}
        </Button>
      </motion.div>
      </div>
    </div>
  );
}
