"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { useMagnetStore, type MagnetScreen } from "@games/magnet-match/store/magnetStore";
import { TOTAL_GROUPS } from "@games/magnet-match/constants/letters";
import { MagnetSplash } from "@games/magnet-match/components/MagnetSplash";
import { MagnetLevel } from "@games/magnet-match/components/MagnetLevel";
import { MagnetComplete } from "@games/magnet-match/components/MagnetComplete";

/** Coarse history bucket: splash is "menu"; the 9 auto-advancing groups and
 *  completion collapse into "play" (same grain as the other games). */
function toBucket(screen: MagnetScreen): "menu" | "play" {
  return screen === "splash" ? "menu" : "play";
}

export function MagnetMatchGame() {
  const router = useRouter();
  const { screen, groupIndex, setScreen, nextGroup, resetProgress } = useMagnetStore();

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
    onEnter: () => setScreen("splash"), // always enter through the intro, like every game
  });

  const handleStart = useCallback(() => {
    if (groupIndex >= TOTAL_GROUPS) resetProgress();
    setScreen("play");
  }, [groupIndex, resetProgress, setScreen]);

  const handleStartFromA = useCallback(() => {
    resetProgress();
    setScreen("play");
  }, [resetProgress, setScreen]);

  return (
    <GameStage>
      <AnimatePresence mode="wait">
        {screen === "splash" && (
          <motion.div key="splash" className="absolute inset-0" {...PAGE_TRANSITION}>
            <MagnetSplash
              groupIndex={groupIndex}
              onStart={handleStart}
              onStartFromA={handleStartFromA}
              onExitPortal={() => router.push(PORTAL_ROUTE)}
            />
          </motion.div>
        )}
        {screen === "play" && groupIndex < TOTAL_GROUPS && (
          <motion.div key={`play-${groupIndex}`} className="absolute inset-0" {...PAGE_TRANSITION}>
            {/* keyed by group — each trio remounts fresh: clean local state,
                fresh shuffle, zero carry-over */}
            <MagnetLevel groupIndex={groupIndex} onGroupComplete={nextGroup} />
          </motion.div>
        )}
        {screen === "complete" && (
          <motion.div key="complete" className="absolute inset-0" {...PAGE_TRANSITION}>
            <MagnetComplete onPlayAgain={handleStartFromA} onExitPortal={() => router.push(PORTAL_ROUTE)} />
          </motion.div>
        )}
      </AnimatePresence>
    </GameStage>
  );
}
