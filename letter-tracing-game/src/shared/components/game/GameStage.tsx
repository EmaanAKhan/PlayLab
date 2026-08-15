"use client";

import type { ReactNode } from "react";
import { RotateDevicePrompt } from "@shared/components/ui/RotateDevicePrompt";

interface GameStageProps {
  children: ReactNode;
  /**
   * Set false for a game that mounts the orientation hint deeper in its own
   * tree instead of at the stage level (Letter Tracing shows it on the
   * tracing board only, where the extra width actually matters).
   */
  withRotatePrompt?: boolean;
}

/**
 * The frame every game runs inside: a full-bleed, non-scrolling stage plus the
 * portrait-phone orientation hint.
 *
 * Games render their own screen graph inside it. Keeping the stage here means
 * the "no page scroll, fill the viewport" contract — the thing that stops a
 * game from accidentally growing a scrollbar on some device — is stated once.
 */
export function GameStage({ children, withRotatePrompt = true }: GameStageProps) {
  return (
    <main className="relative h-full w-full overflow-hidden">
      {withRotatePrompt && <RotateDevicePrompt />}
      {children}
    </main>
  );
}
