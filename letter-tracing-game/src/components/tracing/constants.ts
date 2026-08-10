/**
 * Tracing engine constants — canvas geometry, validation tuning and palette.
 * Every tolerance and threshold that shapes how tracing FEELS lives here.
 */

export type TracingPhase =
  | "demo-draw"    // pencil is writing the current stroke
  | "demo-travel"  // pencil visibly lifts and travels to the next stroke's start
  | "demo-hold"    // whole letter written — pencil lifts away, letter stays visible
  | "demo-fade"    // demo ink crossfades into the tracing guide
  | "trace"
  | "await-lift"
  | "done";


export const CANVAS_SIZE = 460;
export const PADDING = 30;
/** Tolerance in canvas px — how far the child's finger may drift from the
 *  path while STILL making progress. Forgiving, but progress is sequential
 *  (see FRONTIER_WINDOW) so proximity alone can never fill the letter. */
export const TOLERANCE_PX = 44;
/** Progress advances only through a small window just ahead of the child's
 *  current position along the path (the "frontier"). Touching far-future
 *  sections does nothing — the child must physically travel the path. The
 *  window is DISTANCE-based (≈ this many canvas px of path ahead) so short,
 *  densely-sampled strokes are just as protected as long ones, while still
 *  allowing small skips so slight drifting is never punished. */
export const FRONTIER_WINDOW_PX = 40;
/** The stroke completes only once the child has actually traced this much of
 *  the path, in order, all the way to its end region. */
export const STROKE_THRESHOLD = 0.95;
export const LETTER_SCALE = (CANVAS_SIZE - PADDING * 2) / 200;

// ─── Colors ───────────────────────────────────────────────────────────────────
export const COLOR_COMPLETED = "#7C5CBF";      // finished strokes — solid plum
export const COLOR_ACTIVE_GUIDE = "#C3BAD8";   // active stroke — light, soft pastel-gray guide
export const COLOR_ACTIVE_GLOW = "#DCD4F0";    // gentle glow behind the active stroke
export const COLOR_FUTURE = "#DCD4F2";         // upcoming strokes — subdued lavender
export const COLOR_CHILD_INK = "#8B63D6";      // the child's own trace — richer purple
export const COLOR_ARROW = "#8F7DBB";          // soft, playful directional arrows

