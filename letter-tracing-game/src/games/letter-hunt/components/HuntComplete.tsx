"use client";

import { AlphabetFinale } from "@shared/components/game/AlphabetFinale";
import { PencilPal } from "@games/letter-hunt/components/PennyArt";
import { useHuntStore } from "@games/letter-hunt/store/huntStore";
import { clipText } from "@shared/audio/voice";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const LOWER = "abcdefghijklmnopqrstuvwxyz".split("");

interface HuntCompleteProps {
  onExitPortal?: () => void;
}

/**
 * Every letter hunted down — the finale for whichever CASE the child was
 * playing, so the BIG letters and the little letters are each their own
 * achievement with their own celebration.
 */
export function HuntComplete({ onExitPortal }: HuntCompleteProps) {
  const { letterCase, resetProgress, setScreen } = useHuntStore();
  const lower = letterCase === "lower";

  const playAgain = () => {
    resetProgress(letterCase); // only the case just finished starts over
    setScreen("home");
  };

  return (
    <AlphabetFinale
      symbols={lower ? LOWER : UPPER}
      headline={clipText("cheer-amazing")}
      subline={
        lower
          ? "You hunted down every little letter!"
          : "You hunted down every BIG letter!"
      }
      clipId="cheer-amazing"
      mascot={
        <div className="hunt-finale-mascot">
          <PencilPal />
        </div>
      }
      rootClassName="bg-wash-lavender-sky"
      headlineClassName="hunt-finale-heading text-plum"
      sublineClassName="text-plum/70"
      tileClassName="bg-plum"
      primaryClassName="bg-plum"
      onPlayAgain={playAgain}
      playAgainLabel={lower ? "Hunt little letters again" : "Hunt BIG letters again"}
      onExitPortal={onExitPortal}
    />
  );
}
