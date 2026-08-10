"use client";

import { useCallback, useEffect } from "react";
import { Howl, Howler } from "howler";
import { getLetterSound, getLetterWord } from "@/constants/phonics";
import { speak, speakParts, onVoicesLoaded } from "@/utils/speech";

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
// Public hook
// ---------------------------------------------------------------------------
export function useAudio() {
  // Pre-load speech voices and set Howler global volume once on mount
  useEffect(() => {
    Howler.volume(0.8);
    return onVoicesLoaded();
  }, []);

  /** Speak the letter name aloud — always plain and simple ("a", never
   *  "capital A": some engines announce case for uppercase letters) */
  const pronounceLetter = useCallback((letter: string) => {
    speak(letter.toLowerCase(), 0.82, 1.18);
  }, []);

  /** Speak the full phonetic description */
  const pronouncePhonetic = useCallback((text: string) => {
    speak(text.toLowerCase(), 0.85, 1.15);
  }, []);

  /**
   * Natural letter introduction: the letter NAME, a short pause, then the
   * letter SOUND ("A" ... "ah"). onDone fires only after the voice has
   * finished, so tracing guidance never overlaps the pronunciation.
   */
  const speakLetterIntro = useCallback(
    (letter: string, onDone?: () => void, onWord?: () => void) => {
      // Numbers: just the number word once ("Three")
      if (/^\d+$/.test(letter)) {
        speakParts([{ text: letter, rate: 0.85, pitch: 1.18 }], 0, onDone);
        return;
      }
      // "b … buh … ball": plain name, the sound, then an ANCHOR WORD.
      // The anchor word is the reliability guarantee — every TTS engine says
      // real words correctly, so the child always hears the sound in context
      // even on engines that mangle the isolated "buh". onWord fires exactly
      // as the word begins, so the UI can show its picture in sync.
      speakParts(
        [
          { text: letter.toLowerCase(), rate: 0.8, pitch: 1.18 },
          { text: getLetterSound(letter).toLowerCase(), rate: 0.78, pitch: 1.16 },
          { text: getLetterWord(letter), rate: 0.82, pitch: 1.18 },
        ],
        160,
        onDone,
        (i) => {
          if (i === 2) onWord?.();
        }
      );
    },
    []
  );

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
    speak("Now it's your turn!", 0.9, 1.18);
  }, []);

  const sayWatchMe = useCallback(() => {
    // Queued, never interrupting — plays right after the pronunciation
    speak("Watch carefully!", 0.9, 1.18, undefined, false);
  }, []);

  const sayGreat = useCallback(() => {
    const phrases = [
      "Amazing!",
      "Wonderful!",
      "You did it!",
      "Great job!",
      "Fantastic!",
    ];
    speak(phrases[(Math.random() * phrases.length) | 0], 0.95, 1.22);
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
