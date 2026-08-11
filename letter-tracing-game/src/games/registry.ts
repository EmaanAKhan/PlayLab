import type { GameMeta } from "@shared/types/game";

/**
 * THE game registry — the single place a new game is announced to the portal.
 *
 * Adding a game:
 *   1. Create src/games/<id>/ with its components/store/data
 *   2. Create src/app/games/<id>/page.tsx rendering it
 *   3. Add one entry here — the portal homepage picks it up automatically
 */
export const GAMES: readonly GameMeta[] = [
  {
    id: "letter-tracing",
    title: "ABC",
    description: "Trace letters & numbers",
    glyph: "✏️",
    route: "/games/letter-tracing",
    colors: { bg: "#DDD5F5", border: "#A882E8", text: "#7C5CBF" },
  },
  {
    id: "jungle-spy",
    title: "Jungle Spy",
    description: "Find the hiding letters",
    glyph: "🔍",
    route: "/games/jungle-spy",
    colors: { bg: "#C8F0D8", border: "#66CC94", text: "#3DAA72" },
  },
];
