"use client";

import { AlphabetFinale } from "@shared/components/game/AlphabetFinale";
import { Monkey } from "@shared/components/illustrations/AnimalArt";
import { JungleBackdrop } from "@games/jungle-spy/components/JungleScreens";
import { useJungleStore } from "@games/jungle-spy/store/jungleStore";
import { clipText } from "@shared/audio/voice";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const LOWER = "abcdefghijklmnopqrstuvwxyz".split("");

interface JungleCompleteProps {
  onExitPortal?: () => void;
}

/**
 * All 26 animals found — the finale for whichever CASE the child was playing.
 * Finishing the BIG letters leaves the little letters still to do (and its own
 * finale still to earn), which is why the alphabet shown here follows the case
 * just completed rather than always being A–Z.
 */
export function JungleComplete({ onExitPortal }: JungleCompleteProps) {
  const { letterCase, resetProgress, setLetter, setScreen } = useJungleStore();
  const lower = letterCase === "lower";

  const playAgain = () => {
    resetProgress(letterCase); // only the case just finished starts over
    setLetter("A");
    setScreen("grid");
  };

  return (
    <AlphabetFinale
      symbols={lower ? LOWER : UPPER}
      headline={clipText("cheer-you-did-it")}
      subline={
        lower
          ? "You found all 26 animals with little letters!"
          : "You found all 26 animals with BIG letters!"
      }
      clipId="cheer-you-did-it"
      backdrop={<JungleBackdrop />}
      mascot={
        <div className="jsp-finale-mascot">
          <Monkey />
        </div>
      }
      rootClassName="bg-wash-mint"
      headlineClassName="jsp-finale-heading text-jungle"
      sublineClassName="text-plum/70"
      tileClassName="bg-jungle"
      primaryClassName="bg-jungle"
      onPlayAgain={playAgain}
      playAgainLabel={lower ? "Play little letters again" : "Play BIG letters again"}
      onExitPortal={onExitPortal}
    />
  );
}
