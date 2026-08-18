"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { useDinoStore, type DinoScreen } from "@games/dino-dig/store/dinoStore";
import { TOTAL_CROSSINGS } from "@games/dino-dig/constants/rounds";
import { DinoSplash } from "@games/dino-dig/components/DinoSplash";
import { FeedLevel } from "@games/dino-dig/components/FeedLevel";
import { StonesLevel } from "@games/dino-dig/components/StonesLevel";
import { DinoComplete } from "@games/dino-dig/components/DinoComplete";

/** Coarse history bucket: the mode-picking splash is "menu"; both modes and
 *  the finale collapse into "play" (the same grain as every other game). */
function toBucket(screen: DinoScreen): "menu" | "play" {
  return screen === "splash" ? "menu" : "play";
}

export function AlphabetDinoDigGame() {
  const router = useRouter();
  const {
    screen,
    mode,
    stonesRound,
    feedLetters,
    setScreen,
    startMode,
    completeFeed,
    crossingDone,
    playAgain,
  } = useDinoStore();

  // Back from gameplay retreats to the mode picker rather than exiting.
  const handlePop = useCallback(
    (bucket: string) => {
      if (bucket === "menu") setScreen("splash");
    },
    [setScreen]
  );

  useGameSession({
    screen,
    step: toBucket(screen),
    onHistoryPop: handlePop,
    onEnter: () => setScreen("splash"), // always enter through the picker
  });

  const stonesInProgress = stonesRound > 0 && stonesRound < TOTAL_CROSSINGS;

  return (
    <GameStage>
      <AnimatePresence mode="wait">
        {screen === "splash" && (
          <motion.div key="splash" className="absolute inset-0" {...PAGE_TRANSITION}>
            <DinoSplash
              onPick={startMode}
              stonesInProgress={stonesInProgress}
              onExitPortal={() => router.push(PORTAL_ROUTE)}
            />
          </motion.div>
        )}
        {screen === "play" && mode === "feed" && (
          <motion.div key="feed" className="absolute inset-0" {...PAGE_TRANSITION}>
            {/* remounts fresh from the picker or Play Again — a new shuffled
                menu every session, no manual reset logic */}
            <FeedLevel onComplete={completeFeed} />
          </motion.div>
        )}
        {screen === "play" && mode === "stones" && stonesRound < TOTAL_CROSSINGS && (
          <motion.div
            key={`stones-${stonesRound}`}
            className="absolute inset-0"
            {...PAGE_TRANSITION}
          >
            {/* keyed by crossing — each crossing remounts clean: fresh stones,
                zero drag carry-over */}
            <StonesLevel crossing={stonesRound} onCrossingDone={crossingDone} />
          </motion.div>
        )}
        {screen === "complete" && (
          <motion.div key="complete" className="absolute inset-0" {...PAGE_TRANSITION}>
            <DinoComplete
              mode={mode}
              feedLetters={feedLetters}
              onPlayAgain={playAgain}
              onExitPortal={() => router.push(PORTAL_ROUTE)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </GameStage>
  );
}
