"use client";

import { Button } from "@shared/components/ui/Button";
import { playClickSound } from "@shared/audio/sfx";

interface StartOptionsProps {
  /** True when saved progress exists — shows Continue as the primary action */
  hasProgress: boolean;
  onContinue: () => void;
  onStartFromA: () => void;
  /** e.g. "Continue · F" — defaults to plain "Continue" */
  continueLabel?: string;
  /** Defaults to "Start from A" (tracing's numbers module passes "Start from 1") */
  startLabel?: string;
}

/**
 * The ONE start-flow control used by every game's letter-selection screen:
 *   Continue (primary, only when progress exists) · Start from A
 * The letter grid/shelf below it (each game's own) covers "choose a letter".
 * One component so the three games can never drift apart again.
 */
export function StartOptions({ hasProgress, onContinue, onStartFromA, continueLabel, startLabel }: StartOptionsProps) {
  return (
    <div className="relative z-10 flex flex-wrap items-center justify-center gap-3">
    {hasProgress && (
        <Button
          size="md"
          onClick={() => { playClickSound(); onContinue(); }}
          aria-label="Continue from where you left off"
        >
          {continueLabel ?? "Continue"}
        </Button>
      )}
      <Button
        size="md"
        variant={hasProgress ? "secondary" : "primary"}
        onClick={() => { playClickSound(); onStartFromA(); }}
        aria-label={startLabel ?? "Start from A"}
      >
        {startLabel ?? "Start from A"}
      </Button>
    </div>
  );
}
