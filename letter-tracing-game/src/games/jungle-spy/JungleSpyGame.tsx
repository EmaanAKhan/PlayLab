"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useJungleStore } from "@games/jungle-spy/store/jungleStore";
import { JungleSplash, JungleGrid } from "@games/jungle-spy/components/JungleScreens";
import { JungleLevel } from "@games/jungle-spy/components/JungleLevel";
import { RotateDevicePrompt } from "@shared/components/ui/RotateDevicePrompt";
import { initAudio } from "@shared/audio/sfx";

const T = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

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

  return (
    <main className="relative h-full w-full overflow-hidden">
      <RotateDevicePrompt />
      <AnimatePresence mode="wait">
        {screen === "splash" && (
          <motion.div key="splash" className="absolute inset-0" {...T}>
            <JungleSplash />
          </motion.div>
        )}
        {screen === "grid" && (
          <motion.div key="grid" className="absolute inset-0" {...T}>
            <JungleGrid onExitPortal={() => router.push("/")} />
          </motion.div>
        )}
        {screen === "level" && (
          <motion.div key="level" className="absolute inset-0" {...T}>
            <JungleLevel />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
