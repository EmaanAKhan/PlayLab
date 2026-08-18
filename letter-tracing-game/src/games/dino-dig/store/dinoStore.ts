"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TOTAL_CROSSINGS } from "@games/dino-dig/constants/rounds";

export type DinoScreen = "splash" | "play" | "complete";
export type DinoMode = "feed" | "stones";

interface DinoState {
  screen: DinoScreen;
  mode: DinoMode;
  /** River Crossing progress: crossings completed (0–7). The one persisted
   *  field — a feed session is 10 quick taps and always starts fresh. */
  stonesRound: number;
  /** The letters served in the just-finished feed session (finale tiles). */
  feedLetters: string[];
  setScreen: (s: DinoScreen) => void;
  /** Splash mode pick — the tap that also unlocks audio. */
  startMode: (m: DinoMode) => void;
  completeFeed: (letters: string[]) => void;
  /** One dino across; lands on "complete" when all seven have crossed. */
  crossingDone: () => void;
  playAgain: () => void;
}

export const useDinoStore = create<DinoState>()(
  persist(
    (set) => ({
      screen: "splash",
      mode: "feed",
      stonesRound: 0,
      feedLetters: [],
      setScreen: (screen) => set({ screen }),
      startMode: (mode) =>
        set((s) => ({
          mode,
          screen: "play",
          // a finished river resets so the button always has a crossing to play
          stonesRound:
            mode === "stones" && s.stonesRound >= TOTAL_CROSSINGS ? 0 : s.stonesRound,
        })),
      completeFeed: (feedLetters) => set({ feedLetters, screen: "complete" }),
      crossingDone: () =>
        set((s) => {
          const next = s.stonesRound + 1;
          return next >= TOTAL_CROSSINGS
            ? { stonesRound: next, screen: "complete" }
            : { stonesRound: next };
        }),
      playAgain: () =>
        set((s) => ({
          screen: "play",
          ...(s.mode === "stones" ? { stonesRound: 0 } : null),
        })),
    }),
    {
      name: "dino-dig-progress",
      // screen/mode are session flow; a stale `roundIndex` from the earlier
      // dig prototype may linger in storage and is simply ignored
      partialize: (s) => ({ stonesRound: s.stonesRound }),
    }
  )
);
