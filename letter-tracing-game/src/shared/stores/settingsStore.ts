"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Portal-level shared settings — global across every game.
 * Game-specific state stays inside each game's own store.
 */
interface SettingsState {
  soundEnabled: boolean;
  /** 0–1 master volume for all synthesized SFX */
  volume: number;
  toggleSound: () => void;
  setVolume: (v: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      volume: 0.8,
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
    }),
    { name: "portal-settings" }
  )
);
