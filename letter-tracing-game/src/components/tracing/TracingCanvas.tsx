"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import type { LetterDefinition } from "@/types";
import { closestPointOnPath, scalePoint, distance } from "@/utils/pathUtils";
import { Sparkles } from "@/components/animations/Sparkles";

interface TracingCanvasProps {
  letter: LetterDefinition;
  /** Called when the child successfully traces the whole letter */
  onComplete: () => void;
  /** Coverage 0–1, called during tracing so parent can show a progress bar */
  onProgress?: (coverage: number) => void;
  /** Parent plays a wiggle animation when this fires */
  onOffPath?: () => void;
}

const CANVAS_SIZE = 320;
const PADDING = 20;
/** Tolerance in canvas pixels — how far from the path the child's finger can be */
const TOLERANCE_PX = 58;
/** Fraction of expected-path points that must be covered to accept the letter */
const COMPLETION_THRESHOLD = 0.72;
/** Scale factor: letter-space (0-200) → canvas-space */
const LETTER_SCALE = (CANVAS_SIZE - PADDING * 2) / 200;

// ─── Flatten all strokes into one list of expected points (letter-space) ─────
function buildExpectedPoints(letter: LetterDefinition): [number, number][] {
  const pts: [number, number][] = [];
  for (const stroke of letter.strokes) {
    for (const p of stroke.points) {
      pts.push(p);
    }
  }
  return pts;
}

// ─── Canvas draw helpers ──────────────────────────────────────────────────────

function drawGuides(
  ctx: CanvasRenderingContext2D,
  letter: LetterDefinition,
  coverage: number
) {
  const scale = LETTER_SCALE;
  ctx.save();
  ctx.translate(PADDING, PADDING);
  ctx.scale(scale, scale);

  for (const stroke of letter.strokes) {
    const path = new Path2D(stroke.pathData);
    // Filled guide fades from dashed-lavender toward solid-plum as coverage grows
    ctx.setLineDash([10 / scale, 7 / scale]);
    ctx.strokeStyle = coverage > 0.4 ? "#9B7DD4" : "#A882E8";
    ctx.lineWidth = 16 / scale;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = 0.38 + coverage * 0.15;
    ctx.stroke(path);
    ctx.setLineDash([]);
  }
  ctx.restore();
}

