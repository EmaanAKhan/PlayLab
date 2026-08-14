"use client";

import { motion } from "framer-motion";
import { StartOptions } from "@shared/components/ui/StartOptions";
import { playClickSound } from "@shared/audio/sfx";
import { GROUPS, TOTAL_GROUPS } from "@games/magnet-match/constants/letters";
import { ChefArt, SoupPot } from "@games/magnet-match/components/MagnetArt";
import { KitchenBackdrop } from "@games/magnet-match/components/KitchenBackdrop";

interface MagnetSplashProps {
  groupIndex: number;
  onStart: () => void;
  onStartFromA: () => void;
  onExitPortal?: () => void;
}

export function MagnetSplash({ groupIndex, onStart, onStartFromA, onExitPortal }: MagnetSplashProps) {
  const hasProgress = groupIndex > 0 && groupIndex < TOTAL_GROUPS;
  const nextLetters = hasProgress ? GROUPS[groupIndex].join(" ") : "";

  return (
    <div className="relative flex h-full w-full flex-col overflow-y-auto overflow-x-hidden px-6 py-6">
      <KitchenBackdrop />

      {onExitPortal && (
        <button
          onClick={() => { playClickSound(); onExitPortal(); }}
          className="absolute left-4 top-4 z-20 flex min-h-[44px] items-center gap-1.5 rounded-full bg-white/85 px-3.5 py-2 shadow-soft"
          aria-label="Back to the game portal"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#C97B4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-rounded text-xs font-bold" style={{ color: "#C97B4A" }}>Back to Games</span>
        </button>
      )}

      {/* m-auto: short viewports scroll from the top instead of clipping */}
      <div className="relative z-10 m-auto flex flex-col items-center gap-4">
        <motion.div className="text-center" initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h1 className="font-rounded text-3xl font-black md:text-5xl" style={{ color: "#8A5A2E", textShadow: "0 2px 0 rgba(255,255,255,0.6)" }}>
            Magnet Match
          </h1>
          <h2 className="font-rounded text-xl font-black md:text-3xl" style={{ color: "#C97B4A" }}>
            Alphabet Soup
          </h2>
          <p className="mx-auto mt-1 w-fit rounded-full bg-white/85 px-4 py-1 font-rounded text-xs font-bold text-plum/70 md:text-sm">
            Match the little letters into the pot
          </p>
        </motion.div>

        {/* chef beside his pot */}
        <motion.div
          className="flex items-end justify-center gap-1"
          initial={{ scale: 0.75, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 16 }}
        >
          <div style={{ width: "clamp(110px, 26vmin, 190px)" }}>
            <ChefArt />
          </div>
          <div style={{ width: "clamp(120px, 28vmin, 210px)", aspectRatio: "260/240" }}>
            <SoupPot />
          </div>
        </motion.div>

        <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <StartOptions
            hasProgress={hasProgress}
            onContinue={onStart}
            continueLabel={hasProgress ? `Continue · ${nextLetters}` : "Continue"}
            onStartFromA={onStartFromA}
            startLabel="Start from a"
          />
        </motion.div>
      </div>
    </div>
  );
}
