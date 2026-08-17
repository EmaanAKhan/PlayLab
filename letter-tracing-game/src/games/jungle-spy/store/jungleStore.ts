"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LetterCase = "upper" | "lower";
export type JungleScreen = "splash" | "grid" | "level" | "complete";

interface JungleState {
  screen: JungleScreen;
  letterCase: LetterCase;
  currentLetter: string;
  /**
   * Progress is tracked PER CASE, exactly as the tracing game keeps its
   * uppercase, lowercase and numbers modules apart. Finding "A" next to the
   * ant teaches a different thing from finding "a", so finishing one case must
   * not silently hand the child the other — each case earns its own finale.
   *
   * Both lists hold canonical UPPERCASE letters; only the display differs.
   * `found` keeps its original name and meaning (the uppercase run), so a
   * child's already-persisted progress carries over untouched and the new
   * lowercase list simply starts empty.
   */
  found: string[];
  foundLower: string[];
  setScreen: (s: JungleScreen) => void;
  setCase: (c: LetterCase) => void;
  setLetter: (l: string) => void;
  markFound: (l: string) => void;
  resetProgress: (c?: LetterCase) => void;
}

export const useJungleStore = create<JungleState>()(
  persist(
    (set) => ({
      screen: "splash",
      letterCase: "upper",
      currentLetter: "A",
      found: [],
      foundLower: [],
      setScreen: (screen) => set({ screen }),
      setCase: (letterCase) => set({ letterCase }),
      setLetter: (currentLetter) => set({ currentLetter }),
      markFound: (l) =>
        set((s) => {
          const key = s.letterCase === "lower" ? "foundLower" : "found";
          const letter = l.toUpperCase();
          if (s[key].includes(letter)) return {};
          return { [key]: [...s[key], letter] } as Partial<JungleState>;
        }),
      resetProgress: (c) =>
        set((s) => {
          const key = (c ?? s.letterCase) === "lower" ? "foundLower" : "found";
          return { [key]: [] } as Partial<JungleState>;
        }),
    }),
    {
      name: "jungle-spy-progress",
      // screen/currentLetter are session flow, not progress
      partialize: (s) => ({ found: s.found, foundLower: s.foundLower, letterCase: s.letterCase }),
    }
  )
);

/** The list for a given case — read this rather than picking a field by hand. */
export function foundFor(
  state: Pick<JungleState, "found" | "foundLower">,
  c: LetterCase
): string[] {
  return c === "lower" ? state.foundLower : state.found;
}
