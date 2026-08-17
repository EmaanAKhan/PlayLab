"use client";

import { motion } from "framer-motion";
import { StartOptions } from "@shared/components/ui/StartOptions";
import { playClickSound } from "@shared/audio/sfx";
import { GROUPS, TOTAL_GROUPS } from "@games/magnet-match/constants/letters";
import { ChefArt, SoupPot, PuzzleMagnet } from "@games/magnet-match/components/MagnetArt";
import { KitchenBackdrop } from "@games/magnet-match/components/KitchenBackdrop";
import { NavPillButton } from "@shared/components/ui/NavPillButton";

interface MagnetSplashProps {
  groupIndex: number;
  onStart: () => void;
  onStartFromA: () => void;
  onExitPortal?: () => void;
}

/**
 * "Welcome to the Alphabet Soup Kitchen" — the homepage lives INSIDE the
 * kitchen world: full kitchen stage behind everything, the chef standing on
 * the counter beside a white station card that previews the actual game
 * (pot + three magnet letters), start options beneath. No floating
 * centered composition, no empty wall of yellow.
 */
export function MagnetSplash({ groupIndex, onStart, onStartFromA, onExitPortal }: MagnetSplashProps) {
  const hasProgress = groupIndex > 0 && groupIndex < TOTAL_GROUPS;
  const nextLetters = hasProgress ? GROUPS[groupIndex].join(" ") : "";

  return (
    <div className="mm-stage relative flex h-full w-full flex-col overflow-y-auto overflow-x-hidden px-4 py-4">
      <KitchenBackdrop />

      {onExitPortal && (
        <NavPillButton
          label="Back to Games"
          ariaLabel="Back to the game portal"
          tone="kitchen"
          surface="strong"
          pinned
          onClick={() => { playClickSound(); onExitPortal(); }}
        />
      )}

      {/* m-auto: short viewports scroll from the top instead of clipping */}
      <div className="relative z-10 m-auto flex w-full flex-col items-center gap-3">
        <motion.div className="text-center" initial={{ y: -14, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h1 className="mm-heading font-rounded text-2xl font-black md:text-4xl">
            Magnet Match
          </h1>
          <p className="mx-auto mt-0.5 w-fit rounded-full bg-white/90 px-4 py-1 font-rounded text-xs font-black text-kitchen md:text-sm">
            🍲 Alphabet Soup Kitchen
          </p>
        </motion.div>

        {/* chef standing beside the white station card, on the counter */}
        <motion.div
          className="flex w-full max-w-2xl items-end justify-center gap-[2vw]"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 16 }}
        >
          <motion.div
            className="mm-chef-splash shrink-0"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          >
            <ChefArt />
          </motion.div>

          {/* the station card previews the game itself */}
          <div
            className="mm-station flex flex-col items-center gap-2 rounded-[2rem] bg-white/95 px-6 py-4 shadow-card"
          >
            <div className="mm-pot-splash">
              <SoupPot />
            </div>
            <div className="flex gap-2" aria-hidden="true">
              {["a", "b", "c"].map((l, i) => (
                <PuzzleMagnet key={l} letter={l} colorIndex={i} size="calc(var(--mm-slot, 46px) * 0.8)" />
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
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
