/** Metadata every portal game provides for its card on the homepage. */
export interface GameMeta {
  id: string;
  title: string;
  description: string;
  /** Big glyph/emoji shown on the card (portal cards are visual-first) */
  glyph: string;
  route: string;
  /** Pastel card colors, matching the game's own identity */
  colors: { bg: string; border: string; text: string };
}
