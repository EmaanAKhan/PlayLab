"use client";

/**
 * Shared background music — ONE gentle looping track for every game.
 *
 * Follows the platform's zero-asset audio philosophy (see sfx.ts): the music
 * is COMPOSED PROCEDURALLY at runtime — a soft marimba-style pentatonic
 * arpeggio over a slow I–vi–IV–I–V–I progression — rendered once into an
 * in-memory WAV and looped by Howler. No file to ship, nothing to load.
 *
 * Seamlessness is guaranteed by construction: notes are written into the
 * buffer with WRAPAROUND, so a note-tail that runs past the end continues at
 * sample 0 — the loop point is mathematically inaudible.
 *
 * Rules enforced here (not left to each game):
 *  - SINGLETON: startMusic() is idempotent; two tracks can never overlap,
 *    including when hopping between games.
 *  - Mute/volume: plays through Howler, so the shared settings store's
 *    global Howler.volume() (wired in initAudio) governs it automatically.
 *  - Autoplay: reaching any game's post-splash screen requires a tap, and
 *    Howler's autoUnlock resumes the AudioContext on that first gesture —
 *    so starting from a screen-change effect is reliable.
 *  - Ducking: voice narration lowers the music and restores it after, so
 *    instructions are never fighting the soundtrack.
 */

import { Howl } from "howler";

const RATE = 22050;
const BPM = 84;
const MUSIC_VOLUME = 0.2;
const DUCKED_VOLUME = 0.1;

// C-major pentatonic voicings per bar: [bass, chord tones for the arp]
const BARS: { bass: number; tones: number[] }[] = [
  { bass: 130.81, tones: [261.63, 329.63, 392.0, 523.25] }, // C
  { bass: 110.0, tones: [220.0, 261.63, 329.63, 440.0] },   // Am
  { bass: 87.31, tones: [174.61, 261.63, 349.23, 440.0] },  // F
  { bass: 130.81, tones: [261.63, 329.63, 392.0, 523.25] }, // C
  { bass: 98.0, tones: [196.0, 293.66, 392.0, 493.88] },    // G
  { bass: 130.81, tones: [261.63, 329.63, 392.0, 523.25] }, // C
];

/** Soft mallet voice: fundamental + gentle harmonics, fast attack, long decay */
function addNote(
  out: Float32Array,
  startSample: number,
  freq: number,
  durSec: number,
  vel: number
) {
  const n = Math.floor(durSec * RATE);
  const total = out.length;
  const attack = Math.floor(0.006 * RATE);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const env =
      (i < attack ? i / attack : Math.exp(-(i - attack) / (0.24 * RATE))) * vel;
    const s =
      Math.sin(2 * Math.PI * freq * t) * 1.0 +
      Math.sin(2 * Math.PI * freq * 2 * t) * 0.28 +
      Math.sin(2 * Math.PI * freq * 3 * t) * 0.09;
    out[(startSample + i) % total] += s * env; // wraparound → seamless loop
  }
}

function composeLoop(): Float32Array {
  const beat = 60 / BPM;
  const eighth = beat / 2;
  const barSec = beat * 4;
  const total = Math.floor(BARS.length * barSec * RATE);
  const out = new Float32Array(total);

  BARS.forEach((bar, b) => {
    const barStart = b * barSec;
    // soft bass on beats 1 and 3
    addNote(out, Math.floor(barStart * RATE), bar.bass, 1.4, 0.14);
    addNote(out, Math.floor((barStart + 2 * beat) * RATE), bar.bass * 1.5, 1.1, 0.09);
    // lilting up-down eighth-note arpeggio, tiny velocity variation
    const contour = [0, 1, 2, 3, 2, 3, 1, 2];
    contour.forEach((tone, i) => {
      const vel = 0.115 + (i % 2 === 0 ? 0.02 : 0) + (i === 0 ? 0.015 : 0);
      addNote(out, Math.floor((barStart + i * eighth) * RATE), bar.tones[tone], 0.55, vel);
    });
    // a sparse high "bell" every other bar for sparkle
    if (b % 2 === 1) {
      addNote(out, Math.floor((barStart + 3 * beat) * RATE), bar.tones[3] * 2, 0.9, 0.045);
    }
  });

  // gentle soft-clip so summed voices can never crackle
  for (let i = 0; i < total; i++) out[i] = Math.tanh(out[i] * 1.4) * 0.62;
  return out;
}

function toWavDataURI(pcm: Float32Array): string {
  const samples = pcm.length;
  const buf = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buf);
  const u32 = (o: number, v: number) => view.setUint32(o, v, true);
  const u16 = (o: number, v: number) => view.setUint16(o, v, true);
  [0x52, 0x49, 0x46, 0x46].forEach((c, i) => view.setUint8(i, c));
  u32(4, 36 + samples * 2);
  [0x57, 0x41, 0x56, 0x45].forEach((c, i) => view.setUint8(8 + i, c));
  [0x66, 0x6d, 0x74, 0x20].forEach((c, i) => view.setUint8(12 + i, c));
  u32(16, 16); u16(20, 1); u16(22, 1); u32(24, RATE); u32(28, RATE * 2); u16(32, 2); u16(34, 16);
  [0x64, 0x61, 0x74, 0x61].forEach((c, i) => view.setUint8(36 + i, c));
  u32(40, samples * 2);
  for (let i = 0; i < samples; i++) {
    view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, pcm[i])) * 32767, true);
  }
  const bytes = new Uint8Array(buf);
  // chunked btoa-safe encoding (the buffer is ~700KB)
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return "data:audio/wav;base64," + btoa(bin);
}

let track: Howl | null = null;
let started = false;
let ducked = false;

function getTrack(): Howl | null {
  if (typeof window === "undefined") return null;
  if (!track) {
    try {
      track = new Howl({
        src: [toWavDataURI(composeLoop())],
        format: ["wav"],
        loop: true,
        volume: MUSIC_VOLUME,
        html5: false,
      });
    } catch {
      return null;
    }
  }
  return track;
}

/** Start the shared background loop. Idempotent — safe to call on every
 *  screen change; a second call while playing is a no-op, so two tracks can
 *  never overlap. */
export function startMusic(): void {
  const t = getTrack();
  if (!t || t.playing()) return;
  started = true;
  t.volume(ducked ? DUCKED_VOLUME : MUSIC_VOLUME);
  t.play();
}

/** Fade out and stop — call when a game unmounts. */
export function stopMusic(): void {
  if (!track || !started) return;
  started = false;
  const t = track;
  t.fade(t.volume(), 0, 350);
  setTimeout(() => {
    // only stop if nothing restarted it during the fade (game→game hop)
    if (!started) t.stop();
  }, 380);
}

/** Voice narration ducking — lowers music under speech, restores after. */
export function duckMusic(on: boolean): void {
  ducked = on;
  if (!track || !track.playing()) return;
  track.fade(track.volume(), on ? DUCKED_VOLUME : MUSIC_VOLUME, 180);
}
