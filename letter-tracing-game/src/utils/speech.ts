"use client";

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
/** Rare, but if a device ships an actual child voice, strongly prefer it */
const CHILD_HINTS = ["child", "kid", "junior", "young"];

let cachedVoice: SpeechSynthesisVoice | null = null;

function scoreVoice(v: SpeechSynthesisVoice): number {
  const lang = v.lang.toLowerCase();
  const name = v.name.toLowerCase();
  if (!lang.startsWith("en")) return -1;
  let score = 100; // any English voice beats the non-English default
  if (lang.startsWith("en-gb")) score += 400;
  else if (lang.startsWith("en")) score += 100;
  if (FEMALE_HINTS.some((h) => name.includes(h))) score += 120;
  if (CHILD_HINTS.some((h) => name.includes(h))) score += 300;
  if (name.includes("male") && !name.includes("female")) score -= 80;
  for (const q of QUALITY_HINTS) if (name.includes(q)) score += 40;
  return score;
}

/** ONE voice for the whole session, every module. The choice is STICKY: once
 *  picked it is never re-picked (unless it disappears from the device), so the
 *  narrator can never switch from one voice to another mid-game. */
function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined") return null;
  const synth = window.speechSynthesis;
  if (!synth) return null;
  const voices = synth.getVoices();
  if (voices.length === 0) return null;
  if (cachedVoice && voices.some((v) => v.voiceURI === cachedVoice!.voiceURI)) {
    return cachedVoice;
  }
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
  return best;
}

/** Warm, friendly, slightly expressive delivery: a touch higher pitch, a
 *  touch slower — but never crawling, never robotic-flat.
 *  interrupt=false queues after current speech WITHOUT cancelling — used for
 *  the later parts of a pronunciation sequence so the phonetic sound is never
 *  cut off by its own chain. */
function speak(text: string, rate = 0.88, pitch = 1.18, onEnd?: () => void, interrupt = true, attempt = 0): void {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) {
    onEnd?.();
    return;
  }
  // If the voice list hasn't loaded yet, WAIT briefly rather than speaking
  // with the browser default — otherwise the first words come out in a
  // different (often male) voice than the rest of the game.
  if (synth.getVoices().length === 0 && attempt < 6) {
    setTimeout(() => speak(text, rate, pitch, onEnd, interrupt, attempt + 1), 180);
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
    setTimeout(done, Math.max(650, text.length * 85) + 120);
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
  onDone?: () => void,
  onPart?: (index: number) => void
): void {
  const next = (i: number) => {
    if (i >= parts.length) {
      onDone?.();
      return;
    }
    onPart?.(i);
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


/** Pre-warm the device voice list; safe to call repeatedly. Returns an
 *  unsubscribe function for the voiceschanged listener. */
function onVoicesLoaded(): () => void {
  if (typeof window === "undefined") return () => {};
  const synth = window.speechSynthesis;
  if (!synth) return () => {};
  const load = () => {
    synth.getVoices();
    // NOTE: the sticky voice is kept — pickVoice only re-picks if the chosen
    // voice actually disappeared from the device.
  };
  load();
  synth.addEventListener("voiceschanged", load);
  return () => synth.removeEventListener("voiceschanged", load);
}

export { speak, speakParts, onVoicesLoaded };
