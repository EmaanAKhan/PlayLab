"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@shared/components/ui/Button";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { playClickSound } from "@shared/audio/sfx";
import { preloadClips, stopVoice } from "@shared/audio/voice";
import { DinoBackdrop } from "@games/dino-dig/components/DinoBackdrop";
import { CAST, FossilRing } from "@games/dino-dig/components/DinoArt";
import type { DinoMode } from "@games/dino-dig/store/dinoStore";

interface DinoSplashProps {
  onPick: (mode: DinoMode) => void;
  onExitPortal?: () => void;
  /** True when a river crossing is saved mid-way — that button reads Continue. */
  stonesInProgress: boolean;
}

/**
 * The game's entry screen, now a MODE PICKER: backdrop, "Back to Games" pill,
 * title block, the fossil ring with the whole cast, and one big button per
 * mode. Structurally it is still the portal's standard splash (SharkSplash,
 * MagnetSplash): the mode tap is the user gesture that unlocks the
 * AudioContext, exactly as the single Start tap was — useGameSession starts
 * the shared music on the first non-splash screen for precisely that reason.
 *
 * No auto-played intro clip here: with two modes there is no honest single
 * line to speak, and each mode announces itself the moment it opens instead.
 */
export function DinoSplash({ onPick, onExitPortal, stonesInProgress }: DinoSplashProps) {
  useEffect(() => {
    // warm the clips both modes open with
    preloadClips(["hunt-find-a", "instr-put-letters-in-order", "letter-a"]);
    return () => stopVoice();
  }, []);

  return (
    <div className="dd-bg relative flex h-full w-full flex-col overflow-y-auto overflow-x-hidden px-6 py-6">
      <DinoBackdrop />

      {onExitPortal && (
        <NavPillButton
          label="Back to Games"
          ariaLabel="Back to the game portal"
          tone="dino"
          surface="strong"
          pinned
          onClick={() => {
            playClickSound();
            onExitPortal();
          }}
        />
      )}

      {/* m-auto (not justify-center): on a short viewport the content scrolls
          from the TOP instead of clipping both ends — the same fix the other
          splash screens carry. */}
      <div className="relative z-10 m-auto flex flex-col items-center gap-5">
        <motion.div
          className="flex flex-col items-center gap-1 text-center"
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="font-rounded text-3xl font-black text-white drop-shadow-md md:text-5xl">
            Alphabet
          </h1>
          <h2 className="dd-subtitle font-rounded text-2xl font-black md:text-4xl">
            Dino Dig
          </h2>
          <p className="mt-1 rounded-full bg-white/85 px-4 py-1 font-rounded text-xs font-bold text-dino-ink md:text-sm">
            Two dino games — pick one!
          </p>
        </motion.div>

        {/* the fossil ring, and the whole seven-dino cast bouncing in */}
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 16 }}
        >
          <div className="dd-ring-splash">
            <FossilRing letter="A" />
          </div>

          <div className="flex max-w-lg flex-wrap items-end justify-center gap-1.5">
            {CAST.map((member, i) => {
              const Dino = member.Art;
              return (
                <motion.div
                  key={member.id}
                  className="dd-dino-cast"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, y: [0, -6, 0] }}
                  transition={{
                    scale: { type: "spring", stiffness: 260, damping: 16, delay: 0.3 + i * 0.08 },
                    y: { duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.35 },
                  }}
                >
                  <Dino mood="happy" />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* the two modes */}
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <Button
            size="xl"
            onClick={() => {
              playClickSound();
              onPick("feed");
            }}
            aria-label="Play Feed the Dinos — tap the letter each dino asks for"
          >
            Feed the Dinos
          </Button>
          <Button
            size="xl"
            onClick={() => {
              playClickSound();
              onPick("stones");
            }}
            aria-label={
              stonesInProgress
                ? "Continue River Crossing — build the letter bridge"
                : "Play River Crossing — build the letter bridge"
            }
          >
            {stonesInProgress ? "Keep Crossing" : "River Crossing"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
