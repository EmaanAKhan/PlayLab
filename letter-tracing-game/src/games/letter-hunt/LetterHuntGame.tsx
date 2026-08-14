"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useScreenHistorySync } from "@shared/hooks/useScreenHistorySync";
import { AnimatePresence, motion } from "framer-motion";
import { useHuntStore } from "@games/letter-hunt/store/huntStore";
import { HuntSplash, HuntHome } from "@games/letter-hunt/components/HuntScreens";
import { HuntLevel } from "@games/letter-hunt/components/HuntLevel";
import { RotateDevicePrompt } from "@shared/components/ui/RotateDevicePrompt";
import { initAudio } from "@shared/audio/sfx";
import { startMusic, stopMusic } from "@shared/audio/music";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";

/** Coarse history bucket for this game's screen graph. "level" (gameplay)
 *  is its own step; splash/home collapse into "menu" so switching letters
 *  from the home shelf never spams history — only entering/leaving actual
 *  play does. */
function toBucket(screen: string): "menu" | "play" {
  return screen === "level" ? "play" : "menu";
}

export function LetterHuntGame() {
  const router = useRouter();
  const { screen, setScreen } = useHuntStore();

  useEffect(() => {
    initAudio();
    setScreen("splash"); // always enter through the short splash
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Background music: starts once the child taps past the splash (that tap
  // unlocks the AudioContext), loops for the whole session, fades out when
  // the game unmounts. startMusic is a shared singleton — hopping between
  // games can never stack two tracks.
  useEffect(() => {
    if (screen !== "splash") startMusic();
  }, [screen]);
  useEffect(() => () => stopMusic(), []);


  // Back button: from "level" (play), returns to "home" (menu) instead of
  // exiting straight to the portal.
  const handlePop = useCallback(
    (bucket: string) => {
      if (bucket === "menu") setScreen("home");
      // "play" popped-to has no meaningful target here (you can only reach
      // play going forward from home), so nothing to do — the forward push
      // that created it already put the right screen in place.
    },
    [setScreen]
  );
  useScreenHistorySync(toBucket(screen), handlePop);

  return (
    <main className="relative h-full w-full overflow-hidden">
      <RotateDevicePrompt />
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
    </main>
  );
}
