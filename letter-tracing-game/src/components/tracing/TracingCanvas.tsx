"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { LetterDefinition, StrokeState } from "@/types";
import { closestPointOnPath, scalePoint, distance } from "@/utils/pathUtils";
import { Sparkles } from "@/components/animations/Sparkles";

interface TracingCanvasProps {
  letter: LetterDefinition;
  strokeStates: StrokeState[];
  currentStrokeIndex: number;
  onStrokeProgress: (strokeIndex: number, progress: number) => void;
  onStrokeComplete: (strokeIndex: number) => void;
  /** Called when the child moves too far off the path — parent handles wiggle + reset */
  onOffPath?: () => void;
}

const CANVAS_SIZE = 320;
const TOLERANCE = 55;           // px — wider for natural feel
const ADVANCE_TOLERANCE = 40;   // must be within this to advance along path
const COMPLETION_THRESHOLD = 0.88;
// How many frames of continuous off-path movement before we trigger a reset
const OFF_PATH_FRAMES_LIMIT = 18;

function drawGuide(
  ctx: CanvasRenderingContext2D,
  pathData: string,
  canvasSize: number,
  padding: number,
  isActive: boolean,
  isCompleted: boolean
) {
  const scale = (canvasSize - padding * 2) / 200;
  ctx.save();
  ctx.translate(padding, padding);
  ctx.scale(scale, scale);

  const path = new Path2D(pathData);

  if (isCompleted) {
    ctx.strokeStyle = "#7C5CBF";
    ctx.lineWidth = 14 / scale;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = 0.35;
    ctx.stroke(path);
  } else if (isActive) {
    ctx.setLineDash([10 / scale, 8 / scale]);
    ctx.strokeStyle = "#A882E8";
    ctx.lineWidth = 14 / scale;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = 0.5;
    ctx.stroke(path);
    ctx.setLineDash([]);
  } else {
    ctx.strokeStyle = "#C4B5F5";
    ctx.lineWidth = 12 / scale;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = 0.2;
    ctx.stroke(path);
  }

  ctx.restore();
}

function drawUserTrace(
  ctx: CanvasRenderingContext2D,
  tracePoints: [number, number][]
) {
  if (tracePoints.length < 2) return;
  ctx.save();
  ctx.strokeStyle = "#7C5CBF";
  ctx.lineWidth = 14;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.moveTo(tracePoints[0][0], tracePoints[0][1]);
  for (let i = 1; i < tracePoints.length; i++) {
    ctx.lineTo(tracePoints[i][0], tracePoints[i][1]);
  }
  ctx.stroke();
  ctx.restore();
}

function drawStartDot(
  ctx: CanvasRenderingContext2D,
  point: [number, number],
  canvasSize: number,
  padding: number,
  pulse: number
) {
  const scaled = scalePoint(point, canvasSize, padding);
  ctx.save();
  ctx.beginPath();
  ctx.arc(scaled[0], scaled[1], 18 + pulse * 6, 0, Math.PI * 2);
  ctx.fillStyle = "#A882E8";
  ctx.globalAlpha = 0.2 + pulse * 0.1;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(scaled[0], scaled[1], 13, 0, Math.PI * 2);
  ctx.fillStyle = "#7C5CBF";
  ctx.globalAlpha = 0.9;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(scaled[0], scaled[1], 7, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.globalAlpha = 1;
  ctx.fill();
  ctx.restore();
}

function drawNumberBadge(
  ctx: CanvasRenderingContext2D,
  point: [number, number],
  num: number,
  canvasSize: number,
  padding: number
) {
  const scaled = scalePoint(point, canvasSize, padding);
  ctx.save();
  ctx.beginPath();
  ctx.arc(scaled[0] - 18, scaled[1] - 18, 12, 0, Math.PI * 2);
  ctx.fillStyle = "#FF9EBC";
  ctx.globalAlpha = 0.95;
  ctx.fill();
  ctx.font = "bold 13px Arial Rounded MT Bold, sans-serif";
  ctx.fillStyle = "white";
  ctx.globalAlpha = 1;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(num), scaled[0] - 18, scaled[1] - 18);
  ctx.restore();
}

