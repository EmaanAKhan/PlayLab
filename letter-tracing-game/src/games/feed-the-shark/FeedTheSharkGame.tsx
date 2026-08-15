"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { useSharkStore, type SharkScreen } from "@games/feed-the-shark/store/sharkStore";
import { TOTAL_ROUNDS } from "@games/feed-the-shark/constants/letters";
import { SharkSplash } from "@games/feed-the-shark/components/SharkSplash";
import { SharkLevel } from "@games/feed-the-shark/components/SharkLevel";
import { SharkComplete } from "@games/feed-the-shark/components/SharkComplete";

/** Coarse history bucket: splash is "menu", gameplay + completion collapse
 *  into "play" (13 auto-advancing rounds must not stack 13 history entries —
 *  the same grain as the other games). */
function toBucket(screen: SharkScreen): "menu" | "play" {
  return screen === "splash" ? "menu" : "play";
}

export function FeedTheSharkGame() {
  const router = useRouter();
  const { screen, roundIndex, setScreen, nextRound, resetProgress } = useSharkStore();

  // Back button: from gameplay, retreat to the splash instead of exiting
  // straight to the portal.
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

  const hasProgress = roundIndex > 0 && roundIndex < TOTAL_ROUNDS;

  const handleStart = useCallback(() => {
    // A finished (or somehow out-of-range) session starts fresh from A–B
    if (roundIndex >= TOTAL_ROUNDS) resetProgress();
    setScreen("play");
  }, [roundIndex, resetProgress, setScreen]);

  const handlePlayAgain = useCallback(() => {
    resetProgress();
    setScreen("play");
  }, [resetProgress, setScreen]);

  return (
    <GameStage>
      <AnimatePresence mode="wait">
        {screen === "splash" && (
          <motion.div key="splash" className="absolute inset-0" {...PAGE_TRANSITION}>
            <SharkSplash
              onStart={handleStart}
              onExitPortal={() => router.push(PORTAL_ROUTE)}
              hasProgress={hasProgress}
            />
          </motion.div>
        )}
        {screen === "play" && roundIndex < TOTAL_ROUNDS && (
          <motion.div key={`play-${roundIndex}`} className="absolute inset-0" {...PAGE_TRANSITION}>
            {/* keyed by round — each pair remounts fresh: clean local state,
                fresh shark shuffle, zero carry-over, no manual reset logic */}
            <SharkLevel roundIndex={roundIndex} onRoundComplete={nextRound} />
          </motion.div>
        )}
        {screen === "complete" && (
          <motion.div key="complete" className="absolute inset-0" {...PAGE_TRANSITION}>
            <SharkComplete
              onPlayAgain={handlePlayAgain}
              onExitPortal={() => router.push(PORTAL_ROUTE)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </GameStage>
  );
}
