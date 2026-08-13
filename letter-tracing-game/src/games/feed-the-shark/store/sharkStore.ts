"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TOTAL_ROUNDS } from "@games/feed-the-shark/constants/letters";

export type SharkScreen = "splash" | "play" | "complete";

interface SharkState {
  screen: SharkScreen;
  /** 0–12 — the letter pair the child is currently on (13 = finished) */
  roundIndex: number;
  setScreen: (s: SharkScreen) => void;
  /** Advance one round; lands on "complete" after the final (Y–Z) pair */
  nextRound: () => void;
  resetProgress: () => void;
}

export const useSharkStore = create<SharkState>()(
  persist(
    (set) => ({
      screen: "splash",
      roundIndex: 0,
      setScreen: (screen) => set({ screen }),
      nextRound: () =>
        set((s) => {
          const next = s.roundIndex + 1;
          return next >= TOTAL_ROUNDS
            ? { roundIndex: next, screen: "complete" }
            : { roundIndex: next };
        }),
      resetProgress: () => set({ roundIndex: 0 }),
    }),
    {
      name: "feed-the-shark-progress",
      // screen is session flow, not progress — refresh always re-enters via splash
      partialize: (s) => ({ roundIndex: s.roundIndex }),
    }
  )
);
