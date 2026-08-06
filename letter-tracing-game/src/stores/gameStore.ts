"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameScreen, GameProgress, StickerTheme, Module } from "@/types";
import { getThemeForProgress } from "@/constants/rewards";

interface GameState {
  screen: GameScreen;
  module: Module;
  progress: GameProgress;
  lowercaseProgress: GameProgress;

  // Actions
  setScreen: (screen: GameScreen) => void;
  setModule: (module: Module) => void;
  goToLetter: (index: number) => void;
  completeCurrentLetter: () => void;
  resetProgress: () => void;
  resetLowercaseProgress: () => void;
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
      progress: { ...defaultProgress },
      lowercaseProgress: { ...defaultProgress },

      setScreen: (screen) => set({ screen }),

      setModule: (module) => set({ module }),

      goToLetter: (index) => {
        const { module } = get();
        if (module === "lowercase") {
          set((state) => ({
            lowercaseProgress: { ...state.lowercaseProgress, currentLetterIndex: index },
          }));
        } else {
          set((state) => ({
            progress: { ...state.progress, currentLetterIndex: index },
          }));
        }
      },

      completeCurrentLetter: () => {
        const { progress, lowercaseProgress, module } = get();
        const currentProgress = module === "lowercase" ? lowercaseProgress : progress;
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const letter = letters[currentProgress.currentLetterIndex];

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
    }),
    {
      name: "letter-tracing-progress",
      partialize: (state) => ({
        progress: state.progress,
        lowercaseProgress: state.lowercaseProgress,
      }),
    }
  )
);
