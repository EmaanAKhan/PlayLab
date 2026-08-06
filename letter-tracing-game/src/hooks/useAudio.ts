"use client";

import { useCallback, useEffect, useRef } from "react";
import { Howl, Howler } from "howler";

// ---------------------------------------------------------------------------
// WAV generator — creates PCM audio in-memory so Howler has a src to load.
// No audio files required; everything is generated from sine waves at runtime.
// ---------------------------------------------------------------------------
function buildWavDataURI(
  frequencies: number[],
  durationSec: number,
  volume = 0.16
): string {
  const rate = 22050;
  const samples = Math.floor(rate * durationSec);
  const buf = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buf);

  const u32 = (o: number, n: number) => view.setUint32(o, n, true);
  const u16 = (o: number, n: number) => view.setUint16(o, n, true);

  // RIFF/WAVE header
  [0x52, 0x49, 0x46, 0x46].forEach((b, i) => view.setUint8(i, b)); // "RIFF"
  u32(4, 36 + samples * 2);
  [0x57, 0x41, 0x56, 0x45].forEach((b, i) => view.setUint8(8 + i, b)); // "WAVE"
  [0x66, 0x6d, 0x74, 0x20].forEach((b, i) => view.setUint8(12 + i, b)); // "fmt "
  u32(16, 16); // subchunk size
  u16(20, 1);  // PCM
  u16(22, 1);  // mono
  u32(24, rate);
  u32(28, rate * 2); // byte rate
  u16(32, 2);  // block align
  u16(34, 16); // bits per sample
  [0x64, 0x61, 0x74, 0x61].forEach((b, i) => view.setUint8(36 + i, b)); // "data"
  u32(40, samples * 2);

  for (let i = 0; i < samples; i++) {
    const t = i / rate;
    // Smooth attack (10ms) + release (60ms) envelope
    const attack  = Math.min(t / 0.01, 1);
    const release = Math.min((durationSec - t) / 0.06, 1);
    const env = Math.min(attack, release);

    let s = 0;
    for (const f of frequencies) {
      s += Math.sin(2 * Math.PI * f * t) / frequencies.length;
    }

    const pcm = Math.max(-32768, Math.min(32767, Math.floor(32767 * volume * env * s)));
    view.setInt16(44 + i * 2, pcm, true);
  }

  const bytes = new Uint8Array(buf);
  let b64 = "";
  // btoa-safe encoding
  for (let i = 0; i < bytes.length; i++) {
    b64 += String.fromCharCode(bytes[i]);
  }
  return "data:audio/wav;base64," + btoa(b64);
}

// ---------------------------------------------------------------------------
// Howl factory — lazy, cached by key so we never regenerate the same sound.
// ---------------------------------------------------------------------------
const howlCache = new Map<string, Howl>();

function getHowl(
  key: string,
  frequencies: number[],
  durationSec: number,
  volume = 0.7
): Howl | null {
  if (typeof window === "undefined") return null;
  if (!howlCache.has(key)) {
    try {
      const src = buildWavDataURI(frequencies, durationSec, 0.16);
      const howl = new Howl({
        src: [src],
        format: ["wav"],
        volume,
        html5: false,
      });
      howlCache.set(key, howl);
    } catch {
      return null;
    }
  }
  return howlCache.get(key) ?? null;
}

// ---------------------------------------------------------------------------
// Web Speech API helper for letter pronunciation.
// Howler doesn't do TTS, so the Web Speech API is the correct tool here.
// ---------------------------------------------------------------------------
function speak(text: string, rate = 0.85, pitch = 1.1): void {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = 1;
  // Prefer a child-friendly English voice when available
  const preferred = synth.getVoices().find(
    (v) =>
      v.lang.startsWith("en") &&
      (v.name.includes("Samantha") ||
        v.name.includes("Karen") ||
        v.name.includes("Google") ||
        v.name.includes("Female"))
  );
  if (preferred) utterance.voice = preferred;
  synth.speak(utterance);
}

// ---------------------------------------------------------------------------
// Public hook
// ---------------------------------------------------------------------------
export function useAudio() {
  const voicesReadyRef = useRef(false);

  // Pre-load speech voices and set Howler global volume once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    Howler.volume(0.8);
    const synth = window.speechSynthesis;
    if (!synth) return;
    const load = () => {
      synth.getVoices();
      voicesReadyRef.current = true;
    };
    load();
    synth.addEventListener("voiceschanged", load);
    return () => synth.removeEventListener("voiceschanged", load);
  }, []);

  /** Speak the letter name aloud (Web Speech API — Howler doesn't do TTS) */
  const pronounceLetter = useCallback((letter: string) => {
    speak(letter, 0.8, 1.15);
  }, []);

  /** Speak the full phonetic description */
  const pronouncePhonetic = useCallback((text: string) => {
    speak(text, 0.8, 1.1);
  }, []);

  /** Satisfying three-note ascending chord on full letter completion */
  const playSuccess = useCallback(() => {
    getHowl("success-c5", [523], 0.22)?.play();
    setTimeout(() => getHowl("success-e5", [659], 0.22)?.play(), 90);
    setTimeout(() => getHowl("success-g5", [784], 0.32)?.play(), 180);
  }, []);

  /** Short two-note chime when an individual stroke is completed */
  const playStrokeComplete = useCallback(() => {
    getHowl("stroke-e5", [659], 0.14)?.play();
    setTimeout(() => getHowl("stroke-b5", [988], 0.18)?.play(), 85);
  }, []);

  /** Ascending scale burst for the celebration screen */
  const playCelebration = useCallback(() => {
    const melody = [523, 587, 659, 698, 784, 880, 988, 1047];
    melody.forEach((freq, i) => {
      setTimeout(
        () => getHowl(`cel-${freq}`, [freq], 0.2)?.play(),
        i * 95
      );
    });
  }, []);

  /** Soft single tap feedback */
  const playTap = useCallback(() => {
    getHowl("tap-440", [440], 0.09, 0.55)?.play();
  }, []);

  const sayNowYourTurn = useCallback(() => {
    speak("Now it is your turn!", 0.85, 1.1);
  }, []);

  const sayWatchMe = useCallback(() => {
    speak("Watch me trace this letter!", 0.85, 1.1);
  }, []);

  const sayGreat = useCallback(() => {
    const phrases = [
      "Amazing!",
      "Wonderful!",
      "You did it!",
      "Great job!",
      "Fantastic!",
    ];
    speak(phrases[(Math.random() * phrases.length) | 0], 0.9, 1.2);
  }, []);

  return {
    pronounceLetter,
    pronouncePhonetic,
    playSuccess,
    playStrokeComplete,
    playCelebration,
    playTap,
    sayNowYourTurn,
    sayWatchMe,
    sayGreat,
  };
}
