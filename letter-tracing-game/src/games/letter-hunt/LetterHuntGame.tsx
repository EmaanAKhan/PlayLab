"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { useHuntStore, type HuntScreen } from "@games/letter-hunt/store/huntStore";
import { HuntSplash, HuntHome } from "@games/letter-hunt/components/HuntScreens";
import { HuntLevel } from "@games/letter-hunt/components/HuntLevel";

/** Coarse history bucket for this game's screen graph. "level" (gameplay)
 *  is its own step; splash/home collapse into "menu" so switching letters
 *  from the home shelf never spams history — only entering/leaving actual
 *  play does. */
function toBucket(screen: HuntScreen): "menu" | "play" {
  return screen === "level" ? "play" : "menu";
}

export function LetterHuntGame() {
  const router = useRouter();
  const { screen, setScreen } = useHuntStore();

  // Back button: from "level" (play), returns to "home" (menu) instead of
  // exiting straight to the portal. "play" popped-to has no meaningful target
  // here (you can only reach play going forward from home), so nothing to do —
  // the forward push that created it already put the right screen in place.
  const handlePop = useCallback(
    (bucket: string) => {
      if (bucket === "menu") setScreen("home");
    },
    [setScreen]
  );

  useGameSession({
    screen,
    step: toBucket(screen),
    onHistoryPop: handlePop,
    onEnter: () => setScreen("splash"), // always enter through the short splash
  });

  return (
    <GameStage>
      <AnimatePresence mode="wait">
        {screen === "splash" && (
          <motion.div key="splash" className="absolute inset-0" {...PAGE_TRANSITION}>
            <HuntSplash />
          </motion.div>
        )}
        {screen === "home" && (
          <motion.div key="home" className="absolute inset-0" {...PAGE_TRANSITION}>
            <HuntHome onExitPortal={() => router.push(PORTAL_ROUTE)} />
          </motion.div>
        )}
        {screen === "level" && (
          <motion.div key="level" className="absolute inset-0" {...PAGE_TRANSITION}>
            <HuntLevel />
          </motion.div>
        )}
      </AnimatePresence>
    </GameStage>
  );
}
