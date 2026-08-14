# Adding the next game

Jungle ABC Spy (`src/games/jungle-spy/`) is the reference implementation of the
portal pattern — a complete second game added with zero changes to shared or
to the first game:

    src/games/jungle-spy/
      constants/animals.ts     game data
      store/jungleStore.ts     the game's own zustand store (progress persisted)
      components/              screens (splash, grid, level)
      JungleSpyGame.tsx        top-level client component (screen router)
    src/app/games/jungle-spy/page.tsx   the route
    src/games/registry.ts               one added entry → portal card appears

It consumes the shared layer throughout: `@shared/audio` (playCorrectSound,
playIncorrectSound, playClickSound, playFanfare, playClip/playSequence — the
pre-recorded-clip voice engine — plus initAudio + the settings store),
`@shared/components` (RotateDevicePrompt, CelebrationSparkles),
`@shared/components/illustrations/AnimalArt` (26 animals, also used by
letter-tracing's anchor cards), `@shared/constants/transitions`
(PAGE_TRANSITION — the one screen-transition every game's router uses), and
`@shared/utils` (shuffle).

> Note: this file was previously misplaced at `src/games/game-2/README.md` —
> moved here to sit with the project's other docs (ARCHITECTURE.md,
> AUDIO-SETUP.md, CHANGES.md) and updated to reflect the current shared-audio
> system (pre-recorded clips via `@shared/audio/voice`, not the old
> `speech.ts` Web Speech engine ARCHITECTURE.md still describes — that file is
> now out of date in a few places and could use a pass).
