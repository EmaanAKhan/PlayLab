"use client";

/**
 * voice.ts — the narration engine. Plays pre-generated local clips (built by
 * scripts/generate-audio.mjs from manifest.json) through Howler.
 *
 * Design rules (the audio spec, distilled):
 *  - ONE spoken voice event at a time: starting any clip cleanly stops the
 *    previous one. No overlap, ever.
 *  - Deterministic timing: play() resolves on Howler's real `onend` event —
 *    never on a guessed setTimeout — so game states can `await` speech.
 *  - Text↔audio pairing: components read displayed text from the manifest via
 *    clipText(), so what is shown and what is spoken cannot drift apart.
 *  - NO silent Web Speech fallback. A missing file logs an unmissable dev
 *    error and resolves quickly so the game flow continues and the gap is
 *    obvious and fixable.
 */

import { Howl } from "howler";
import manifest from "./manifest.json";

type ClipId = string;

interface ClipDef {
  file: string;
  text: string;
}

const CLIPS: Record<string, ClipDef> = manifest.clips as Record<string, ClipDef>;

const cache = new Map<ClipId, Howl>();
let current: Howl | null = null;

function missing(id: ClipId, reason: string): void {
  // Loud and unmistakable in development — per spec, never silently ignored,
  // never replaced with Web Speech.
  console.error(
    `%c[voice] MISSING/FAILED AUDIO CLIP: "${id}" (${reason}).\n` +
      `Run \`node scripts/generate-audio.mjs ${id}\` to (re)generate it.`,
    "color:#fff;background:#c0392b;font-weight:bold;padding:2px 6px;"
  );
}

function getClip(id: ClipId): Howl | null {
  const def = CLIPS[id];
  if (!def) {
    missing(id, "no such id in manifest.json");
    return null;
  }
  let h = cache.get(id);
  if (!h) {
    h = new Howl({
      src: [def.file],
      preload: true,
      html5: false,
      onloaderror: () => missing(id, "file failed to load — not generated yet?"),
    });
    cache.set(id, h);
  }
  return h;
}

/** The displayed-text half of a clip — UI text MUST come from here so screen
 *  and speech always match. */
export function clipText(id: ClipId): string {
  return CLIPS[id]?.text ?? "";
}

/** Warm the cache for clips the current interaction will need. */
export function preloadClips(ids: ClipId[]): void {
  for (const id of ids) getClip(id);
}

/** Stop any narration immediately (used before starting a new sequence). */
export function stopVoice(): void {
  current?.stop();
  current = null;
}

/**
 * Play one clip. Resolves when the clip actually ENDS (real Howler onend).
 * Starting a clip stops whatever was playing — one voice at a time.
 * On load failure it resolves after a short beat so sequences continue.
 */
export function playClip(id: ClipId): Promise<void> {
  return new Promise((resolve) => {
    const h = getClip(id);
    if (!h) return void setTimeout(resolve, 250);
    stopVoice();
    current = h;

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      if (current === h) current = null;
      h.off("end", finish);
      resolve();
    };
    h.once("end", finish);
    h.once("loaderror", () => setTimeout(finish, 250));
    h.once("playerror", () => setTimeout(finish, 250));

    if (h.state() === "loaded") {
      h.play();
    } else {
      h.once("load", () => {
        if (!settled) h.play();
      });
      h.load();
      // dev safety: if the file never loads, don't hang the game
      setTimeout(() => {
        if (h.state() !== "loaded") finish();
      }, 4000);
    }
  });
}

/**
 * Play clips in order with a deliberate pause between them (deterministic:
 * each next clip starts only after the previous clip's real end + gap).
 * onPart fires when each clip BEGINS, for visuals synced to specific words.
 */
export async function playSequence(
  ids: ClipId[],
  gapMs = 250,
  onPart?: (index: number) => void
): Promise<void> {
  for (let i = 0; i < ids.length; i++) {
    if (i > 0 && gapMs > 0) await new Promise((r) => setTimeout(r, gapMs));
    onPart?.(i);
    await playClip(ids[i]);
  }
}
