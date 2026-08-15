"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import type { LetterDefinition, Point } from "@games/letter-tracing/types";
import { distance } from "@games/letter-tracing/utils/pathUtils";
import {
  CANVAS_SIZE,
  PADDING,
  LETTER_SCALE,
  TOLERANCE_PX,
  STROKE_THRESHOLD,
  COLOR_COMPLETED,
  COLOR_ACTIVE_GUIDE,
  COLOR_ACTIVE_GLOW,
  COLOR_FUTURE,
  COLOR_CHILD_INK,
  type TracingPhase,
} from "./constants";
import { buildGeometry, type StrokeGeom } from "./geometry";
import {
  drawBase,
  strokePath2D,
  drawPolyline,
  drawArrows,
  drawStartDot,
  drawMiniStar,
  drawPencil,
  TRAIL_COLORS,
} from "./draw";

export type { TracingPhase } from "./constants";

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
  }, [letter, setPhase, onFirstTurn, primeDemoStroke]);

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
    <div className="relative inline-block touch-none">
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className={`trace-canvas ${cursorStage === "trace" ? "trace-canvas--tracing" : "trace-canvas--idle"}`}
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
