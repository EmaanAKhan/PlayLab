"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import type { LetterDefinition, Point } from "@/types";
import { distance, scalePoint } from "@/utils/pathUtils";

export type TracingPhase =
  | "demo-draw"    // pencil is writing the current stroke
  | "demo-travel"  // pencil visibly lifts and travels to the next stroke's start
  | "demo-hold"    // whole letter written — pencil lifts away, letter stays visible
  | "demo-fade"    // demo ink crossfades into the tracing guide
  | "trace"
  | "await-lift"
  | "done";

interface TracingCanvasProps {
  letter: LetterDefinition;
  /** Called once the child has traced EVERY stroke of the letter */
  onComplete: () => void;
  /** Overall letter progress 0–1 (completed strokes + active-stroke coverage) */
  onProgress?: (progress: number) => void;
  /** Fired when a single stroke is completed by the child (subtle chime) */
  onStrokeComplete?: (strokeIndex: number, totalStrokes: number) => void;
  /** Fired when the child scribbles far away from the active stroke */
  onOffPath?: () => void;
  /** Whether each stroke gets an automatic pencil demonstration before the
   *  child traces it. Used on the very first attempt at a letter only. */
  withDemo?: boolean;
  /** Fired when the very first pencil demonstration begins */
  onDemoStart?: () => void;
  /** Fired when the first stroke's demonstration finishes (child's first turn) */
  onFirstTurn?: () => void;
  /** Fired whenever the internal phase changes (screen uses it for captions) */
  onPhaseChange?: (phase: TracingPhase) => void;
  /** Bump to replay the demonstration from stroke 1 (resets current attempt) */
  replayToken?: number;
  /** While true, the pencil demonstration waits (used so the letter's voice
   *  introduction always finishes before tracing guidance begins) */
  holdDemo?: boolean;
}

const CANVAS_SIZE = 460;
const PADDING = 30;
/** Tolerance in canvas px — how far the child's finger may drift from the
 *  path while STILL making progress. Forgiving, but progress is sequential
 *  (see FRONTIER_WINDOW) so proximity alone can never fill the letter. */
const TOLERANCE_PX = 44;
/** Progress advances only through a small window just ahead of the child's
 *  current position along the path (the "frontier"). Touching far-future
 *  sections does nothing — the child must physically travel the path. The
 *  window is DISTANCE-based (≈ this many canvas px of path ahead) so short,
 *  densely-sampled strokes are just as protected as long ones, while still
 *  allowing small skips so slight drifting is never punished. */
const FRONTIER_WINDOW_PX = 40;
/** The stroke completes only once the child has actually traced this much of
 *  the path, in order, all the way to its end region. */
const STROKE_THRESHOLD = 0.95;
const LETTER_SCALE = (CANVAS_SIZE - PADDING * 2) / 200;

// ─── Colors ───────────────────────────────────────────────────────────────────
const COLOR_COMPLETED = "#7C5CBF";      // finished strokes — solid plum
const COLOR_ACTIVE_GUIDE = "#C3BAD8";   // active stroke — light, soft pastel-gray guide
const COLOR_ACTIVE_GLOW = "#DCD4F0";    // gentle glow behind the active stroke
const COLOR_FUTURE = "#DCD4F2";         // upcoming strokes — subdued lavender
const COLOR_CHILD_INK = "#8B63D6";      // the child's own trace — richer purple
const COLOR_ARROW = "#8F7DBB";          // soft, playful directional arrows

