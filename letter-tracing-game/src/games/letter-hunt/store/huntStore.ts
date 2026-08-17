"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type HuntCase = "upper" | "lower";
export type HuntScreen = "splash" | "home" | "level" | "complete";

interface HuntState {
  screen: HuntScreen;
  /** BIG letters or little letters — a separate run, and a separate finale. */
  letterCase: HuntCase;
  /** 0–25 — the letter the child is currently on */
  currentIndex: number;
  /**
   * Canonical uppercase letters already completed, kept PER CASE so finishing
   * the BIG letters does not silently mark the little ones done too (the
   * tracing game keeps its uppercase and lowercase modules apart the same
   * way). `completed` keeps its original name, so progress a child already has
   * carries over as their uppercase run and the lowercase list starts empty.
   */
  completed: string[];
  completedLower: string[];
  setScreen: (s: HuntScreen) => void;
  setCase: (c: HuntCase) => void;
  setIndex: (i: number) => void;
  markCompleted: (letter: string) => void;
  resetProgress: (c?: HuntCase) => void;
}

export const useHuntStore = create<HuntState>()(
  persist(
    (set) => ({
      screen: "splash",
      letterCase: "upper",
      currentIndex: 0,
      completed: [],
      completedLower: [],
      setScreen: (screen) => set({ screen }),
      setCase: (letterCase) => set({ letterCase }),
      setIndex: (currentIndex) => set({ currentIndex }),
      markCompleted: (l) =>
        set((s) => {
          const key = s.letterCase === "lower" ? "completedLower" : "completed";
          const letter = l.toUpperCase();
          if (s[key].includes(letter)) return {};
          return { [key]: [...s[key], letter] } as Partial<HuntState>;
        }),
      resetProgress: (c) =>
        set((s) => {
          const key = (c ?? s.letterCase) === "lower" ? "completedLower" : "completed";
          return { [key]: [], currentIndex: 0 } as Partial<HuntState>;
        }),
    }),
    {
      name: "letter-hunt-progress",
      partialize: (s) => ({
        currentIndex: s.currentIndex,
        completed: s.completed,
        completedLower: s.completedLower,
        letterCase: s.letterCase,
      }),
    }
  )
);

/** The list for a given case — read this rather than picking a field by hand. */
export function completedFor(
  state: Pick<HuntState, "completed" | "completedLower">,
  c: HuntCase
): string[] {
  return c === "lower" ? state.completedLower : state.completed;
}
