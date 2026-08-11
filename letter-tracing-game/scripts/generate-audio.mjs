#!/usr/bin/env node
/**
 * generate-audio.mjs — builds the COMPLETE narration library from
 * src/shared/audio/manifest.json using Google Cloud Text-to-Speech.
 *
 * DEV/BUILD-TIME ONLY. The deployed game plays the generated local files;
 * the browser never calls Google and no credential ever ships client-side.
 *
 * Setup (once):
 *   1. npm i -D @google-cloud/text-to-speech
 *   2. Create a GCP service account with "Cloud Text-to-Speech API" enabled,
 *      download its JSON key OUTSIDE the repo (never in public/, never in a
 *      NEXT_PUBLIC_ var), then:
 *        export GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/key.json
 *   3. node scripts/generate-audio.mjs          # generate everything
 *      node scripts/generate-audio.mjs phonics-a letter-b   # regenerate some
 *
 * Voice, rate and pitch come from the manifest's "voice" block. Phonics are
 * generated from IPA <phoneme> SSML — never by asking the model to read the
 * letter name — so every phoneme is linguistically exact and reproducible.
 *
 * After generating, LISTEN to at least: a e i o u b c g h j q w x (the spec's
 * quality-control list), plus watch-carefully and well-done, checking for
 * clipped endings, robotic pacing or wrong sounds before shipping.
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(
  readFileSync(join(root, "src/shared/audio/manifest.json"), "utf8")
);

const only = process.argv.slice(2); // optional clip ids to regenerate

const { default: tts } = await import("@google-cloud/text-to-speech").catch(() => {
  console.error("\n✖ @google-cloud/text-to-speech is not installed.");
  console.error("  Run: npm i -D @google-cloud/text-to-speech\n");
  process.exit(1);
});

const client = new tts.TextToSpeechClient();
const { languageCode, name, speakingRate, pitch } = manifest.voice;

let done = 0, failed = 0;
for (const [id, clip] of Object.entries(manifest.clips)) {
  if (only.length && !only.includes(id)) continue;
  const outPath = join(root, "public", clip.file);
  mkdirSync(dirname(outPath), { recursive: true });

  const input = clip.ssml ? { ssml: clip.ssml } : { text: clip.speak ?? clip.text };
  try {
    const [res] = await client.synthesizeSpeech({
      input,
      voice: { languageCode, name },
      audioConfig: { audioEncoding: "MP3", speakingRate, pitch },
    });
    writeFileSync(outPath, res.audioContent, "binary");
    done++;
    console.log(`✔ ${id.padEnd(24)} → ${clip.file}`);
  } catch (e) {
    failed++;
    console.error(`✖ ${id}: ${e.message}`);
  }
}
console.log(`\n${done} generated, ${failed} failed.`);
if (failed) process.exit(1);