// ─── Per-stroke precomputed geometry ─────────────────────────────────────────
interface StrokeGeom {
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

function buildGeometry(letter: LetterDefinition): StrokeGeom[] {
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

// ─── Draw helpers ─────────────────────────────────────────────────────────────

function drawBase(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#FBF9FF";
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") ctx.roundRect(0, 0, CANVAS_SIZE, CANVAS_SIZE, 28);
  else ctx.rect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.fill();
}

function strokePath2D(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  color: string,
  width: number,
  alpha: number,
  dash?: [number, number],
  shadow?: { color: string; blur: number }
) {
  ctx.save();
  ctx.translate(PADDING, PADDING);
  ctx.scale(LETTER_SCALE, LETTER_SCALE);
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

type XY = { x: number; y: number } | [number, number];
const gx = (p: XY): number => (Array.isArray(p) ? p[0] : p.x);
const gy = (p: XY): number => (Array.isArray(p) ? p[1] : p.y);

function drawPolyline(
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
function drawArrows(ctx: CanvasRenderingContext2D, geom: StrokeGeom, time: number) {
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

function drawStartDot(ctx: CanvasRenderingContext2D, pt: [number, number], pulse: number) {
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
function drawMiniStar(
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

const TRAIL_COLORS = ["#A882E8", "#C9A9F5", "#FF9EBC", "#FFD93D"];

/** Large, friendly children's-game pencil. liftT 0 = on paper, 1 = fully lifted.
 *  fadeWithLift=false keeps the pencil fully visible while lifted — used when
 *  it travels between strokes so the child clearly SEES the lift. */
function drawPencil(ctx: CanvasRenderingContext2D, x: number, y: number, liftT: number, fadeWithLift = true) {
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

// ─── Component ────────────────────────────────────────────────────────────────

export function TracingCanvas({
  letter,
  onComplete,
  onProgress,
  onStrokeComplete,
  onOffPath,
  withDemo = true,
  onDemoStart,
  onFirstTurn,
  onPhaseChange,
  replayToken = 0,
  holdDemo = false,
}: TracingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const geomRef = useRef<StrokeGeom[]>([]);
  /** Per-stroke: which sampled points the child has covered */
  const coveredRef = useRef<Set<number>[]>([]);
  /** Per-stroke: age (frames) of each covered point, for a calm fade-in */
  const coveredAgeRef = useRef<Map<number, number>[]>([]);
  /** Fly-away trail stars spawned when the whole letter is completed */
  const flyStarsRef = useRef<
    { x: number; y: number; vx: number; vy: number; hold: number; life: number; color: string; rot: number; rotV: number; size: number }[]
  >([]);
  /** Per-stroke: 0–1 fill-in animation after completion */
  const fillTRef = useRef<number[]>([]);
  const completedStrokesRef = useRef<boolean[]>([]);
  const activeIndexRef = useRef(0);

  const phaseRef = useRef<TracingPhase>("trace");
  const demoEnabledRef = useRef(withDemo);
  const firstTurnFiredRef = useRef(false);

  // Demo playback — the FULL letter is written on an empty board first:
  // stroke → visible lift+travel → stroke → ... → hold → crossfade to guide
  const demoStrokeIdxRef = useRef(0);
  const demoIdxRef = useRef(0);
  const demoTRef = useRef(0);
  const demoInkStrokesRef = useRef<{ x: number; y: number }[][]>([]);
  const demoHandRef = useRef({ x: 0, y: 0 });
  const demoLiftTRef = useRef(0);
  const demoTravelRef = useRef({ t: 0, fx: 0, fy: 0, tx: 0, ty: 0 });
  const demoHoldTimerRef = useRef(0);
  const demoFadeTRef = useRef(0);
  const demoSpeedRef = useRef(3);

  // Child input
  const isDrawingRef = useRef(false);
  const lastTouchRef = useRef<[number, number] | null>(null);
  const inkRef = useRef<[number, number][]>([]);
  const inkFadeRef = useRef(1);
  const offPathCountRef = useRef(0);
  const gainedThisDragRef = useRef(0);
  const pointsThisDragRef = useRef(0);

  const pulseRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  /** Tiny sparkle burst particles (stroke completion) — drawn on this canvas,
   *  deliberately small so the letter and guide always stay clearly visible */
  const burstRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number; color: string }[]>([]);

  const spawnBurst = useCallback((x: number, y: number) => {
    const colors = ["#FFD93D", "#A882E8", "#FF9EBC", "#66CC94"];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const s = 1.4 + Math.random() * 1.8;
      burstRef.current.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 0.8,
        life: 1,
        color: colors[i % colors.length],
      });
    }
  }, []);

  const [cursorStage, setCursorStage] = useState<"demo" | "trace">(withDemo ? "demo" : "trace");
  const holdDemoRef = useRef(holdDemo);
  useEffect(() => {
    holdDemoRef.current = holdDemo;
  }, [holdDemo]);

  const setPhase = useCallback(
    (p: TracingPhase) => {
      phaseRef.current = p;
      setCursorStage(p.startsWith("demo") ? "demo" : "trace");
      onPhaseChange?.(p);
    },
    [onPhaseChange]
  );

  const reportProgress = useCallback(() => {
    const total = geomRef.current.length || 1;
    let done = 0;
    for (let i = 0; i < total; i++) {
      if (completedStrokesRef.current[i]) done += 1;
      else if (i === activeIndexRef.current) {
        const g = geomRef.current[i];
        done += g ? coveredRef.current[i].size / Math.max(1, g.letterPts.length) : 0;
      }
    }
    onProgress?.(Math.min(1, done / total));
  }, [onProgress]);

  /** Prime the pencil demo for a given stroke index */
  const primeDemoStroke = useCallback((strokeIdx: number) => {
    const g = geomRef.current[strokeIdx];
    if (!g) return;
    demoStrokeIdxRef.current = strokeIdx;
    demoIdxRef.current = 0;
    demoTRef.current = 0;
    demoLiftTRef.current = 0;
    demoHandRef.current = { x: g.pts[0][0], y: g.pts[0][1] };
    // Calm, reasonably slow writing (~2s per stroke), clamped
    demoSpeedRef.current = Math.max(1.1, Math.min(4.5, g.length / 115));
  }, []);

  const resetAttempt = useCallback(
    (demo: boolean) => {
      const n = letter.strokes.length;
      coveredRef.current = Array.from({ length: n }, () => new Set<number>());
      coveredAgeRef.current = Array.from({ length: n }, () => new Map<number, number>());
      flyStarsRef.current = [];
      fillTRef.current = Array.from({ length: n }, () => 0);
      completedStrokesRef.current = Array.from({ length: n }, () => false);
      activeIndexRef.current = 0;
      inkRef.current = [];
      inkFadeRef.current = 1;
      isDrawingRef.current = false;
      lastTouchRef.current = null;
      doneRef.current = false;
      offPathCountRef.current = 0;
      demoEnabledRef.current = demo;
      firstTurnFiredRef.current = false;
      onProgress?.(0);
      demoInkStrokesRef.current = letter.strokes.map(() => []);
      demoTravelRef.current = { t: 0, fx: 0, fy: 0, tx: 0, ty: 0 };
      demoHoldTimerRef.current = 0;
      demoFadeTRef.current = 0;
      if (demo) {
        primeDemoStroke(0);
        setPhase("demo-draw");
        onDemoStart?.();
      } else {
        setPhase("trace");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [letter, primeDemoStroke, setPhase]
  );

  // Init / letter change
  useEffect(() => {
    geomRef.current = buildGeometry(letter);
    resetAttempt(withDemo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letter]);

  // Explicit replay — restart this attempt with the stroke-by-stroke demo
  const firstReplayRef = useRef(true);
  useEffect(() => {
    if (firstReplayRef.current) {
      firstReplayRef.current = false;
      return;
    }
    resetAttempt(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayToken]);

  /** Advance to the next stroke (called only after the child has lifted) */
  const advanceStroke = useCallback(() => {
    inkRef.current = [];
    inkFadeRef.current = 1;
    activeIndexRef.current += 1;
    if (activeIndexRef.current >= geomRef.current.length) {
      doneRef.current = true;
      // The trail stars along the completed letter come alive: a brief glow,
      // then they gently fly outward/upward. Short, satisfying, never a
      // screen-covering explosion.
      const c = CANVAS_SIZE / 2;
      let k = 0;
      for (const g of geomRef.current) {
        for (let i = 0; i < g.pts.length; i += 4) {
          const [x, y] = g.pts[i];
          const dx = x - c;
          const dy = y - c;
          const d = Math.hypot(dx, dy) || 1;
          flyStarsRef.current.push({
            x,
            y,
            vx: (dx / d) * (0.9 + Math.random() * 1.1),
            vy: (dy / d) * 0.7 - 1.6 - Math.random() * 1.2,
            hold: 12 + (k % 7) * 2,
            life: 1,
            color: TRAIL_COLORS[k % TRAIL_COLORS.length],
            rot: Math.random() * Math.PI * 2,
            rotV: (Math.random() - 0.5) * 0.12,
            size: 5 + Math.random() * 3.5,
          });
          k++;
        }
      }
      setPhase("done");
      onComplete();
      return;
    }
    lastTouchRef.current = null;
    // The full-letter demonstration already played up front — every child
    // stroke goes straight to tracing.
    setPhase("trace");
  }, [onComplete, setPhase]);

  // ── Render loop ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;
    let lastTime = 0;

    function render(time: number) {
      if (!running || !ctx || !canvas) return;
      const dt = Math.min((time - lastTime) / 16, 3);
      lastTime = time;
      const t = time / 1000;
      pulseRef.current = (pulseRef.current + 0.035 * dt) % (Math.PI * 2);
      const pulse = (Math.sin(pulseRef.current) + 1) / 2;

      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      drawBase(ctx);

      const geoms = geomRef.current;
      const active = activeIndexRef.current;
      const phase = phaseRef.current;

      // ── 1. Tracing guide layer ────────────────────────────────────────────
      // During the demonstration the board starts EMPTY — the letter is
      // written by the pencil first. The guide crossfades in during demo-fade
      // and stays for the whole tracing phase.
      const isWriting = phase === "demo-draw" || phase === "demo-travel" || phase === "demo-hold";
      const guideAlpha = phase === "demo-fade" ? demoFadeTRef.current : 1;
      if (!isWriting) {
        for (let i = 0; i < geoms.length; i++) {
          const g = geoms[i];
          if (completedStrokesRef.current[i]) {
            // Finished strokes — beautifully filled, with a soft settle-in ramp
            if (fillTRef.current[i] < 1) fillTRef.current[i] = Math.min(1, fillTRef.current[i] + 0.06 * dt);
            const ft = fillTRef.current[i];
            strokePath2D(ctx, g.path, COLOR_COMPLETED, 17 + (1 - ft) * 5, (0.55 + ft * 0.4) * guideAlpha);
          } else if (i === active && phase !== "done") {
            // Active stroke — soft glow + clear gray guide
            strokePath2D(ctx, g.path, COLOR_ACTIVE_GLOW, 26, 0.26 * guideAlpha, undefined, {
              color: "rgba(168,130,232,0.35)",
              blur: 10,
            });
            strokePath2D(ctx, g.path, COLOR_ACTIVE_GUIDE, 15, 0.68 * guideAlpha, [1, 14]);
          } else {
            // Upcoming strokes — visible but subdued
            strokePath2D(ctx, g.path, COLOR_FUTURE, 15, 0.5 * guideAlpha, [8, 9]);
          }
        }
      }

      const activeGeom = geoms[active];

      if (activeGeom && phase !== "done") {
        // ── 2. Directional arrows — only once the child is tracing ─────────
        if (phase === "trace" || phase === "await-lift") {
          drawArrows(ctx, activeGeom, t);
        }

        // ── 3. Full-letter demonstration on the empty board ─────────────────
        // stroke → pencil visibly lifts + travels → next stroke → ... →
        // finished letter holds → crossfades into the tracing guide.
        if (phase === "demo-draw" && holdDemoRef.current) {
          // Voice introduction still playing — pencil waits at the start point
        } else if (phase === "demo-draw") {
          const g = geoms[demoStrokeIdxRef.current];
          const ink = demoInkStrokesRef.current[demoStrokeIdxRef.current];
          if (g && ink) {
            const pts = g.pts;
            const idx = demoIdxRef.current;
            if (idx >= pts.length - 1) {
              if (demoStrokeIdxRef.current < geoms.length - 1) {
                // More strokes — visibly LIFT and travel; never connect strokes
                const next = geoms[demoStrokeIdxRef.current + 1];
                demoTravelRef.current = {
                  t: 0,
                  fx: demoHandRef.current.x,
                  fy: demoHandRef.current.y,
                  tx: next.pts[0][0],
                  ty: next.pts[0][1],
                };
                setPhase("demo-travel");
              } else {
                // Whole letter written — hold it, pencil lifts away
                demoLiftTRef.current = 0;
                demoHoldTimerRef.current = 0;
                setPhase("demo-hold");
              }
            } else {
              const from = pts[idx];
              const to = pts[idx + 1];
              const segLen = Math.hypot(to[0] - from[0], to[1] - from[1]) || 1;
              demoTRef.current += (demoSpeedRef.current * dt) / segLen;
              if (demoTRef.current >= 1) {
                demoIdxRef.current++;
                demoTRef.current = 0;
                demoHandRef.current = { x: to[0], y: to[1] };
                ink.push({ x: to[0], y: to[1] });
              } else {
                const hx = from[0] + (to[0] - from[0]) * demoTRef.current;
                const hy = from[1] + (to[1] - from[1]) * demoTRef.current;
                demoHandRef.current = { x: hx, y: hy };
                ink.push({ x: hx, y: hy });
              }
            }
          }
        } else if (phase === "demo-travel") {
          const tr = demoTravelRef.current;
          tr.t = Math.min(1, tr.t + 0.02 * dt);
          const ease = tr.t * tr.t * (3 - 2 * tr.t); // smoothstep
          demoHandRef.current = {
            x: tr.fx + (tr.tx - tr.fx) * ease,
            y: tr.fy + (tr.ty - tr.fy) * ease,
          };
          if (tr.t >= 1) {
            primeDemoStroke(demoStrokeIdxRef.current + 1);
            setPhase("demo-draw");
          }
        } else if (phase === "demo-hold") {
          demoLiftTRef.current = Math.min(1, demoLiftTRef.current + 0.045 * dt);
          demoHoldTimerRef.current += dt;
          // The complete letter remains visible briefly before the guide appears
          if (demoHoldTimerRef.current > 55) {
            demoFadeTRef.current = 0;
            setPhase("demo-fade");
            // "Now it's your turn" as the guide starts appearing
            if (!firstTurnFiredRef.current) {
              firstTurnFiredRef.current = true;
              onFirstTurn?.();
            }
          }
        } else if (phase === "demo-fade") {
          demoFadeTRef.current = Math.min(1, demoFadeTRef.current + 0.05 * dt);
          if (demoFadeTRef.current >= 1) {
            demoInkStrokesRef.current = letter.strokes.map(() => []);
            setPhase("trace");
          }
        }

        // Demo ink — each stroke its own polyline (strokes never connect);
        // fades out as the guide crossfades in
        const demoInkAlpha = phase === "demo-fade" ? 1 - demoFadeTRef.current : 1;
        if (demoInkAlpha > 0) {
          for (const ink of demoInkStrokesRef.current) {
            if (ink.length > 1) {
              drawPolyline(ctx, ink, COLOR_COMPLETED, 16, 0.85 * demoInkAlpha);
            }
          }
        }

        // ── 4. Child's own pastel ink over the gray guide ───────────────────
        if (phase === "trace" || phase === "await-lift") {
          // Revealed portion: a soft ink line fades in gently under a trail of
          // tiny pastel stars — magical tracing ink, calm and deliberate, with
          // the letter shape always clearly visible.
          const covered = coveredRef.current[active];
          const ages = coveredAgeRef.current[active];
          if (covered && ages && covered.size > 0) {
            ctx.save();
            for (const i of covered) {
              const p = activeGeom.pts[i];
              if (!p) continue;
              const age = (ages.get(i) ?? 0) + dt;
              ages.set(i, age);
              const ease = Math.min(1, age / 16); // gentle ~0.27s fade-in
              // soft ink dot keeps the guide gently filled — supportive, not
              // dominant, so the child's OWN line stays the star of the show
              ctx.globalAlpha = 0.32 * ease;
              ctx.fillStyle = COLOR_CHILD_INK;
              ctx.beginPath();
              ctx.arc(p[0], p[1], 8, 0, Math.PI * 2);
              ctx.fill();
              // a tiny star on every few points — sparse enough to stay subtle
              if (i % 3 === 0) {
                drawMiniStar(
                  ctx,
                  p[0],
                  p[1],
                  5.5 + (i % 2) * 1.5,
                  (i * 0.7) % (Math.PI * 2),
                  TRAIL_COLORS[i % TRAIL_COLORS.length],
                  0.85 * ease
                );
              }
            }
            ctx.restore();
          }
          // Free ink (fading if it was off-path)
          if (inkFadeRef.current < 1) {
            inkFadeRef.current = Math.max(0, inkFadeRef.current - 0.08 * dt);
            if (inkFadeRef.current <= 0) {
              inkRef.current = [];
              inkFadeRef.current = 1;
            }
          }
          drawPolyline(ctx, inkRef.current, COLOR_CHILD_INK, 12, 0.7 * inkFadeRef.current);

          // Pulsing dot marks where to (re)start: the frontier — the exact
          // point where the child paused — or the stroke start if untouched
          if (phase === "trace" && !isDrawingRef.current) {
            const frontierIdx = Math.min(covered ? covered.size : 0, activeGeom.pts.length - 1);
            drawStartDot(ctx, activeGeom.pts[frontierIdx], pulse);
          }

          // The pencil follows the child's finger while they trace. When they
          // lift, it stops immediately where they stopped (gently raised);
          // when they touch again, it drops back down and keeps following.
          const touch = lastTouchRef.current;
          if (touch) {
            if (isDrawingRef.current) {
              drawPencil(ctx, touch[0], touch[1], 0);
            } else if (covered && covered.size > 0 && phase === "trace") {
              drawPencil(ctx, touch[0], touch[1], 0.5);
            }
          }
        }

        // Pencil on top of everything while demonstrating
        if (phase === "demo-draw") {
          drawPencil(ctx, demoHandRef.current.x, demoHandRef.current.y, 0);
        } else if (phase === "demo-travel") {
          // Visibly lifted while traveling between strokes — stays fully visible
          const lift = Math.sin(demoTravelRef.current.t * Math.PI) * 0.85;
          drawPencil(ctx, demoHandRef.current.x, demoHandRef.current.y, lift, false);
        } else if (phase === "demo-hold") {
          drawPencil(ctx, demoHandRef.current.x, demoHandRef.current.y, demoLiftTRef.current);
        }
      }

      // ── Completion: trail stars glow, then fly gently outward ────────────
      if (flyStarsRef.current.length > 0) {
        for (let i = flyStarsRef.current.length - 1; i >= 0; i--) {
          const fs = flyStarsRef.current[i];
          if (fs.hold > 0) {
            // brief in-place glow before lift-off
            fs.hold -= dt;
            const glowPulse = 0.75 + 0.25 * Math.sin(time / 90 + i);
            drawMiniStar(ctx, fs.x, fs.y, fs.size * (1 + 0.25 * glowPulse), fs.rot, fs.color, 0.95);
          } else {
            fs.x += fs.vx * dt;
            fs.y += fs.vy * dt;
            fs.vy -= 0.015 * dt; // gentle upward drift
            fs.rot += fs.rotV * dt;
            fs.life -= 0.022 * dt;
            if (fs.life <= 0) {
              flyStarsRef.current.splice(i, 1);
              continue;
            }
            drawMiniStar(ctx, fs.x, fs.y, fs.size, fs.rot, fs.color, Math.max(0, fs.life));
          }
        }
      }

      // ── 5. Tiny sparkle bursts (stroke completions) ──────────────────────
      if (burstRef.current.length > 0) {
        for (let i = burstRef.current.length - 1; i >= 0; i--) {
          const p = burstRef.current[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 0.05 * dt;
          p.life -= 0.03 * dt;
          if (p.life <= 0) {
            burstRef.current.splice(i, 1);
            continue;
          }
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3.2 * p.life + 1, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);
    return () => {
      running = false;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [letter, setPhase, onFirstTurn]);

  // ── Pointer input ───────────────────────────────────────────────────────────
  const getCanvasPoint = useCallback((e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
    const canvas = canvasRef.current;
    if (!canvas) return [0, 0];
    const rect = canvas.getBoundingClientRect();
    return [
      ((e.clientX - rect.left) * CANVAS_SIZE) / rect.width,
      ((e.clientY - rect.top) * CANVAS_SIZE) / rect.height,
    ];
  }, []);

  /** SEQUENTIAL progress: the covered set is always a contiguous prefix of the
   *  stroke, advanced only when the child's finger is near the FRONTIER (the
   *  first untraced point) or a small window just past it. Being near far
   *  sections of the path does nothing — only actual movement along the path
   *  reveals the letter. Lifting pauses exactly at the frontier; touching
   *  again continues from there. Returns how many new points were covered. */
  const markCovered = useCallback(
    (canvasPt: [number, number]): number => {
      const active = activeIndexRef.current;
      const g = geomRef.current[active];
      const covered = coveredRef.current[active];
      if (!g || !covered) return 0;
      const letterPt: Point = [
        (canvasPt[0] - PADDING) / LETTER_SCALE,
        (canvasPt[1] - PADDING) / LETTER_SCALE,
      ];
      const tolerance = TOLERANCE_PX / LETTER_SCALE;
      const ages = coveredAgeRef.current[active];
      const n = g.letterPts.length;
      const frontier = covered.size; // contiguous prefix ⇒ frontier index
      if (frontier >= n) return 0;
      // The finger must actually BE at the frontier (within tolerance) to make
      // any progress — you can only continue from where you are. This is what
      // guarantees nothing ever fills in from mere proximity to later sections.
      if (distance(g.letterPts[frontier], letterPt) > tolerance) return 0;
      let gained = 0;
      // Find the furthest point within the frontier window the finger reaches
      let reach = -1;
      const limit = Math.min(n - 1, frontier + g.windowPts);
      for (let i = frontier; i <= limit; i++) {
        if (distance(g.letterPts[i], letterPt) <= tolerance) reach = i;
      }
      if (reach >= frontier) {
        // Advance the frontier up to the reached point (small skips allowed —
        // forgiving — but never beyond the window, never by proximity alone)
        for (let i = frontier; i <= reach; i++) {
          covered.add(i);
          ages?.set(i, 0);
          gained++;
        }
      }
      if (gained > 0) reportProgress();
      return gained;
    },
    [reportProgress]
  );

  /** The stroke completes only when the child has physically traced the path
   *  in order to (essentially) its end — coverage is a contiguous prefix, so
   *  this can never be triggered by proximity to disconnected sections. */
  const checkStrokeDone = useCallback(() => {
    const active = activeIndexRef.current;
    const g = geomRef.current[active];
    const covered = coveredRef.current[active];
    if (!g || !covered) return false;
    const n = g.letterPts.length;
    return covered.size >= Math.ceil(n * STROKE_THRESHOLD);
  }, []);

  const completeActiveStroke = useCallback(() => {
    const active = activeIndexRef.current;
    completedStrokesRef.current[active] = true;
    fillTRef.current[active] = 0; // start the fill-in animation
    // Tiny sparkle at the stroke's end point
    const g = geomRef.current[active];
    if (g) {
      const end = g.pts[g.pts.length - 1];
      spawnBurst(end[0], end[1]);
    }
    inkRef.current = [];
    inkFadeRef.current = 1;
    offPathCountRef.current = 0;
    reportProgress();
    onStrokeComplete?.(active, geomRef.current.length);
  }, [onStrokeComplete, reportProgress, spawnBurst]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (doneRef.current || phaseRef.current !== "trace") return;
      e.currentTarget.setPointerCapture(e.pointerId);
      const pt = getCanvasPoint(e);
      isDrawingRef.current = true;
      lastTouchRef.current = pt;
      inkRef.current = [pt];
      inkFadeRef.current = 1;
      gainedThisDragRef.current = markCovered(pt);
      pointsThisDragRef.current = 1;
    },
    [getCanvasPoint, markCovered]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current || doneRef.current) return;
      if (phaseRef.current !== "trace") return; // stroke already done — wait for lift
      const pt = getCanvasPoint(e);
      lastTouchRef.current = pt;
      inkRef.current.push(pt);
      gainedThisDragRef.current += markCovered(pt);
      pointsThisDragRef.current += 1;

      if (checkStrokeDone()) {
        // Stroke complete mid-drag — celebrate now, but the NEXT stroke only
        // activates after the child physically lifts their finger.
        completeActiveStroke();
        setPhase("await-lift");
      }
    },
    [getCanvasPoint, markCovered, checkStrokeDone, completeActiveStroke, setPhase]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDrawingRef.current || doneRef.current) return;
    isDrawingRef.current = false;

    if (phaseRef.current === "await-lift") {
      // The lift the engine was waiting for — advance to the next stroke
      advanceStroke();
      return;
    }
    if (phaseRef.current !== "trace") return;

    // Finger lifted before the stroke was complete
    if (checkStrokeDone()) {
      completeActiveStroke();
      advanceStroke();
      return;
    }

    // Off-path scribble? Lots of movement, almost no guide coverage → gentle nudge
    if (pointsThisDragRef.current > 24 && gainedThisDragRef.current < 3) {
      offPathCountRef.current += 1;
      inkFadeRef.current = 0.999; // trigger fade-out of the stray ink
      onOffPath?.();
    } else {
      // Partial honest attempt — keep their covered progress, softly fade free ink
      inkFadeRef.current = 0.999;
    }
    gainedThisDragRef.current = 0;
    pointsThisDragRef.current = 0;
  }, [advanceStroke, checkStrokeDone, completeActiveStroke, onOffPath]);

  return (
    <div className="relative inline-block" style={{ touchAction: "none" }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        style={{
          width: "var(--trace-size, 320px)",
          height: "var(--trace-size, 320px)",
          borderRadius: 28,
          cursor: cursorStage === "trace" ? "crosshair" : "default",
          display: "block",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        aria-label={
          cursorStage === "demo"
            ? `Watch the pencil write the letter ${letter.letter}, one stroke at a time`
            : `Trace the letter ${letter.letter}, stroke by stroke`
        }
      />
    </div>
  );
}
