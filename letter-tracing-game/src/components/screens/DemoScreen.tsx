"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useAudio } from "@/hooks/useAudio";
import type { LetterDefinition } from "@/types";
import { scalePoint } from "@/utils/pathUtils";

const CANVAS_SIZE = 320;
const PADDING = 24;
const DEMO_SPEED = 2.2;

interface DemoScreenProps {
  letter: LetterDefinition;
  onDone: () => void;
  onHome: () => void;
}

export function DemoScreen({ letter, onDone, onHome }: DemoScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { sayWatchMe, sayNowYourTurn } = useAudio();
  const [demoFinished, setDemoFinished] = useState(false);
  const [canReplay, setCanReplay] = useState(false);
  const rafRef = useRef<number | null>(null);

  const runDemo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setDemoFinished(false);
    setCanReplay(false);

    const allPoints: { x: number; y: number; strokeEnd: boolean }[] = [];
    letter.strokes.forEach((stroke, strokeIndex) => {
      stroke.points.forEach((p, i) => {
        const scaled = scalePoint(p, CANVAS_SIZE, PADDING);
        allPoints.push({
          x: scaled[0],
          y: scaled[1],
          strokeEnd:
            i === stroke.points.length - 1 &&
            strokeIndex < letter.strokes.length - 1,
        });
      });
    });

    let pointIndex = 0;
    let t = 0;

    const drawnStrokes: { x: number; y: number }[][] = letter.strokes.map(() => []);
    let currentStroke = 0;
    let handX = allPoints[0]?.x ?? CANVAS_SIZE / 2;
    let handY = allPoints[0]?.y ?? CANVAS_SIZE / 2;

    function drawFrame() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      ctx.fillStyle = "#F8F4FF";
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(0, 0, CANVAS_SIZE, CANVAS_SIZE, 24);
      } else {
        ctx.rect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      }
      ctx.fill();

      const scale = (CANVAS_SIZE - PADDING * 2) / 200;
      letter.strokes.forEach((stroke) => {
        ctx.save();
        ctx.translate(PADDING, PADDING);
        ctx.scale(scale, scale);
        const path = new Path2D(stroke.pathData);
        ctx.setLineDash([10 / scale, 8 / scale]);
        ctx.strokeStyle = "#C4B5F5";
        ctx.lineWidth = 14 / scale;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalAlpha = 0.35;
        ctx.stroke(path);
        ctx.setLineDash([]);
        ctx.restore();
      });

      drawnStrokes.forEach((pts) => {
        if (pts.length < 2) return;
        ctx.save();
        ctx.strokeStyle = "#7C5CBF";
        ctx.lineWidth = 14;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        pts.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.stroke();
        ctx.restore();
      });

      // Hand cursor
      ctx.save();
      const grad = ctx.createRadialGradient(handX, handY, 0, handX, handY, 20);
      grad.addColorStop(0, "rgba(168,130,232,0.55)");
      grad.addColorStop(1, "rgba(168,130,232,0)");
      ctx.beginPath();
      ctx.arc(handX, handY, 20, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(handX, handY, 11, 0, Math.PI * 2);
      ctx.fillStyle = "#FFD6BC";
      ctx.globalAlpha = 0.9;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(handX, handY, 11, 0, Math.PI * 2);
      ctx.strokeStyle = "#E07040";
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5;
      ctx.stroke();
      ctx.restore();
    }

    function animate() {
      if (pointIndex >= allPoints.length - 1) {
        drawFrame();
        setDemoFinished(true);
        setCanReplay(true);
        sayNowYourTurn();
        return;
      }

      const from = allPoints[pointIndex];
      const to = allPoints[pointIndex + 1];
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const segLen = Math.sqrt(dx * dx + dy * dy) || 1;

      t += DEMO_SPEED / segLen;

      if (t >= 1) {
        // Snap to next point
        if (from.strokeEnd) {
          currentStroke++;
          t = 0;
        } else {
          drawnStrokes[currentStroke]?.push({ x: to.x, y: to.y });
        }
        pointIndex++;
        t = 0;
        handX = to.x;
        handY = to.y;
      } else {
        handX = from.x + dx * t;
        handY = from.y + dy * t;
        drawnStrokes[currentStroke]?.push({ x: handX, y: handY });
      }

      drawFrame();
      rafRef.current = requestAnimationFrame(animate);
    }

    setTimeout(() => {
      rafRef.current = requestAnimationFrame(animate);
    }, 400);
  }, [letter, sayNowYourTurn]);

  useEffect(() => {
    sayWatchMe();
    const t = setTimeout(runDemo, 600);
    return () => {
      clearTimeout(t);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [runDemo, sayWatchMe]);

  const handleDone = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    sayNowYourTurn();
    onDone();
  }, [onDone, sayNowYourTurn]);

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden px-5 py-6"
      style={{ background: "linear-gradient(160deg, #F0E8FF 0%, #E8F4FF 100%)" }}
    >
      {/* Header */}
      <motion.div
        className="w-full max-w-sm"
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          {/* Home button */}
          <motion.button
            onClick={onHome}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/70 shadow-soft"
            whileTap={{ scale: 0.93 }}
            whileHover={{ scale: 1.06 }}
            aria-label="Go back to main menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21V15C9 14.4477 9.44772 14 10 14H14C14.5523 14 15 14.4477 15 15V21M9 21H15"
                stroke="#7C5CBF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>
          <div>
            <span className="font-rounded text-sm font-bold text-plum/60">Watch me trace</span>
            <h2 className="font-rounded text-3xl font-black text-plum leading-none">
              {letter.letter}
            </h2>
          </div>
        </div>
      </motion.div>

      {/* Demo canvas */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          style={{
            width: "min(320px, 90vw)",
            height: "min(320px, 90vw)",
            borderRadius: 24,
            boxShadow: "0 8px 32px rgba(124,92,191,0.14)",
            display: "block",
          }}
          aria-label={`Demonstration of tracing letter ${letter.letter}`}
        />
      </motion.div>

      {/* Bottom controls */}
      <div className="w-full max-w-sm space-y-3">
        {demoFinished && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Button size="xl" onClick={handleDone} className="w-full" aria-label="Start your turn tracing">
              Now it is my turn!
            </Button>
          </motion.div>
        )}
        {canReplay && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Button
              size="md"
              variant="secondary"
              onClick={() => {
                if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
                setTimeout(runDemo, 50);
              }}
              className="w-full"
              aria-label="Watch the demonstration again"
            >
              Watch again
            </Button>
          </motion.div>
        )}
        {!demoFinished && (
          <motion.p
            className="text-center font-rounded text-sm font-semibold text-plum/50"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            Watch carefully...
          </motion.p>
        )}
      </div>
    </div>
  );
}
