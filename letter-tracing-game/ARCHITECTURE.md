# Architecture

A Next.js (App Router) + TypeScript letter/number tracing game for children
aged 3–7, designed autism-friendly: calm, predictable, forgiving, and never
punishing. No backend — all state is local (zustand + localStorage), all
audio is pre-generated narration clips + synthesized tones, all art is inline SVG.

## Portal architecture

The project is a MULTI-GAME PORTAL. The homepage (`/`) renders game cards
from `src/games/registry.ts`; each game lives at `/games/<id>` with all of
its code isolated in `src/games/<id>/`. Cross-game functionality lives in
`src/shared/` — audio (playCorrectSound(), playClip() and the narration
manifest), the design-token/stylesheet layer, reusable UI (Button,
NavPillButton, ProgressBar, StarRow, RotateDevicePrompt), shared game
shells (GameStage, CelebrationOverlay), shared hooks (useGameSession,
useElementSize, useScheduler),
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
                        voice.ts (clip playback + clipText), music.ts,
                        manifest.json (THE source of truth for narration)
    styles/             tokens.ts (THE colour/shadow/radius source of truth),
                        base.css, utilities.css, cssVars.ts (typed
                        CSS-variable bridge for runtime-only values)
    components/ui       Button, NavPillButton, ProgressBar, StarRow,
                        RotateDevicePrompt, StartOptions
    components/game     GameStage (screen shell), CelebrationOverlay
    hooks/              useGameSession (audio + music + history lifecycle),
                        useElementSize, useScheduler, useScreenHistorySync
    components/animations  Sparkles, SceneDecor, HomeEnvironment, clouds
    stores/settingsStore.ts  portal-level sound/volume (persisted)
    utils/random.ts     shuffle
    types/game.ts       GameMeta (registry card shape)
  games/
    registry.ts         THE list of games the portal shows
    letter-tracing/     the first game (structure below)
    letter-hunt/        second game — spot the matching letter among decoys
    jungle-spy/          third game — pop the hidden letter bubbles to find an animal
    (see /ADDING-A-GAME.md at the repo root for the pattern to add a fourth)
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

- `shared/audio/voice.ts` plays pre-generated narration clips through Howler
  and exposes `clipText(id)`, so on-screen text and the spoken phrase can
  never drift apart. `manifest.json` is the single source of truth; clips are
  generated with `npm run generate-audio:free` (edge-tts).
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


## Styling architecture

There are no inline style objects in this codebase. The rule is:

1. **`shared/styles/tokens.ts`** is the single source of truth for every
   colour, shadow and radius used for UI chrome. `tailwind.config.ts` imports
   it twice: once to build the semantic Tailwind scale (`bg-plum`,
   `text-jungle`, `shadow-board`), and once through a base plugin that emits
   the same values as `:root` CSS custom properties, so hand-written CSS uses
   `var(--color-…)` and can never drift from the utilities.
2. **Tailwind utilities** express layout and any value that is known at build
   time. Arbitrary values (`bg-[#F0E8FF]`) are not used — if a colour is worth
   using it is worth naming in tokens.
3. **Component classes** live in a stylesheet next to the code they belong to:
   `shared/styles/utilities.css` for cross-game primitives, `app/portal.css`
   for the homepage, and `games/<game>/styles/<game>.css` for that game's own
   identity. They are composed in `app/globals.css`.
4. **`shared/styles/cssVars.ts`** is the only sanctioned bridge for values
   that genuinely cannot exist until runtime — a drag ghost's coordinates, a
   scattered card's position, a per-round tint. The component sets typed
   `--pl-*` custom properties; the actual CSS declaration still lives in a
   stylesheet class (`.pl-at`, `.pl-swatch`, `.hunt-card`…). The helper's key
   type is `--pl-${string}`, so an untyped inline style cannot slip back in.

Illustration SVGs keep their own local, named art palettes. A shark's belly
colour is art direction, not a design token; hoisting those into the token
file would make the system meaningless. They are named constants, never
magic hexes scattered through JSX.
