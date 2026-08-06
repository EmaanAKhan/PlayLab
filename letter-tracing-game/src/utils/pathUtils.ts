import type { Point } from "@/types";

/** Linear interpolation between two points */
function lerp(a: Point, b: Point, t: number): Point {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/** Evaluate a quadratic bezier at parameter t */
function evalQuadratic(p0: Point, p1: Point, p2: Point, t: number): Point {
  const a = lerp(p0, p1, t);
  const b = lerp(p1, p2, t);
  return lerp(a, b, t);
}

/** Evaluate a cubic bezier at parameter t */
function evalCubic(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  t: number
): Point {
  const a = lerp(p0, p1, t);
  const b = lerp(p1, p2, t);
  const c = lerp(p2, p3, t);
  const ab = lerp(a, b, t);
  const bc = lerp(b, c, t);
  return lerp(ab, bc, t);
}

/** Distance between two points */
export function distance(a: Point, b: Point): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

/**
 * Segment types for building letter paths.
 */
export type PathSegment =
  | { type: "L"; to: Point }
  | { type: "Q"; c: Point; to: Point }
  | { type: "C"; c1: Point; c2: Point; to: Point };

/**
 * Build a sampled point array and an SVG path string from a start point
 * and an array of segments.
 */
export function buildPath(
  start: Point,
  segments: PathSegment[],
  samplesPerSegment = 20
): { points: Point[]; pathData: string } {
  const points: Point[] = [start];
  let svgPath = `M ${start[0]} ${start[1]}`;
  let current = start;

  for (const seg of segments) {
    if (seg.type === "L") {
      const n = samplesPerSegment;
      for (let i = 1; i <= n; i++) {
        points.push(lerp(current, seg.to, i / n));
      }
      svgPath += ` L ${seg.to[0]} ${seg.to[1]}`;
      current = seg.to;
    } else if (seg.type === "Q") {
      const n = samplesPerSegment;
      for (let i = 1; i <= n; i++) {
        points.push(evalQuadratic(current, seg.c, seg.to, i / n));
      }
      svgPath += ` Q ${seg.c[0]} ${seg.c[1]} ${seg.to[0]} ${seg.to[1]}`;
      current = seg.to;
    } else if (seg.type === "C") {
      const n = samplesPerSegment;
      for (let i = 1; i <= n; i++) {
        points.push(evalCubic(current, seg.c1, seg.c2, seg.to, i / n));
      }
      svgPath += ` C ${seg.c1[0]} ${seg.c1[1]} ${seg.c2[0]} ${seg.c2[1]} ${seg.to[0]} ${seg.to[1]}`;
      current = seg.to;
    }
  }

  return { points, pathData: svgPath };
}

/**
 * Given a list of pre-sampled points and a current finger position,
 * return the index of the closest point on the path and the distance to it.
 */
export function closestPointOnPath(
  pathPoints: Point[],
  finger: Point
): { index: number; dist: number } {
  let bestIndex = 0;
  let bestDist = Infinity;
  for (let i = 0; i < pathPoints.length; i++) {
    const d = distance(pathPoints[i], finger);
    if (d < bestDist) {
      bestDist = d;
      bestIndex = i;
    }
  }
  return { index: bestIndex, dist: bestDist };
}

/**
 * Scale a point from the 200×200 letter-space to canvas pixels.
 */
export function scalePoint(
  p: Point,
  canvasSize: number,
  padding = 20
): Point {
  const usable = canvasSize - padding * 2;
  return [padding + (p[0] / 200) * usable, padding + (p[1] / 200) * usable];
}
