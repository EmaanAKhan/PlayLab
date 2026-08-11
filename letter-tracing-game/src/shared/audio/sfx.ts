"use client";

/**
 * Shared sound-effects layer — every game gets the same synthesized SFX with
 * zero audio assets: tones are generated as in-memory WAVs and cached in
 * Howler. Games call `playCorrectSound()` etc. instead of building their own
 * audio systems. Volume/mute is governed by the shared settings store.
 */

import { Howl, Howler } from "howler";
import { useSettingsStore } from "@shared/stores/settingsStore";

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
// Global volume / mute — driven by the shared settings store
// ---------------------------------------------------------------------------
let settingsWired = false;

/** Apply (and keep applying) the shared audio settings. Call once per app. */
export function initAudio(): void {
  if (typeof window === "undefined" || settingsWired) return;
  settingsWired = true;
  const apply = () => {
    const { soundEnabled, volume } = useSettingsStore.getState();
    Howler.volume(soundEnabled ? volume : 0);
  };
  apply();
  useSettingsStore.subscribe(apply);
}

// ---------------------------------------------------------------------------
// The shared SFX vocabulary
// ---------------------------------------------------------------------------

/** Satisfying three-note ascending chord — a correct answer / success */
export function playCorrectSound(): void {
  getHowl("success-c5", [523], 0.22)?.play();
  setTimeout(() => getHowl("success-e5", [659], 0.22)?.play(), 90);
  setTimeout(() => getHowl("success-g5", [784], 0.32)?.play(), 180);
}

/** Gentle, non-alarming two-note "oops" — never harsh or buzzer-like */
export function playIncorrectSound(): void {
  getHowl("oops-1", [349], 0.16, 0.4)?.play();
  setTimeout(() => getHowl("oops-2", [311], 0.2, 0.4)?.play(), 100);
}

/** Soft single tap / button click */
export function playClickSound(): void {
  getHowl("tap-440", [440], 0.09, 0.55)?.play();
}

/** Subtle two-note mid-task chime (e.g. one stroke of a letter completed) */
export function playChime(): void {
  getHowl("stroke-e5", [659], 0.14)?.play();
  setTimeout(() => getHowl("stroke-b5", [988], 0.18)?.play(), 85);
}

/** Bright little "pop" (earning a star / small reward) */
export function playStarPop(): void {
  getHowl("star-1", [784], 0.1, 0.55)?.play();
  setTimeout(() => getHowl("star-2", [1047], 0.18, 0.55)?.play(), 70);
}

/** Bigger four-note fanfare (finishing a full level / five stars) */
export function playFanfare(): void {
  const melody = [659, 784, 988, 1319];
  melody.forEach((freq, i) => {
    setTimeout(() => getHowl(`five-${freq}`, [freq], 0.24, 0.6)?.play(), i * 80);
  });
}

/** Ascending celebratory scale (level-complete celebrations) */
export function playCelebrationSound(): void {
  const melody = [523, 587, 659, 698, 784, 880, 988, 1047];
  melody.forEach((freq, i) => {
    setTimeout(() => getHowl(`cel-${freq}`, [freq], 0.2)?.play(), i * 95);
  });
}
