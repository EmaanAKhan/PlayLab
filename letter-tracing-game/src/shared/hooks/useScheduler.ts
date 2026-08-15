"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Schedules delayed work that is guaranteed not to outlive the screen.
 *
 * Gameplay pacing is built from deliberate delays — a plop lands, then the
 * cheer, then the round advances. If the child navigates away mid-sequence,
 * a surviving timer would fire a state update or an auto-advance on a screen
 * that no longer exists, yanking them back into a level they just left. Every
 * screen that paces itself therefore tracked its own timer ids and cleared
 * them on unmount; this hook is that pattern, once.
 *
 *   const schedule = useScheduler();
 *   schedule(() => setBurst(null), 650);
 */
export function useScheduler(): (fn: () => void, ms: number) => void {
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  return useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);
}
