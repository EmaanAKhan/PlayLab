"use client";

/**
 * phonemeSynth — synthesizes the 26 letter SOUNDS with the Web Audio API.
 *
 * Why: browser TTS engines cannot be trusted to say phonics — most read
 * "buh"/"mmm" as words or spell them out, and behavior differs per device.
 * Synthesizing the phonemes directly gives identical, correct sounds on
 * every browser, forever, with no audio files and no backend.
 *
 * Approach (classic formant synthesis, tuned child-friendly):
 *  - vowels/voiced sounds: a glottal source (sawtooth, f0 ≈ 250Hz falling
 *    slightly) through parallel band-pass "formant" filters
 *  - nasals (m, n): the voiced source through a low-pass hum
 *  - fricatives (s, f, h, z, v): shaped white noise (± voicing underneath)
 *  - plosives (b, d, g / p, t, k): a short burst transient + a small schwa
 *  - glides (w, y) sweep their formants; q = k+w, x = k+s, c = k, j = d+zh
 */

let ctx: AudioContext | null = null;
let noiseBuf: AudioBuffer | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC: typeof AudioContext | undefined =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function noise(c: AudioContext): AudioBuffer {
  if (noiseBuf) return noiseBuf;
  const buf = c.createBuffer(1, c.sampleRate, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  noiseBuf = buf;
  return buf;
}

/** simple attack/release gain envelope */
function env(c: AudioContext, t0: number, d: number, peak: number, a = 0.02, r = 0.08): GainNode {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + a);
  g.gain.setValueAtTime(peak, Math.max(t0 + a, t0 + d - r));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
  return g;
}

/** voiced source: child-pitched glottal buzz with a gentle falling contour */
function glottis(c: AudioContext, t0: number, d: number, f0 = 255): OscillatorNode {
  const o = c.createOscillator();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(f0, t0);
  o.frequency.exponentialRampToValueAtTime(f0 * 0.82, t0 + d);
  o.start(t0);
  o.stop(t0 + d + 0.02);
  return o;
}

/** vowel-ish voiced segment through parallel formant band-passes.
 *  fTo (optional) sweeps the formants — used for glides like w/y. */
function vowel(
  c: AudioContext,
  t0: number,
  d: number,
  formants: number[],
  gain = 0.5,
  fTo?: number[]
): void {
  const src = glottis(c, t0, d);
  const out = env(c, t0, d, gain);
  out.connect(c.destination);
  formants.forEach((f, i) => {
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(f, t0);
    if (fTo && fTo[i]) bp.frequency.exponentialRampToValueAtTime(fTo[i], t0 + d);
    bp.Q.value = 9;
    const fg = c.createGain();
    fg.gain.value = i === 0 ? 1 : 0.65 / i;
    src.connect(bp).connect(fg).connect(out);
  });
}

/** nasal hum (m/n) — voiced source through a low-pass */
function hum(c: AudioContext, t0: number, d: number, lp: number, gain = 0.5): void {
  const src = glottis(c, t0, d, 235);
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = lp;
  const out = env(c, t0, d, gain, 0.04, 0.1);
  src.connect(f).connect(out).connect(c.destination);
}

/** fricative noise, optionally with voicing underneath (z, v) */
function fric(
  c: AudioContext,
  t0: number,
  d: number,
  opts: { hp?: number; lp?: number; bp?: number; q?: number; gain?: number; voiced?: boolean }
): void {
  const src = c.createBufferSource();
  src.buffer = noise(c);
  src.loop = true;
  let node: AudioNode = src;
  if (opts.bp) {
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = opts.bp;
    f.Q.value = opts.q ?? 0.8;
    node = (node.connect(f), f);
  }
  if (opts.hp) {
    const f = c.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = opts.hp;
    node = (node.connect(f), f);
  }
  if (opts.lp) {
    const f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = opts.lp;
    node = (node.connect(f), f);
  }
  const out = env(c, t0, d, opts.gain ?? 0.22, 0.03, 0.1);
  node.connect(out).connect(c.destination);
  src.start(t0);
  src.stop(t0 + d + 0.02);
  if (opts.voiced) hum(c, t0, d, 500, 0.2);
}

/** plosive burst — a very short transient; voiced = softer + low thump */
function burst(c: AudioContext, t0: number, center: number, voiced: boolean): void {
  const d = 0.045;
  const src = c.createBufferSource();
  src.buffer = noise(c);
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = center;
  f.Q.value = 1.2;
  const out = env(c, t0, d, voiced ? 0.3 : 0.42, 0.004, 0.03);
  src.connect(f).connect(out).connect(c.destination);
  src.start(t0);
  src.stop(t0 + d + 0.01);
  if (voiced) {
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(140, t0);
    o.frequency.exponentialRampToValueAtTime(100, t0 + 0.06);
    const g = env(c, t0, 0.06, 0.35, 0.004, 0.03);
    o.connect(g).connect(c.destination);
    o.start(t0);
    o.stop(t0 + 0.08);
  }
}