function drawUserInk(
  ctx: CanvasRenderingContext2D,
  strokes: [number, number][][]
) {
  ctx.save();
  ctx.strokeStyle = "#7C5CBF";
  ctx.lineWidth = 15;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = 0.88;
  for (const stroke of strokes) {
    if (stroke.length < 2) continue;
    ctx.beginPath();
    ctx.moveTo(stroke[0][0], stroke[0][1]);
    for (let i = 1; i < stroke.length; i++) {
      ctx.lineTo(stroke[i][0], stroke[i][1]);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawStartDot(
  ctx: CanvasRenderingContext2D,
  letter: LetterDefinition,
  pulse: number
) {
  if (letter.strokes.length === 0) return;
  const firstPoint = letter.strokes[0].points[0];
  if (!firstPoint) return;
  const [cx, cy] = scalePoint(firstPoint, CANVAS_SIZE, PADDING);
  ctx.save();
  // Outer pulse ring
  ctx.beginPath();
  ctx.arc(cx, cy, 20 + pulse * 6, 0, Math.PI * 2);
  ctx.fillStyle = "#A882E8";
  ctx.globalAlpha = 0.15 + pulse * 0.08;
  ctx.fill();
  // Inner dot
  ctx.beginPath();
  ctx.arc(cx, cy, 13, 0, Math.PI * 2);
  ctx.fillStyle = "#7C5CBF";
  ctx.globalAlpha = 0.9;
  ctx.fill();
  // White centre
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.globalAlpha = 1;
  ctx.fill();
  ctx.restore();
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TracingCanvas({
  letter,
  onComplete,
  onProgress,
  onOffPath,
}: TracingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // All expected path points (letter-space)
  const expectedRef = useRef<[number, number][]>([]);
  // Which expected-point indices have been "covered" by the user's ink
  const coveredRef = useRef<Set<number>>(new Set());
  // User's drawn ink — array of strokes, each stroke is an array of canvas-space points
  const inkStrokesRef = useRef<[number, number][][]>([]);
  // Current active stroke
  const currentStrokeRef = useRef<[number, number][]>([]);

  const isDrawingRef = useRef(false);
  const pulseRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const completedRef = useRef(false); // prevent double-fire

  const [sparklePos, setSparklePos] = useState<{ x: number; y: number } | null>(null);
  const [coverage, setCoverage] = useState(0);

  // Rebuild expected points when letter changes, reset everything
  useEffect(() => {
    expectedRef.current = buildExpectedPoints(letter);
    coveredRef.current = new Set();
    inkStrokesRef.current = [];
    currentStrokeRef.current = [];
    completedRef.current = false;
    setCoverage(0);
    onProgress?.(0);
  }, [letter, onProgress]);

  // Render loop
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
      pulseRef.current = (pulseRef.current + 0.03 * dt) % (Math.PI * 2);
      const pulse = (Math.sin(pulseRef.current) + 1) / 2;

      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      const cov = coveredRef.current.size / Math.max(1, expectedRef.current.length);
      drawGuides(ctx, letter, cov);

      // Combine finished strokes + current active stroke for drawing
      const allStrokes = [...inkStrokesRef.current];
      if (currentStrokeRef.current.length > 1) {
        allStrokes.push(currentStrokeRef.current);
      }
      drawUserInk(ctx, allStrokes);

      // Only show start dot until the child has started drawing
      if (inkStrokesRef.current.length === 0 && currentStrokeRef.current.length === 0) {
        drawStartDot(ctx, letter, pulse);
      }

      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);
    return () => {
      running = false;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [letter]);

  // Convert pointer event to canvas-space coordinates
  const getCanvasPoint = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>): [number, number] => {
      const canvas = canvasRef.current;
      if (!canvas) return [0, 0];
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_SIZE / rect.width;
      const scaleY = CANVAS_SIZE / rect.height;
      return [(e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY];
    },
    []
  );

  // Convert canvas-space point to letter-space (0-200)
  const canvasToLetter = useCallback((pt: [number, number]): [number, number] => {
    return [
      (pt[0] - PADDING) / LETTER_SCALE,
      (pt[1] - PADDING) / LETTER_SCALE,
    ];
  }, []);

  // Mark expected points near a letter-space point as covered
  const markCovered = useCallback((letterPt: [number, number]) => {
    const tolerance = TOLERANCE_PX / LETTER_SCALE;
    const expected = expectedRef.current;
    let changed = false;
    for (let i = 0; i < expected.length; i++) {
      if (coveredRef.current.has(i)) continue;
      const d = distance(expected[i], letterPt);
      if (d <= tolerance) {
        coveredRef.current.add(i);
        changed = true;
      }
    }
    if (changed) {
      const cov = coveredRef.current.size / Math.max(1, expected.length);
      setCoverage(cov);
      onProgress?.(cov);
    }
  }, [onProgress]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (completedRef.current) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      const pt = getCanvasPoint(e);
      isDrawingRef.current = true;
      currentStrokeRef.current = [pt];
      markCovered(canvasToLetter(pt));
      setSparklePos({ x: pt[0], y: pt[1] });
    },
    [getCanvasPoint, canvasToLetter, markCovered]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current || completedRef.current) return;
      const pt = getCanvasPoint(e);
      currentStrokeRef.current.push(pt);
      markCovered(canvasToLetter(pt));
      setSparklePos({ x: pt[0], y: pt[1] });
    },
    [getCanvasPoint, canvasToLetter, markCovered]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDrawingRef.current || completedRef.current) return;
    isDrawingRef.current = false;
    setSparklePos(null);

    // Commit the current stroke to finished ink
    if (currentStrokeRef.current.length > 1) {
      inkStrokesRef.current = [...inkStrokesRef.current, currentStrokeRef.current];
    }
    currentStrokeRef.current = [];

    const cov = coveredRef.current.size / Math.max(1, expectedRef.current.length);

    if (cov >= COMPLETION_THRESHOLD) {
      // 🎉 Letter complete!
      completedRef.current = true;
      onComplete();
    } else if (cov > 0.12 && inkStrokesRef.current.length >= 1) {
      // Child has drawn something meaningful but hasn't covered enough yet.
      // Give a gentle nudge — fire onOffPath so parent can wiggle. Clear ink and try again.
      // Only trigger after at least one full stroke is committed.
      onOffPath?.();
      // Clear ink after a brief delay (let wiggle play first)
      setTimeout(() => {
        inkStrokesRef.current = [];
        currentStrokeRef.current = [];
        coveredRef.current = new Set();
        setCoverage(0);
        onProgress?.(0);
      }, 420);
    }
    // If very little drawn (<12%), just silently let them continue — no penalty
  }, [onComplete, onOffPath, onProgress]);

  return (
    <div className="relative inline-block" style={{ touchAction: "none" }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        style={{
          width: "min(320px, 90vw)",
          height: "min(320px, 90vw)",
          borderRadius: 24,
          cursor: "crosshair",
          display: "block",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        aria-label={`Trace the letter ${letter.letter}`}
      />

      {/* Sparkles — reduced during tracing */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ borderRadius: 24, overflow: "hidden" }}
      >
        <Sparkles
          active={!!sparklePos}
          originX={sparklePos?.x}
          originY={sparklePos?.y}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          maxParticles={6}
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </div>
  );
}
