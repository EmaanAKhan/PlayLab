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
const PAGE_TRANSITION = {
  initial: { opacity: 0, scale: 0.97, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 1.02, y: -8 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
};

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
            <JungleSplash onExitPortal={() => router.push("/")} />
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
