/**
 * Pure canvas drawing primitives for the tracing board — base, guides,
 * polylines, arrows, dots, mini stars and the friendly pencil. No state.
 */
import type { LetterDefinition } from "@/types";
import { CANVAS_SIZE, PADDING, LETTER_SCALE, COLOR_ARROW } from "./constants";
import type { StrokeGeom } from "./geometry";

// ─── Draw helpers ─────────────────────────────────────────────────────────────

export function drawBase(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#FBF9FF";
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") ctx.roundRect(0, 0, CANVAS_SIZE, CANVAS_SIZE, 28);
  else ctx.rect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.fill();
}

export function strokePath2D(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  color: string,
  width: number,
  alpha: number,
  dash?: [number, number],
  shadow?: { color: string; blur: number },
  offsetX = 0,
  offsetY = 0
) {
  ctx.save();
  ctx.translate(PADDING, PADDING);
  ctx.scale(LETTER_SCALE, LETTER_SCALE);
  ctx.translate(offsetX, offsetY);
  if (dash) ctx.setLineDash([dash[0] / LETTER_SCALE, dash[1] / LETTER_SCALE]);
  if (shadow) {
    ctx.shadowColor = shadow.color;
    ctx.shadowBlur = shadow.blur;
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = width / LETTER_SCALE;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = alpha;
  ctx.stroke(path);
  ctx.restore();
}

export type XY = { x: number; y: number } | [number, number];
export const gx = (p: XY): number => (Array.isArray(p) ? p[0] : p.x);
export const gy = (p: XY): number => (Array.isArray(p) ? p[1] : p.y);

export function drawPolyline(
  ctx: CanvasRenderingContext2D,
  pts: XY[],
  color: string,
  width: number,
  alpha: number
) {
  if (pts.length < 2) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(gx(pts[0]), gy(pts[0]));
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(gx(pts[i]), gy(pts[i]));
  }
  ctx.stroke();
  ctx.restore();
}

/** Soft playful arrows along the active stroke — gentle pulse + tiny drift */
export function drawArrows(ctx: CanvasRenderingContext2D, geom: StrokeGeom, time: number) {
  for (let i = 0; i < geom.arrows.length; i++) {
    const a = geom.arrows[i];
    const phase = time * 1.6 + i * 0.9;
    const pulse = (Math.sin(phase) + 1) / 2; // 0..1
    const drift = Math.sin(phase * 0.8) * 3; // ±3px along the tangent
    const x = a.x + a.tx * drift;
    const y = a.y + a.ty * drift;
    const size = 9 + pulse * 1.6;
    const angle = Math.atan2(a.ty, a.tx);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha = 0.5 + pulse * 0.35;
    ctx.fillStyle = "white";
    ctx.strokeStyle = COLOR_ARROW;
    ctx.lineWidth = 2.4;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-size * 0.55, -size * 0.62);
    ctx.lineTo(size * 0.62, 0);
    ctx.lineTo(-size * 0.55, size * 0.62);
    ctx.stroke();
    ctx.restore();
  }
}

export function drawStartDot(ctx: CanvasRenderingContext2D, pt: [number, number], pulse: number) {
  const [cx, cy] = pt;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, 20 + pulse * 7, 0, Math.PI * 2);
  ctx.fillStyle = "#A882E8";
  ctx.globalAlpha = 0.15 + pulse * 0.08;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, 13, 0, Math.PI * 2);
  ctx.fillStyle = "#7C5CBF";
  ctx.globalAlpha = 0.9;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.globalAlpha = 1;
  ctx.fill();
  ctx.restore();
}

/** Small soft five-point star — the child's magical tracing ink */
export function drawMiniStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  rot: number,
  color: string,
  alpha: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.46;
    ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export const TRAIL_COLORS = ["#A882E8", "#C9A9F5", "#FF9EBC", "#FFD93D"];

/** Large, friendly children's-game pencil. liftT 0 = on paper, 1 = fully lifted.
 *  fadeWithLift=false keeps the pencil fully visible while lifted — used when
 *  it travels between strokes so the child clearly SEES the lift. */
export function drawPencil(ctx: CanvasRenderingContext2D, x: number, y: number, liftT: number, fadeWithLift = true) {
  const lift = liftT * 46;
  const alpha = fadeWithLift ? 1 - liftT * 0.9 : 1;
  const scale = 1.35 + liftT * 0.15;
  ctx.save();
  ctx.globalAlpha = Math.max(0, alpha);
  ctx.translate(x, y - lift);

  // Contact glow shrinks as the pencil lifts
  const glowR = 24 * (1 - liftT);
  if (glowR > 2) {
    const grad = ctx.createRadialGradient(0, lift, 0, 0, lift, glowR);
    grad.addColorStop(0, "rgba(168,130,232,0.35)");
    grad.addColorStop(1, "rgba(168,130,232,0)");
    ctx.beginPath();
    ctx.arc(0, lift, glowR, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  ctx.scale(scale, scale);
  ctx.rotate(-Math.PI / 5);

  // Soft drop shadow
  ctx.shadowColor = "rgba(90,60,140,0.25)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;

  // Body
  ctx.fillStyle = "#FFD93D";
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(-8, -34, 16, 40, 3) : ctx.rect(-8, -34, 16, 40);
  ctx.fill();
  ctx.shadowColor = "transparent";
  // Body stripe for depth
  ctx.fillStyle = "#F2C94C";
  ctx.fillRect(2, -34, 6, 40);
  // Wood tip
  ctx.fillStyle = "#F0B27A";
  ctx.beginPath();
  ctx.moveTo(-8, 6);
  ctx.lineTo(8, 6);
  ctx.lineTo(0, 22);
  ctx.closePath();
  ctx.fill();
  // Graphite
  ctx.fillStyle = "#4A4A4A";
  ctx.beginPath();
  ctx.moveTo(-2.4, 16);
  ctx.lineTo(2.4, 16);
  ctx.lineTo(0, 22);
  ctx.closePath();
  ctx.fill();
  // Eraser + ferrule
  ctx.fillStyle = "#C9CBD6";
  ctx.fillRect(-8, -36, 16, 5);
  ctx.fillStyle = "#FF9EBC";
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(-8, -44, 16, 9, 4) : ctx.rect(-8, -44, 16, 9);
  ctx.fill();
  // Friendly face
  ctx.fillStyle = "#5A4A2F";
  ctx.beginPath();
  ctx.arc(-3, -20, 1.6, 0, Math.PI * 2);
  ctx.arc(3, -20, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5A4A2F";
  ctx.lineWidth = 1.4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(0, -16, 3.4, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  // Outline
  ctx.strokeStyle = "rgba(0,0,0,0.14)";
  ctx.lineWidth = 1.4;
  ctx.strokeRect(-8, -34, 16, 40);

  ctx.restore();
}

