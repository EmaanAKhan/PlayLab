"use client";

import { motion } from "framer-motion";
import { AlphabetFinale } from "@shared/components/game/AlphabetFinale";
import { clipText } from "@shared/audio/voice";
import { ALPHABET } from "@games/dino-dig/constants/rounds";
import { DinoBackdrop } from "@games/dino-dig/components/DinoBackdrop";
import { CAST } from "@games/dino-dig/components/DinoArt";
import type { DinoMode } from "@games/dino-dig/store/dinoStore";

interface DinoCompleteProps {
  mode: DinoMode;
  /** The letters served in the finished feed session (its finale tiles). */
  feedLetters: readonly string[];
  onPlayAgain: () => void;
  onExitPortal?: () => void;
}

/**
 * Session complete — the shared AlphabetFinale (the same finale Jungle Spy and
 * Letter Hunt use) dressed in the dino world, so there is nothing here but
 * this game's palette, the seven-dino parade and per-mode wording: feed shows
 * the ten letters that were served, the river shows the whole alphabet bridge.
 */
export function DinoComplete({ mode, feedLetters, onPlayAgain, onExitPortal }: DinoCompleteProps) {
  const isFeed = mode === "feed";
  return (
    <AlphabetFinale
      symbols={isFeed && feedLetters.length > 0 ? [...feedLetters] : [...ALPHABET]}
      headline={clipText("cheer-you-did-it")}
      subline={isFeed ? "The dinos are all full!" : "All seven dinos made it across!"}
      clipId="cheer-you-did-it"
      backdrop={<DinoBackdrop />}
      mascot={
        <div className="flex max-w-lg flex-wrap items-end justify-center gap-1.5">
          {CAST.map((member, i) => {
            const Dino = member.Art;
            return (
              <motion.div
                key={member.id}
                className="dd-dino-parade"
                animate={{ rotate: i % 2 ? [6, -6, 6] : [-6, 6, -6] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Dino mood="cheer" />
              </motion.div>
            );
          })}
        </div>
      }
      rootClassName="dd-bg"
      headlineClassName="dd-finale-heading"
      sublineClassName="text-dino-lime"
      tileClassName="bg-dino"
      primaryClassName="bg-dino-orange"
      onPlayAgain={onPlayAgain}
      playAgainLabel="Play Again"
      onExitPortal={onExitPortal}
    />
  );
}
