#!/usr/bin/env node
/**
 * generate-audio-free.mjs — FREE narration generation (no account, no
 * billing, no API key) via the `edge-tts` tool, the canonical maintained
 * implementation of Microsoft Edge's read-aloud endpoint. Its maintainers
 * track Microsoft's rotating auth scheme, so it keeps working when
 * hand-rolled protocol implementations 403.
 *
 * One-time setup:
 *   1. Install Python 3 if you don't have it:  winget install Python.Python.3.12
 *   2. pip install edge-tts        (or: py -m pip install edge-tts)
 *
 * Then:
 *   npm run generate-audio:free                          # ONLY missing clips (default)
 *   node scripts/generate-audio-free.mjs --all           # regenerate everything
 *   node scripts/generate-audio-free.mjs phonics-b       # specific clips (even if they exist)
 */
import { readFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(
  readFileSync(join(root, "src/shared/audio/manifest.json"), "utf8")
);
const args = process.argv.slice(2);
const regenerateAll = args.includes("--all");
const only = args.filter((a) => !a.startsWith("--"));
const voice = manifest.voiceFree ?? { name: "en-US-AnaNeural", rate: "-8%", pitch: "+0Hz" };

// ── Locate the edge-tts CLI (direct script, or via python/py module) ───────
const CANDIDATES = [
  ["edge-tts"],
  ["python", "-m", "edge_tts"],
  ["python3", "-m", "edge_tts"],
  ["py", "-m", "edge_tts"],
];
let cli = null;
for (const c of CANDIDATES) {
  const probe = spawnSync(c[0], [...c.slice(1), "--help"], { encoding: "utf8", shell: false });
  if (probe.status === 0) { cli = c; break; }
}
if (!cli) {
  console.error("\n✖ edge-tts is not installed (or Python is missing).");
  console.error("  1. winget install Python.Python.3.12   (if no Python yet)");
  console.error("  2. pip install edge-tts                 (or: py -m pip install edge-tts)");
  console.error("  Then re-run: npm run generate-audio:free\n");
  process.exit(1);
}
console.log(`Using: ${cli.join(" ")}  |  voice: ${voice.name} rate ${voice.rate} pitch ${voice.pitch}\n`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function generate(clip, outPath) {
  const input = clip.speakFree ?? clip.speak ?? clip.text;
  const res = spawnSync(
    cli[0],
    [
      ...cli.slice(1),
      "--voice", voice.name,
      `--rate=${voice.rate ?? "+0%"}`,
      `--pitch=${voice.pitch ?? "+0Hz"}`,
      "--text", input,
      "--write-media", outPath,
    ],
    { encoding: "utf8", shell: false }
  );
  if (res.status !== 0) {
    throw new Error((res.stderr || res.stdout || `exit ${res.status}`).trim().slice(0, 300));
  }
  if (!existsSync(outPath) || statSync(outPath).size < 500) {
    throw new Error("output file missing or suspiciously small");
  }
}

let done = 0, failed = 0, skipped = 0;
for (const [id, clip] of Object.entries(manifest.clips)) {
  if (only.length && !only.includes(id)) continue;
  const outPath = join(root, "public", clip.file);
  // DEFAULT: skip clips whose file already exists — a plain run only fills
  // in what's missing, so adding two new clips never re-records the other
  // 181 (regeneration is slow and not byte-identical). Explicitly named
  // clips and --all runs always regenerate.
  if (!only.length && !regenerateAll && existsSync(outPath) && statSync(outPath).size >= 500) {
    skipped++;
    continue;
  }
  mkdirSync(dirname(outPath), { recursive: true });
  try {
    try {
      generate(clip, outPath);
    } catch {
      await sleep(1500); // one retry — the free endpoint occasionally drops
      generate(clip, outPath);
    }
    done++;
    console.log(`✔ ${id.padEnd(24)} → ${clip.file}`);
  } catch (e) {
    failed++;
    console.error(`✖ ${id}: ${e.message}`);
  }
  await sleep(300); // be polite to the free endpoint
}
console.log(`\n${done} generated, ${skipped} skipped (already exist), ${failed} failed.`);
if (failed) process.exit(1);
