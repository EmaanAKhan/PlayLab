/** Single source of truth for cross-game navigation targets. Every game's
 *  "Back to Games" exit must use PORTAL_ROUTE — never a per-button string —
 *  so the portal can move without hunting through four games. */
export const PORTAL_ROUTE = "/";
