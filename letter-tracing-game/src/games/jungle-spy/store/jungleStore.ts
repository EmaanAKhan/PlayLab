"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LetterCase = "upper" | "lower";
export type JungleScreen = "splash" | "grid" | "level";

interface JungleState {
  screen: JungleScreen;
  letterCase: LetterCase;
  currentLetter: string;
  /** Canonical UPPERCASE letters the child has completed */
  found: string[];
  setScreen: (s: JungleScreen) => void;
  setCase: (c: LetterCase) => void;
  setLetter: (l: string) => void;
  markFound: (l: string) => void;
  resetProgress: () => void;
}

export const useJungleStore = create<JungleState>()(
  persist(
    (set) => ({
      screen: "splash",
      letterCase: "upper",
      currentLetter: "A",
      found: [],
      setScreen: (screen) => set({ screen }),
      setCase: (letterCase) => set({ letterCase }),
      setLetter: (currentLetter) => set({ currentLetter }),
      markFound: (l) =>
        set((s) => ({
          found: s.found.includes(l.toUpperCase()) ? s.found : [...s.found, l.toUpperCase()],
        })),
      resetProgress: () => set({ found: [] }),
    }),
    {
      name: "jungle-spy-progress",
      // screen/currentLetter are session flow, not progress
      partialize: (s) => ({ found: s.found, letterCase: s.letterCase }),
    }
  )
);
