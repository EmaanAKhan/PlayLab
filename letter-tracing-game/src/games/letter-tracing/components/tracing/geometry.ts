/**
 * Per-stroke precomputed geometry: canvas-space samples, Path2D, arrow
 * anchors, and the distance-based frontier window for the sequential engine.
 */
import type { LetterDefinition, Point } from "@games/letter-tracing/types";
import { scalePoint } from "@games/letter-tracing/utils/pathUtils";
import { CANVAS_SIZE, PADDING, FRONTIER_WINDOW_PX } from "./constants";

// ─── Per-stroke precomputed geometry ─────────────────────────────────────────
export interface StrokeGeom {
  /** Canvas-space sampled points */
  pts: [number, number][];
  /** Letter-space points (for tolerance tests in a resolution-independent space) */
  letterPts: Point[];
  path: Path2D;
  length: number;
  /** How many points ≈ FRONTIER_WINDOW_PX of path for THIS stroke */
  windowPts: number;
  /** Evenly spaced arrow anchors: position + unit tangent */
  arrows: { x: number; y: number; tx: number; ty: number }[];
}

export function buildGeometry(letter: LetterDefinition): StrokeGeom[] {
  return letter.strokes.map((stroke) => {
    const pts = stroke.points.map((p) => scalePoint(p, CANVAS_SIZE, PADDING));
    let length = 0;
    const cum: number[] = [0];
    for (let i = 1; i < pts.length; i++) {
      length += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      cum.push(length);
    }
    // Arrow anchors — one every ~64px, skipping the very ends
    const arrowCount = Math.max(2, Math.min(6, Math.floor(length / 64)));
    const arrows: StrokeGeom["arrows"] = [];
    for (let a = 0; a < arrowCount; a++) {
      const target = ((a + 0.7) / (arrowCount + 0.4)) * length;
      let idx = 1;
      while (idx < cum.length - 1 && cum[idx] < target) idx++;
      const prev = pts[Math.max(0, idx - 1)];
      const next = pts[Math.min(pts.length - 1, idx + 1)];
      const dx = next[0] - prev[0];
      const dy = next[1] - prev[1];
      const d = Math.hypot(dx, dy) || 1;
      arrows.push({ x: pts[idx][0], y: pts[idx][1], tx: dx / d, ty: dy / d });
    }
    const avgSpacing = length / Math.max(1, pts.length - 1);
    const windowPts = Math.max(2, Math.min(8, Math.round(FRONTIER_WINDOW_PX / Math.max(1, avgSpacing))));
    return {
      pts,
      letterPts: stroke.points,
      path: new Path2D(stroke.pathData),
      length,
      windowPts,
      arrows,
    };
  });
}

