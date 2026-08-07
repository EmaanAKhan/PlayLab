"use client";

import { useCallback, useEffect, useRef } from "react";
import { Howl, Howler } from "howler";
import { getLetterSound } from "@/constants/phonics";

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
// Web Speech API — warm, child-friendly voice selection.
//
// Preference order (never hardcoding one exact voice name, since devices
// expose different voice sets):
//   1. Natural-sounding British English female voice
//   2. British English voice
//   3. Natural-sounding English female voice
//   4. Any other English voice
//   5. Browser default
// The chosen voice is cached and only recomputed when the browser's voice
// list changes, so speech synthesis is never repeatedly re-initialised.
// ---------------------------------------------------------------------------

const FEMALE_HINTS = [
  "female", "woman", "girl",
  // Common British / natural female voice names across platforms
  "sonia", "libby", "maisie", "hazel", "kate", "serena", "stephanie",
  "martha", "hollie", "olivia", "amy", "emily", "joanna", "salli",
  "samantha", "karen", "moira", "tessa", "google uk english female",
];
const QUALITY_HINTS = ["natural", "neural", "premium", "enhanced", "online", "google"];

let cachedVoice: SpeechSynthesisVoice | null = null;
let cachedVoiceListLength = -1;

function scoreVoice(v: SpeechSynthesisVoice): number {
  const lang = v.lang.toLowerCase();
  const name = v.name.toLowerCase();
  if (!lang.startsWith("en")) return -1;
  let score = 100; // any English voice beats the non-English default
  if (lang.startsWith("en-gb")) score += 400;
  else if (lang.startsWith("en")) score += 100;
  if (FEMALE_HINTS.some((h) => name.includes(h))) score += 120;
  if (name.includes("male") && !name.includes("female")) score -= 80;
  for (const q of QUALITY_HINTS) if (name.includes(q)) score += 40;
  return score;
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined") return null;
  const synth = window.speechSynthesis;
  if (!synth) return null;
  const voices = synth.getVoices();
  if (voices.length === 0) return null;
  if (cachedVoice && voices.length === cachedVoiceListLength) return cachedVoice;
  let best: SpeechSynthesisVoice | null = null;
  let bestScore = 0;
  for (const v of voices) {
    const s = scoreVoice(v);
    if (s > bestScore) {
      bestScore = s;
      best = v;
    }
  }
  cachedVoice = best;
  cachedVoiceListLength = voices.length;
  return best;
}

/** Warm, friendly, slightly expressive delivery: a touch higher pitch, a
 *  touch slower — but never crawling, never robotic-flat.
 *  interrupt=false queues after current speech WITHOUT cancelling — used for
 *  the later parts of a pronunciation sequence so the phonetic sound is never
 *  cut off by its own chain. */
function speak(text: string, rate = 0.95, pitch = 1.15, onEnd?: () => void, interrupt = true): void {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) {
    onEnd?.();
    return;
  }
  // Chrome can silently wedge if cancel() and speak() happen back-to-back.
  // Only cancel when something is actually playing, resume in case the engine
  // is stuck paused, and give it a breath before speaking again.
  const wasBusy = interrupt && (synth.speaking || synth.pending);
  if (wasBusy) synth.cancel();
  synth.resume();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = 1;
  const voice = pickVoice();
  if (voice) utterance.voice = voice;

  if (onEnd) {
    // onend is unreliable on some browsers — race it with a duration estimate
    let fired = false;
    const done = () => {
      if (fired) return;
      fired = true;
      onEnd();
    };
    utterance.onend = done;
    utterance.onerror = done;
    setTimeout(done, Math.max(800, text.length * 90) + 150);
  }
  if (wasBusy) {
    setTimeout(() => synth.speak(utterance), 60);
  } else {
    synth.speak(utterance);
  }
}

/** Speak several short parts in order with natural pauses between them */
function speakParts(
  parts: { text: string; rate?: number; pitch?: number }[],
  gapMs: number,
  onDone?: () => void
): void {
  const next = (i: number) => {
    if (i >= parts.length) {
      onDone?.();
      return;
    }
    const p = parts[i];
    // Only the FIRST part may interrupt other speech — later parts never
    // cancel, so "A... aaah" always plays out in full.
    speak(
      p.text,
      p.rate ?? 0.9,
      p.pitch ?? 1.15,
      () => {
        setTimeout(() => next(i + 1), gapMs);
      },
      i === 0
    );
  };
  next(0);
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
      cachedVoice = null; // voice list changed — re-pick on next speak
      voicesReadyRef.current = true;
    };
    load();
    synth.addEventListener("voiceschanged", load);
    return () => synth.removeEventListener("voiceschanged", load);
  }, []);

  /** Speak the letter name aloud */
  const pronounceLetter = useCallback((letter: string) => {
    speak(letter, 0.85, 1.18);
  }, []);

  /** Speak the full phonetic description */
  const pronouncePhonetic = useCallback((text: string) => {
    speak(text, 0.9, 1.12);
  }, []);

  /**
   * Natural letter introduction: the letter NAME, a short pause, then the
   * letter SOUND ("A" ... "ah"). onDone fires only after the voice has
   * finished, so tracing guidance never overlaps the pronunciation.
   */
  const speakLetterIntro = useCallback((letter: string, onDone?: () => void) => {
    // Numbers: just the number word once ("Three") — no phonetic sound
    if (/^\d+$/.test(letter)) {
      speakParts([{ text: letter, rate: 0.85, pitch: 1.16 }], 0, onDone);
      return;
    }
    speakParts(
      [
        { text: letter, rate: 0.82, pitch: 1.18 },
        { text: getLetterSound(letter), rate: 0.78, pitch: 1.16 },
      ],
      200,
      onDone
    );
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

  /** Gentle, non-alarming "oops, try again" tone — never harsh or buzzer-like */
  const playOops = useCallback(() => {
    getHowl("oops-1", [349], 0.16, 0.4)?.play();
    setTimeout(() => getHowl("oops-2", [311], 0.2, 0.4)?.play(), 100);
  }, []);

  /** Bright little "pop" when a practice star turns gold */
  const playStarPop = useCallback(() => {
    getHowl("star-1", [784], 0.1, 0.55)?.play();
    setTimeout(() => getHowl("star-2", [1047], 0.18, 0.55)?.play(), 70);
  }, []);

  /** Bigger fanfare for the fifth and final star */
  const playFiveStars = useCallback(() => {
    const melody = [659, 784, 988, 1319];
    melody.forEach((freq, i) => {
      setTimeout(() => getHowl(`five-${freq}`, [freq], 0.24, 0.6)?.play(), i * 80);
    });
  }, []);

  const sayNowYourTurn = useCallback(() => {
    speak("Now it is your turn!", 0.95, 1.16);
  }, []);

  const sayWatchMe = useCallback(() => {
    // Queued, never interrupting — plays right after the pronunciation
    speak("Watch carefully!", 0.95, 1.16, undefined, false);
  }, []);

  const sayGreat = useCallback(() => {
    const phrases = [
      "Amazing!",
      "Wonderful!",
      "You did it!",
      "Great job!",
      "Fantastic!",
    ];
    speak(phrases[(Math.random() * phrases.length) | 0], 0.98, 1.2);
  }, []);

  return {
    pronounceLetter,
    pronouncePhonetic,
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
    sayGreat,
  };
}
