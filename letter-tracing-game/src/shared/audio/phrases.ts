"use client";

/** Generic spoken phrases shared by all games — one consistent narrator. */
import { speak } from "@shared/audio/speech";

export function sayWatchCarefully(): void {
  // Queued, never interrupting — plays right after any pronunciation
  speak("Watch carefully!", 0.9, 1.18, undefined, false);
}

export function sayYourTurn(): void {
  speak("Now it's your turn!", 0.9, 1.18);
}

export function sayPraise(): void {
  const phrases = ["Great job!", "Wonderful!", "Amazing!", "You did it!", "Fantastic!"];
  speak(phrases[(Math.random() * phrases.length) | 0], 0.95, 1.22);
}
