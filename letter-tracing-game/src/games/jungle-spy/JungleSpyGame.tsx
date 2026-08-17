"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { useJungleStore, type JungleScreen } from "@games/jungle-spy/store/jungleStore";
import { JungleSplash, JungleGrid } from "@games/jungle-spy/components/JungleScreens";
import { JungleLevel } from "@games/jungle-spy/components/JungleLevel";
import { JungleComplete } from "@games/jungle-spy/components/JungleComplete";

/** Coarse history bucket: gameplay is its own step; splash/grid collapse into
 *  "menu" so browsing letters never spams history. */
function toBucket(screen: JungleScreen): "menu" | "play" {
  // the finale sits with gameplay: back from it returns to the letter board,
  // not out of the game
  return screen === "level" || screen === "complete" ? "play" : "menu";
}

export function JungleSpyGame() {
  const router = useRouter();
  const { screen, setScreen } = useJungleStore();

  // Back button: from "level" (play), returns to "grid" (letter/case select).
  const handlePop = useCallback(
    (bucket: string) => {
      if (bucket === "menu") setScreen("grid");
    },
    [setScreen]
  );

  useGameSession({
    screen,
    step: toBucket(screen),
    onHistoryPop: handlePop,
    // Always land on the splash when entering the game fresh
    onEnter: () => setScreen("splash"),
  });

  return (
    <GameStage>
      <AnimatePresence mode="wait">
        {screen === "splash" && (
          <motion.div key="splash" className="absolute inset-0" {...PAGE_TRANSITION}>
            <JungleSplash onExitPortal={() => router.push(PORTAL_ROUTE)} />
          </motion.div>
        )}
        {screen === "grid" && (
          <motion.div key="grid" className="absolute inset-0" {...PAGE_TRANSITION}>
            <JungleGrid />
          </motion.div>
        )}
        {screen === "level" && (
          <motion.div key="level" className="absolute inset-0" {...PAGE_TRANSITION}>
            <JungleLevel />
          </motion.div>
        )}
        {screen === "complete" && (
          <motion.div key="complete" className="absolute inset-0" {...PAGE_TRANSITION}>
            <JungleComplete onExitPortal={() => router.push(PORTAL_ROUTE)} />
          </motion.div>
        )}
      </AnimatePresence>
    </GameStage>
  );
}
