# Audio setup — two paths, pick ONE

The narration is pre-generated MP3s in public/audio/, played by Howler. The
browser never contacts any TTS provider; there is zero runtime TTS cost on
either path. Both scripts read the same manifest and write the same files.

## Path A (recommended): FREE — no account, no billing, real child voice

1. Install Python 3 if needed:   winget install Python.Python.3.12
2. pip install edge-tts          (or: py -m pip install edge-tts)
3. npm run generate-audio:free   (103 mp3s via Microsoft Edge TTS,
                                  voice: en-US-AnaNeural — a genuine
                                  child voice, no credentials, no billing)
4. Listen (see checklist below).

Limitation: this endpoint rejects custom IPA SSML, so the 26 phonics clips
use the editable `speakFree` spellings in src/shared/audio/manifest.json
("buh", "sss", "mmm"…). If any sounds off, tweak its speakFree text and
regenerate just that clip:
    node scripts/generate-audio-free.mjs phonics-b

## Path B: Google Cloud TTS — exact IPA phonics, requires billing enabled

Even tiny usage requires a billing-enabled GCP project (you're unlikely to be
charged for 103 short clips, but the card must be attached).

1. npm install && npm i -D @google-cloud/text-to-speech
2. GCP Console: enable "Cloud Text-to-Speech API", create a service account,
   download its JSON key OUTSIDE the repo (never commit; never in public/
   or NEXT_PUBLIC_*).
3. export GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/key.json
4. npm run generate-audio

## Listening checklist (both paths — do this before shipping)

a e i o u  b c g h j q w x  · watch-carefully · well-done · your-turn
Check: correct sound, no clipped endings, no robotic pacing, no stray words.
Regenerate any single clip by id. To change voice: edit the "voiceFree"
(free path) or "voice" (Google path) block in the manifest and regenerate.

Until one path has run, the game plays no narration and logs a RED
"[voice] MISSING/FAILED AUDIO CLIP" error naming each missing clip —
deliberate: there is no silent fallback.
