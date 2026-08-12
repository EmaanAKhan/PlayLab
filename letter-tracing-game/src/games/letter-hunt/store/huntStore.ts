"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type HuntScreen = "splash" | "home" | "level";

interface HuntState {
  screen: HuntScreen;
  /** 0–25 — the letter the child is currently on */
  currentIndex: number;
  /** Canonical uppercase letters already completed */
  completed: string[];
  setScreen: (s: HuntScreen) => void;
  setIndex: (i: number) => void;
  markCompleted: (letter: string) => void;
}

export const useHuntStore = create<HuntState>()(
  persist(
    (set) => ({
      screen: "splash",
      currentIndex: 0,
      completed: [],
      setScreen: (screen) => set({ screen }),
      setIndex: (currentIndex) => set({ currentIndex }),
      markCompleted: (l) =>
        set((s) => ({
          completed: s.completed.includes(l) ? s.completed : [...s.completed, l],
        })),
    }),
    {
      name: "letter-hunt-progress",
      partialize: (s) => ({ currentIndex: s.currentIndex, completed: s.completed }),
    }
  )
);
