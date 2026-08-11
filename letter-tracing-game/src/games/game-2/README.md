# Adding the next game

Jungle ABC Spy (src/games/jungle-spy/) is the reference implementation of the
portal pattern — a complete second game added with zero changes to shared or
to the first game:

  src/games/jungle-spy/
    constants/animals.ts     game data
    store/jungleStore.ts     the game's own zustand store (progress persisted)
    components/              screens (splash, grid, level)
    JungleSpyGame.tsx        top-level client component (screen router)
  src/app/games/jungle-spy/page.tsx   the route
  src/games/registry.ts               one added entry → portal card appears

It consumes the shared layer throughout: @shared/audio (playCorrectSound,
playIncorrectSound, playClickSound, playFanfare, sayPraise, speak/speakParts,
initAudio + settings store), @shared/components (RotateDevicePrompt,
CelebrationSparkles), @shared/components/illustrations/AnimalArt (26 animals,
also used by letter-tracing's anchor cards), and @shared/utils (shuffle).