export function TracingCanvas({
  letter,
  strokeStates,
  currentStrokeIndex,
  onStrokeProgress,
  onStrokeComplete,
  onOffPath,
}: TracingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const tracePointsRef = useRef<[number, number][]>([]);
  const furthestPointRef = useRef(0);
  const offPathFramesRef = useRef(0);
  const pulseRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [sparklePos, setSparklePos] = useState<{ x: number; y: number } | null>(null);
  const padding = 20;

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

      // Draw all stroke guides
      for (let i = 0; i < letter.strokes.length; i++) {
        const stroke = letter.strokes[i];
        const state = strokeStates[i];
        const isActive = i === currentStrokeIndex;
        const isCompleted = state?.completed ?? false;
        drawGuide(ctx, stroke.pathData, CANVAS_SIZE, padding, isActive, isCompleted);
      }

      // Draw user trace for current stroke
      drawUserTrace(ctx, tracePointsRef.current);

      // Draw start dot for current stroke
      if (currentStrokeIndex < letter.strokes.length) {
        const currentStroke = letter.strokes[currentStrokeIndex];
        const state = strokeStates[currentStrokeIndex];
        if (!state?.completed && currentStroke.points.length > 0) {
          drawStartDot(ctx, currentStroke.points[0], CANVAS_SIZE, padding, pulse);
        }
      }

      // Draw number badges for upcoming strokes
      for (let i = currentStrokeIndex + 1; i < letter.strokes.length; i++) {
        const stroke = letter.strokes[i];
        if (stroke.points.length > 0) {
          drawNumberBadge(ctx, stroke.points[0], i + 1, CANVAS_SIZE, padding);
        }
      }

      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);
    return () => {
      running = false;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [letter, strokeStates, currentStrokeIndex]);

  // Reset trace points when stroke changes
  useEffect(() => {
    tracePointsRef.current = [];
    furthestPointRef.current = 0;
    offPathFramesRef.current = 0;
  }, [currentStrokeIndex]);

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

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      const currentStroke = letter.strokes[currentStrokeIndex];
      if (!currentStroke) return;

      const pt = getCanvasPoint(e);
      const startPt = scalePoint(currentStroke.points[0], CANVAS_SIZE, padding);
      if (distance(pt, startPt) > TOLERANCE * 1.8) return;

      isDrawingRef.current = true;
      tracePointsRef.current = [pt];
      furthestPointRef.current = 0;
      offPathFramesRef.current = 0;
      setSparklePos({ x: pt[0], y: pt[1] });
    },
    [letter.strokes, currentStrokeIndex, getCanvasPoint]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) return;
      const currentStroke = letter.strokes[currentStrokeIndex];
      if (!currentStroke) return;

      const pt = getCanvasPoint(e);
      tracePointsRef.current.push(pt);

      const { index, dist } = closestPointOnPath(currentStroke.points, [
        (pt[0] - padding) / ((CANVAS_SIZE - padding * 2) / 200),
        (pt[1] - padding) / ((CANVAS_SIZE - padding * 2) / 200),
      ]);

      if (dist > TOLERANCE / ((CANVAS_SIZE - padding * 2) / 200)) {
        // Off-path
        offPathFramesRef.current++;
        setSparklePos(null);

        if (offPathFramesRef.current >= OFF_PATH_FRAMES_LIMIT) {
          // Too far off for too long — trigger wiggle + reset
          isDrawingRef.current = false;
          tracePointsRef.current = [];
          furthestPointRef.current = 0;
          offPathFramesRef.current = 0;
          onOffPath?.();
        }
        return;
      }

      offPathFramesRef.current = 0;
      setSparklePos({ x: pt[0], y: pt[1] });

      // Only advance forward along the path
      if (index > furthestPointRef.current + 2) {
        const distInLetterSpace = dist;
        if (distInLetterSpace <= ADVANCE_TOLERANCE / ((CANVAS_SIZE - padding * 2) / 200)) {
          furthestPointRef.current = index;
          const progress = index / (currentStroke.points.length - 1);
          onStrokeProgress(currentStrokeIndex, progress);

          if (progress >= COMPLETION_THRESHOLD) {
            isDrawingRef.current = false;
            tracePointsRef.current = [];
            furthestPointRef.current = 0;
            offPathFramesRef.current = 0;
            setSparklePos(null);
            onStrokeComplete(currentStrokeIndex);
          }
        }
      }
    },
    [letter.strokes, currentStrokeIndex, getCanvasPoint, onStrokeProgress, onStrokeComplete, onOffPath]
  );

  const handlePointerUp = useCallback(() => {
    isDrawingRef.current = false;
    setSparklePos(null);
  }, []);

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
        aria-label={`Tracing canvas for letter ${letter.letter}`}
      />

      {/* Sparkle overlay — reduced particles during tracing (maxParticles=6) */}
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
