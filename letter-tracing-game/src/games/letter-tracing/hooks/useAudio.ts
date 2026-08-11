"use client";

/**
 * Letter-tracing game audio hook.
 *
 * GAME-SPECIFIC: only the phonics knowledge lives here (letter name → sound →
 * anchor word). Everything generic — SFX, phrases, the speech engine, volume
 * management — comes from the shared audio layer, so every future game reuses
 * the exact same system.
 *
 * The returned API is intentionally unchanged from the pre-portal version so
 * no game screen needed modification during the refactor.
 */

import { useCallback, useEffect } from "react";
import { playClip, playSequence, preloadClips, stopVoice } from "@shared/audio/voice";
import {
  initAudio,
  playCorrectSound,
  playIncorrectSound,
  playClickSound,
  playStarPop as sharedStarPop,
  playFanfare,
  playCelebrationSound,
  playChime,
} from "@shared/audio/sfx";

const NUM_RE = /^[0-9]+$/;

export function useAudio() {
  // Wire shared volume/mute settings once on mount
  useEffect(() => {
    initAudio();
    return () => stopVoice();
  }, []);

  /** Speak the letter (or number) name from its pre-generated clip */
  const pronounceLetter = useCallback((letter: string) => {
    const id = NUM_RE.test(letter) ? `number-${letter}` : `letter-${letter.toLowerCase()}`;
    void playClip(id);
  }, []);

  /** Preload every clip this letter's full flow will need (intro, guidance,
   *  success feedback) so no interaction waits on a fetch */
  const preloadForLetter = useCallback((letter: string) => {
    if (NUM_RE.test(letter)) {
      preloadClips([`number-${letter}`, "instr-watch-carefully", "instr-your-turn"]);
      return;
    }
    const l = letter.toLowerCase();
    preloadClips([
      `letter-${l}`, `phonics-${l}`, `word-${l}`,
      "instr-watch-carefully", "instr-your-turn", "instr-try-again",
      "instr-again", "instr-next",
    ]);
  }, []);

  /**
   * The letter introduction, choreographed from REAL audio durations:
   * name → pause → phonics → pause → anchor word. Resolves only when the
   * voice has completely finished, so the demonstration can never start over
   * speech. onWord fires exactly when the anchor-word clip begins.
   */
  const speakLetterIntro = useCallback(
    (letter: string, onDone?: () => void, onWord?: () => void) => {
      if (NUM_RE.test(letter)) {
        void playClip(`number-${letter}`).then(() => onDone?.());
        return;
      }
      const l = letter.toLowerCase();
      void playSequence(
        [`letter-${l}`, `phonics-${l}`, `word-${l}`],
        250,
        (i) => {
          if (i === 2) onWord?.();
        }
      ).then(() => onDone?.());
    },
    []
  );

  // Generic sounds — delegated to the shared SFX vocabulary
  const playSuccess = useCallback(() => playCorrectSound(), []);
  const playOops = useCallback(() => playIncorrectSound(), []);
  const playTap = useCallback(() => playClickSound(), []);
  const playStrokeComplete = useCallback(() => playChime(), []);
  const playStarPop = useCallback(() => sharedStarPop(), []);
  const playFiveStars = useCallback(() => playFanfare(), []);
  const playCelebration = useCallback(() => playCelebrationSound(), []);

  // Instruction phrases — pre-generated clips; each returns a promise that
  // resolves at the clip's REAL end, so callers choreograph against it
  const sayNowYourTurn = useCallback(() => playClip("instr-your-turn"), []);
  const sayWatchMe = useCallback(() => playClip("instr-watch-carefully"), []);
  const sayTryAgain = useCallback(() => playClip("instr-try-again"), []);
  const sayAgainButton = useCallback(() => playClip("instr-again"), []);
  const sayNextButton = useCallback(() => playClip("instr-next"), []);
  /** Play a SPECIFIC encouragement clip — the id is chosen by the screen so
   *  the displayed text always matches (see CelebrationScreen) */
  const sayCheer = useCallback((cheerId: string) => playClip(cheerId), []);

  return {
    pronounceLetter,
    preloadForLetter,
    speakLetterIntro,
    playSuccess,
    playStrokeComplete,
    playCelebration,
    playTap,
    playOops,
    playStarPop,
    playFiveStars,
    sayNowYourTurn,
    sayWatchMe,
    sayTryAgain,
    sayAgainButton,
    sayNextButton,
    sayCheer,
  };
}
