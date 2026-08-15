import type { CSSProperties } from "react";

/**
 * The ONE sanctioned way to hand a runtime value to CSS.
 *
 * The codebase has no inline styling: components carry structure and
 * behaviour, styling lives in CSS and in the design system. A handful of
 * values genuinely cannot be known at build time though — a drag ghost's
 * pointer coordinates, a tile's shuffled slot, a size tier picked per round.
 * There is no CSS class that can express "wherever the finger is right now".
 *
 * Instead of reopening the door to arbitrary inline declarations, those
 * components pass values through here as CSS CUSTOM PROPERTIES and pair them
 * with a real class from utilities.css (.pl-at, .pl-box, .pl-glyph, .pl-tint)
 * that contains the actual declaration. The rule stays in the stylesheet;
 * only the number crosses the boundary.
 *
 * The `--pl-` prefix is mandatory at the type level, so this helper can never
 * be used to smuggle a normal CSS property back into a component.
 *
 *   <div className="pl-at pl-box" style={cssVars({ "--pl-x": `${x}px`, ... })} />
 */
export type PlayLabCssVar = `--pl-${string}`;

export function cssVars(vars: Record<PlayLabCssVar, string | number>): CSSProperties {
  return vars as CSSProperties;
}
