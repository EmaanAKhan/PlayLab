"use client";

/**
 * useScreenHistorySync — makes the browser's back/forward buttons step
 * backward through a game's own screens (splash → menu → play) instead of
 * exiting straight to the portal, by giving each STEP a real entry in
 * `window.history` via the URL's `?step=` query param.
 *
 * IMPORTANT — pass a COARSE step, not every fine-grained internal screen.
 * Collapse gameplay churn (e.g. tracing ↔ celebration, one pair per letter,
 * or repeated puzzle rounds) into a single "play" step. If every internal
 * screen pushed a history entry, finishing a long session would leave
 * dozens of stacked entries and "back" would just replay old celebration
 * screens instead of meaningfully retreating through the game's structure.
 * Three buckets — entry/splash, menu/selection, play — is the right grain
 * for "back doesn't skip past the steps the player actually took."
 *
 * Usage (once, in a game's top-level component):
 *
 *   const bucket = screenToBucket(screen); // your own mapping fn
 *   useScreenHistorySync(bucket, (urlStep) => setScreen(bucketToScreen(urlStep)));
 *
 * The component using this hook's page.tsx MUST be wrapped in <Suspense>,
 * since it reads useSearchParams() (a Next.js App Router requirement).
 *
 * For an in-game "back" button that should undo exactly the most recent
 * push (e.g. a level screen's "back to letter select"), call router.back()
 * directly instead of setScreen() — that keeps the stack symmetric. Jumps
 * that skip multiple steps (e.g. a "Home" button reachable from deep in
 * gameplay) are treated as a new forward step, not an undo — see the
 * per-game notes in CHANGES.md for where that trade-off applies.
 */

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useScreenHistorySync(
  step: string,
  onPop: (step: string) => void,
  paramName = "step"
): void {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fromUrl = useRef(false);
  const lastSynced = useRef<string | null>(null);
  const mounted = useRef(false);

  // Browser back/forward (or any external URL change) → sync game state to
  // match, WITHOUT pushing another entry (that would fight the browser).
  useEffect(() => {
    const urlStep = searchParams.get(paramName);
    if (urlStep && urlStep !== lastSynced.current) {
      fromUrl.current = true;
      lastSynced.current = urlStep;
      onPop(urlStep);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Game state changes (forward navigation) → push a new history entry.
  // Skipped when the change just came FROM a URL sync above, and skipped
  // when the bucket hasn't actually changed (no-op churn inside "play").
  useEffect(() => {
    if (fromUrl.current) {
      fromUrl.current = false;
      return;
    }
    if (step === lastSynced.current) return;
    lastSynced.current = step;

    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, step);
    const url = `${pathname}?${params.toString()}`;

    // The very first sync just establishes the initial URL — replace, so
    // entering a game doesn't cost an extra back-tap before you even reach
    // the portal. Every step after that is a real forward navigation.
    if (!mounted.current) {
      mounted.current = true;
      router.replace(url, { scroll: false });
    } else {
      router.push(url, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);
}
