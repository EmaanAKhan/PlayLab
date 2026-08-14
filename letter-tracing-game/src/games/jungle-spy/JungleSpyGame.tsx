"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useScreenHistorySync } from "@shared/hooks/useScreenHistorySync";
import { AnimatePresence, motion } from "framer-motion";
import { useJungleStore } from "@games/jungle-spy/store/jungleStore";
import { JungleSplash, JungleGrid } from "@games/jungle-spy/components/JungleScreens";
import { JungleLevel } from "@games/jungle-spy/components/JungleLevel";
import { RotateDevicePrompt } from "@shared/components/ui/RotateDevicePrompt";
import { initAudio } from "@shared/audio/sfx";
import { startMusic, stopMusic } from "@shared/audio/music";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";

function toBucket(screen: string): "menu" | "play" {
  return screen === "level" ? "play" : "menu";
}

export function JungleSpyGame() {
  const router = useRouter();
  const { screen, setScreen } = useJungleStore();

  // Shared audio: settings-driven volume + voice pre-load
  useEffect(() => {
    initAudio();
    // Always land on the splash when entering the game fresh
    setScreen("splash");
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


  // Back button: from "level" (play), returns to "grid" (letter/case select).
  const handlePop = useCallback(
    (bucket: string) => {
      if (bucket === "menu") setScreen("grid");
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
      </AnimatePresence>
    </main>
  );
}
