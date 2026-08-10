"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameScreen, GameProgress, StickerTheme, Module, PracticeMode } from "@/types";
import { symbolsFor } from "@/constants/symbols";
import { getThemeForProgress } from "@/constants/rewards";

interface GameState {
  screen: GameScreen;
  module: Module;
  /** Chosen once per session; null until the child picks Free or 5 Star */
  practiceMode: PracticeMode | null;
  progress: GameProgress;
  lowercaseProgress: GameProgress;
  numbersProgress: GameProgress;

  // Actions
  setScreen: (screen: GameScreen) => void;
  setModule: (module: Module) => void;
  setPracticeMode: (mode: PracticeMode) => void;
  goToLetter: (index: number) => void;
  completeCurrentLetter: () => void;
  resetProgress: () => void;
  resetLowercaseProgress: () => void;
  resetNumbersProgress: () => void;
}

const defaultProgress: GameProgress = {
  currentLetterIndex: 0,
  completedLetters: [],
  unlockedStickers: [],
  currentTheme: "garden",
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      screen: "splash",
      module: "uppercase",
      practiceMode: null,
      progress: { ...defaultProgress },
      lowercaseProgress: { ...defaultProgress },
      numbersProgress: { ...defaultProgress },

      setScreen: (screen) => set({ screen }),

      setModule: (module) => set({ module }),

      setPracticeMode: (practiceMode) => set({ practiceMode }),

      goToLetter: (index) => {
        const { module } = get();
        if (module === "lowercase") {
          set((state) => ({
            lowercaseProgress: { ...state.lowercaseProgress, currentLetterIndex: index },
          }));
        } else if (module === "numbers") {
          set((state) => ({
            numbersProgress: { ...state.numbersProgress, currentLetterIndex: index },
          }));
        } else {
          set((state) => ({
            progress: { ...state.progress, currentLetterIndex: index },
          }));
        }
      },

      completeCurrentLetter: () => {
        const { progress, lowercaseProgress, numbersProgress, module } = get();
        const currentProgress =
          module === "lowercase" ? lowercaseProgress : module === "numbers" ? numbersProgress : progress;
        const letter = symbolsFor(module)[currentProgress.currentLetterIndex];

        if (!letter) return;

        const completedLetters = currentProgress.completedLetters.includes(letter)
          ? currentProgress.completedLetters
          : [...currentProgress.completedLetters, letter];

        const stickerId = `sticker-${currentProgress.currentLetterIndex}`;
        const unlockedStickers = currentProgress.unlockedStickers.includes(stickerId)
          ? currentProgress.unlockedStickers
          : [...currentProgress.unlockedStickers, stickerId];

        const newTheme: StickerTheme = getThemeForProgress(completedLetters.length);

        const updated = {
          ...currentProgress,
          completedLetters,
          unlockedStickers,
          currentTheme: newTheme,
        };

        if (module === "lowercase") {
          set({ lowercaseProgress: updated });
        } else if (module === "numbers") {
          set({ numbersProgress: updated });
        } else {
          set({ progress: updated });
        }
      },

      resetProgress: () =>
        set({
          progress: { ...defaultProgress },
          screen: "home",
        }),

      resetLowercaseProgress: () =>
        set({
          lowercaseProgress: { ...defaultProgress },
          screen: "home",
        }),

      resetNumbersProgress: () =>
        set({
          numbersProgress: { ...defaultProgress },
          screen: "home",
        }),
    }),
    {
      name: "letter-tracing-progress",
      partialize: (state) => ({
        progress: state.progress,
        lowercaseProgress: state.lowercaseProgress,
        numbersProgress: state.numbersProgress,
      }),
    }
  )
);
