# Architecture

A Next.js (App Router) + TypeScript letter/number tracing game for children
aged 3–7, designed autism-friendly: calm, predictable, forgiving, and never
punishing. No backend — all state is local (zustand + localStorage), all
audio is generated (Web Speech + synthesized tones), all art is inline SVG.

## Portal architecture

The project is a MULTI-GAME PORTAL. The homepage (`/`) renders game cards
from `src/games/registry.ts`; each game lives at `/games/<id>` with all of
its code isolated in `src/games/<id>/`. Cross-game functionality lives in
`src/shared/` — audio (playCorrectSound(), sayPraise(), the speech engine
with its sticky single voice), reusable UI (Button, RotateDevicePrompt),
decorative environments, the portal settings store (sound on/off, volume,
persisted), and utilities (shuffle). Adding a game = create its folder, add
its route page, add one registry entry.

## Directory map

```
src/
  app/
    layout.tsx          Full-viewport shell (no phone-frame container)
    page.tsx            PORTAL homepage (cards from the game registry)
    games/letter-tracing/page.tsx   Route → the letter-tracing game
  shared/
    audio/              sfx.ts (generated-WAV vocabulary: playCorrectSound,
                        playIncorrectSound, playClickSound, playChime,
                        playStarPop, playFanfare, playCelebrationSound;
                        initAudio wires the settings store to Howler),
                        speech.ts (sticky voice engine), phrases.ts
    components/ui       Button, RotateDevicePrompt
    components/animations  Sparkles, SceneDecor, HomeEnvironment, clouds
    stores/settingsStore.ts  portal-level sound/volume (persisted)
    utils/random.ts     shuffle
    types/game.ts       GameMeta (registry card shape)
  games/
    registry.ts         THE list of games the portal shows
    letter-tracing/     the complete first game (structure below)
    game-2/README.md    the pattern for the next game
    globals.css         Design tokens in CSS: responsive board size
                        (--trace-size), rotate-prompt visibility,
                        short-landscape helpers
  games/letter-tracing/
    types.ts            Game domain types (Module, GameScreen, PracticeMode,
                        LetterDefinition, GameProgress)
    constants/          symbols, letterData, lowercaseLetterData, numberData,
                        phonics (name/sound/ANCHOR WORD), rewards
    store/gameStore.ts  the game's own zustand store (progress per module
                        persisted; practiceMode session-only)
    hooks/useAudio.ts   thin game hook: phonics timing (name→sound→word) on
                        top of the shared audio layer — the screens' API was
                        kept byte-identical through the refactor
    utils/pathUtils.ts  SVG path building/sampling for stroke data
    LetterTracingGame.tsx  top-level screen router for this game
    components/
    tracing/
      constants.ts      Engine tuning: tolerances, thresholds, palette
      geometry.ts       Per-stroke precomputed geometry + frontier window
      draw.ts           Pure canvas drawing primitives (pencil, arrows…)
      TracingCanvas.tsx The engine: demo state machine + sequential-
                        frontier validation + pointer input
    screens/            One component per screen; page.tsx composes them
    animations/         Decorative layers (SceneDecor, HomeEnvironment,
                        Sparkles, FloatingClouds)
    illustrations/
      AnchorArt.tsx     26 handcrafted pastel anchor-word SVGs
    ui/                 Small reusable pieces (Button, RotateDevicePrompt,
                        AnchorWordCard)
```

## The tracing engine (the heart of the app)

1. **Data**: every glyph is an ordered list of real handwriting strokes
   (`letterData`/`numberData`), sampled into points in a 200×200 space.
2. **Demonstration**: on a letter's first attempt the board starts EMPTY and
   a friendly pencil writes the complete glyph — visibly lifting and
   traveling between strokes (never connecting them) — holds, then
   crossfades into the tracing guide. Driven by a phase machine
   (`demo-draw → demo-travel → … → demo-hold → demo-fade → trace`).
3. **Validation — sequential frontier**: the child's covered path is always
   a contiguous prefix. Progress requires the finger to be AT the frontier
   (within `TOLERANCE_PX`) and advances only through a distance-based window
   (`FRONTIER_WINDOW_PX`) ahead. Proximity to later sections does nothing;
   lifting pauses exactly at the frontier; strokes complete only when traced
   in order to their end (`STROKE_THRESHOLD`). A physical finger LIFT is
   required between strokes.
4. **Feel**: gentle wiggle + soft "oops" for off-path scribbles, star-trail
   ink, per-stroke sparkle, fly-away stars on completion. Never an error
   message, never a timer.

All engine tuning lives in `tracing/constants.ts` — one file to adjust feel.

## Audio

- `utils/speech.ts` selects ONE voice per session (en-GB female natural
  preferred, sticky, never speaks before the voice list loads) and provides
  race-safe `speak`/`speakParts`.
- `useAudio` owns WHAT is said and WHEN: the letter intro is
  name → sound → anchor word ("b … buh … ball"), with `onWord` firing as the
  word starts so `AnchorWordCard` can show its picture in sync. Anchor words
  guarantee correct phonics on every TTS engine.
- SFX are synthesized sine-wave WAVs cached in Howler — zero audio assets.

## Practices followed

- Single source of truth for symbols, phonics, palette and engine tuning.
- Pure functions for geometry/drawing; React components stay orchestration.
- Session vs persisted state split explicitly in the store's `partialize`.
- All decorative layers are `pointer-events: none` and `aria-hidden`.
- Interactive elements carry aria-labels; touch targets ≥ 44px.
- Viewport-relative sizing (`vmin`, `clamp`, CSS vars) — no fixed containers.
- ESLint via `next/core-web-vitals` (`npm run lint`).

## Verification notes

- `npx tsc --noEmit` — clean.
- The sequential-frontier engine has a standalone simulation harness
  (developed during this project) covering honest traces, half-traces,
  static-touch, reverse traces and pause/resume across letters and numbers.
- `npm run build` must be run in an environment with npm registry access
  (Next.js downloads its SWC binary on first build).