/** short neutral "uh" tail used after plosives (buh, duh, kuh…) */
function schwa(c: AudioContext, t0: number, d = 0.2, gain = 0.42): void {
  vowel(c, t0, d, [600, 1200, 2400], gain);
}

// ── Per-letter recipes ──────────────────────────────────────────────────────
// Each returns the total duration (seconds) of what it scheduled.

type Recipe = (c: AudioContext, t: number) => number;

const RECIPES: Record<string, Recipe> = {
  A: (c, t) => (vowel(c, t, 0.5, [730, 1700, 2500]), 0.5),               // short a — apple
  B: (c, t) => (burst(c, t, 500, true), schwa(c, t + 0.05, 0.2), 0.28),  // buh
  C: (c, t) => (burst(c, t, 2200, false), schwa(c, t + 0.06, 0.16, 0.3), 0.25), // kuh
  D: (c, t) => (burst(c, t, 3000, true), schwa(c, t + 0.05, 0.2), 0.28),
  E: (c, t) => (vowel(c, t, 0.45, [560, 1900, 2600]), 0.45),             // short e — egg
  F: (c, t) => (fric(c, t, 0.5, { bp: 1500, q: 0.6, gain: 0.2 }), 0.5),
  G: (c, t) => (burst(c, t, 1500, true), schwa(c, t + 0.05, 0.2), 0.28),
  H: (c, t) => (fric(c, t, 0.28, { bp: 1100, q: 0.5, gain: 0.18 }), schwa(c, t + 0.24, 0.16, 0.3), 0.42),
  I: (c, t) => (vowel(c, t, 0.45, [420, 2000, 2600]), 0.45),             // short i — igloo
  J: (c, t) => (burst(c, t, 2600, true), fric(c, t + 0.04, 0.18, { bp: 2600, q: 2, gain: 0.18, voiced: true }), schwa(c, t + 0.2, 0.15, 0.3), 0.38),
  K: (c, t) => (burst(c, t, 2200, false), schwa(c, t + 0.06, 0.16, 0.3), 0.25),
  L: (c, t) => (vowel(c, t, 0.5, [400, 1200, 2600], 0.45), 0.5),         // lll
  M: (c, t) => (hum(c, t, 0.55, 450, 0.55), 0.55),                       // mmm
  N: (c, t) => (hum(c, t, 0.55, 1500, 0.5), 0.55),                       // nnn
  O: (c, t) => (vowel(c, t, 0.5, [500, 900, 2400]), 0.5),                // short o — octopus
  P: (c, t) => (burst(c, t, 900, false), schwa(c, t + 0.07, 0.14, 0.26), 0.24),
  Q: (c, t) => (burst(c, t, 2200, false), vowel(c, t + 0.06, 0.24, [400, 800, 2200], 0.45, [600, 1300, 2400]), 0.32), // kw
  R: (c, t) => (vowel(c, t, 0.5, [480, 1250, 1650], 0.48), 0.5),         // rrr (low F3)
  S: (c, t) => (fric(c, t, 0.55, { hp: 4800, gain: 0.2 }), 0.55),
  T: (c, t) => (burst(c, t, 4200, false), schwa(c, t + 0.06, 0.13, 0.26), 0.22),
  U: (c, t) => (vowel(c, t, 0.45, [640, 1200, 2400]), 0.45),             // short u — umbrella
  V: (c, t) => (fric(c, t, 0.5, { bp: 1500, q: 0.7, gain: 0.16, voiced: true }), 0.5),
  W: (c, t) => (vowel(c, t, 0.4, [350, 750, 2200], 0.5, [600, 1300, 2400]), 0.4), // wuh glide
  X: (c, t) => (burst(c, t, 2200, false), fric(c, t + 0.06, 0.3, { hp: 4800, gain: 0.2 }), 0.4), // ks
  Y: (c, t) => (vowel(c, t, 0.4, [360, 2100, 2800], 0.5, [600, 1300, 2400]), 0.4), // yuh glide
  Z: (c, t) => (fric(c, t, 0.55, { hp: 4200, gain: 0.16, voiced: true }), 0.55),
};

/**
 * Play the phonic sound for a letter. Returns the duration in seconds, or 0
 * if Web Audio is unavailable (caller should fall back to TTS).
 */
export function playLetterSound(letter: string): number {
  const c = ac();
  if (!c) return 0;
  const recipe = RECIPES[letter.toUpperCase()];
  if (!recipe) return 0;
  try {
    return recipe(c, c.currentTime + 0.03) + 0.05;
  } catch {
    return 0;
  }
}
