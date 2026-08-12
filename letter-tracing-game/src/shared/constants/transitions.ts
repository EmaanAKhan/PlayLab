/**
 * ONE shared screen-transition used by every game's top-level screen router
 * (inside each game's <AnimatePresence>). Previously Letter Tracing used a
 * scale+slide transition while Letter Hunt and Jungle Spy each used a plain
 * opacity fade — three different "feels" for the exact same job. Now all
 * three import this single constant, so moving between screens reads as the
 * same product everywhere.
 */
export const PAGE_TRANSITION = {
  initial: { opacity: 0, scale: 0.97, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 1.02, y: -8 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
} as const;
