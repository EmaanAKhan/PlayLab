# Changed files — unzip over project root, overwrite.

MOD scripts/generate-audio-free.mjs
    The 403s mean Microsoft's rotating auth outpaced the hand-rolled
    protocol. The script now delegates synthesis to the canonical, actively
    maintained `edge-tts` tool (Python), which tracks Microsoft's scheme.
    One-time setup:
        winget install Python.Python.3.12     (skip if you have Python)
        pip install edge-tts                  (or: py -m pip install edge-tts)
    Then exactly as before:
        npm run generate-audio:free
        node scripts/generate-audio-free.mjs phonics-b   (single clips)
    The script auto-detects edge-tts / python -m edge_tts / py -m edge_tts.
MOD package.json    (ws devDependency removed — no longer needed)
MOD AUDIO-SETUP.md  (free-path prerequisites updated)
