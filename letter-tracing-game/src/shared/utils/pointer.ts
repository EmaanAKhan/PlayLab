/**
 * Drag-and-drop primitives shared by the games that let a child carry
 * something across the screen (Feed the Shark, Magnet Match).
 *
 * Two rules are baked in here because both games learned them the hard way:
 *
 *  - Coordinates are ROOT-RELATIVE, never viewport-fixed. Game screens render
 *    inside a transformed Framer Motion ancestor, and position:fixed is
 *    broken relative to a transformed parent — a fixed drag ghost drifts away
 *    from the finger. Measuring against the game root is immune.
 *
 *  - Drop zones are INFLATED by a slop margin and resolved nearest-centre.
 *    Small fingers miss; the generous box forgives that, and when two
 *    inflated boxes overlap (easily on a narrow phone) the target the child
 *    was clearly aiming at wins instead of whichever happened to be first.
 */

export interface RootPoint {
  x: number;
  y: number;
}

/** Convert a pointer event's viewport coordinates into root-relative ones. */
export function toRootPoint(
  root: HTMLElement | null,
  clientX: number,
  clientY: number
): RootPoint {
  const rect = root?.getBoundingClientRect();
  return { x: clientX - (rect?.left ?? 0), y: clientY - (rect?.top ?? 0) };
}

/**
 * Which registered target is under the pointer, allowing `slopPx` of overshoot
 * on every edge. Returns null when the pointer is nowhere near one — callers
 * treat that as "dropped on open ground", which is never a failure.
 *
 * @param isEligible optional filter, e.g. to ignore slots already filled.
 */
export function findDropTarget<K>(
  targets: ReadonlyMap<K, HTMLElement>,
  clientX: number,
  clientY: number,
  slopPx: number,
  isEligible?: (key: K) => boolean
): K | null {
  let best: K | null = null;
  let bestDistance = Infinity;

  for (const [key, element] of targets) {
    if (isEligible && !isEligible(key)) continue;
    const rect = element.getBoundingClientRect();
    const inside =
      clientX >= rect.left - slopPx &&
      clientX <= rect.right + slopPx &&
      clientY >= rect.top - slopPx &&
      clientY <= rect.bottom + slopPx;
    if (!inside) continue;

    const distance = Math.hypot(
      clientX - (rect.left + rect.width / 2),
      clientY - (rect.top + rect.height / 2)
    );
    if (distance < bestDistance) {
      bestDistance = distance;
      best = key;
    }
  }

  return best;
}

/**
 * Registers/unregisters an element in a target map from a React ref callback:
 *   ref={(el) => registerTarget(targetRefs.current, key, el)}
 */
export function registerTarget<K>(
  targets: Map<K, HTMLElement>,
  key: K,
  element: HTMLElement | null
): void {
  if (element) targets.set(key, element);
  else targets.delete(key);
}
