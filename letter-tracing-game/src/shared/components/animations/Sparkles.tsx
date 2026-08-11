"use client";

import { useRef, useEffect } from "react";

interface SparkleParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
  color: string;
  rotation: number;
  rotSpeed: number;
  shape: "star" | "circle" | "diamond";
}

const COLORS = ["#FFD700", "#FF9EBC", "#A882E8", "#66CC94", "#54A0FF", "#FFA94D"];

function createSparkle(x: number, y: number): SparkleParticle {
  const angle = Math.random() * Math.PI * 2;
  const speed = 1.2 + Math.random() * 2.5;
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 1.5,
    life: 1,
    maxLife: 45 + Math.floor(Math.random() * 30),
    radius: 4 + Math.random() * 6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.2,
    shape: (["star", "circle", "diamond"] as const)[Math.floor(Math.random() * 3)],
  };
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rotation: number) {
  const spikes = 4;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i * Math.PI) / spikes;
    const rad = i % 2 === 0 ? r : r * 0.45;
    ctx.lineTo(Math.cos(angle) * rad, Math.sin(angle) * rad);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rotation: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(r * 0.6, 0);
  ctx.lineTo(0, r);
  ctx.lineTo(-r * 0.6, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

interface SparklesProps {
  active: boolean;
  originX?: number;
  originY?: number;
  width: number;
  height: number;
  /** Maximum particles alive at once during tracing. Use a low number (e.g. 6) while
   *  tracing so the path stays visible; use a high number (e.g. 80) for celebrations. */
  maxParticles?: number;
  className?: string;
}

export function Sparkles({
  active,
  originX,
  originY,
  width,
  height,
  maxParticles = 80,
  className = "",
}: SparklesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<SparkleParticle[]>([]);
  const rafRef = useRef<number | null>(null);
  const burstTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.life = 1 - p.maxLife / (p.maxLife + 1);
        p.maxLife--;
        p.rotation += p.rotSpeed;

        const alpha = Math.max(0, p.maxLife / 75);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;

        if (p.shape === "star") {
          drawStar(ctx, p.x, p.y, p.radius, p.rotation);
        } else if (p.shape === "diamond") {
          drawDiamond(ctx, p.x, p.y, p.radius, p.rotation);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }

        if (p.maxLife <= 0) {
          particlesRef.current.splice(i, 1);
        }
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Emit particles while active (respects maxParticles cap)
  useEffect(() => {
    if (burstTimerRef.current !== null) {
      clearInterval(burstTimerRef.current);
      burstTimerRef.current = null;
    }

    if (!active || originX === undefined || originY === undefined) return;

    // How many particles to emit per tick depends on the cap
    const emitCount = maxParticles <= 10 ? 1 : 3;
    const intervalMs = maxParticles <= 10 ? 120 : 60;

    burstTimerRef.current = setInterval(() => {
      if (particlesRef.current.length < maxParticles) {
        for (let i = 0; i < emitCount; i++) {
          const jitter = maxParticles <= 10 ? 8 : 20;
          particlesRef.current.push(
            createSparkle(
              (originX ?? width / 2) + (Math.random() - 0.5) * jitter,
              (originY ?? height / 2) + (Math.random() - 0.5) * jitter
            )
          );
        }
      }
    }, intervalMs);

    return () => {
      if (burstTimerRef.current !== null) {
        clearInterval(burstTimerRef.current);
        burstTimerRef.current = null;
      }
    };
  }, [active, originX, originY, width, height, maxParticles]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    />
  );
}

// ─── Celebration variant (full-screen burst) ────────────────────────────────

interface CelebrationSparklesProps {
  active: boolean;
  width: number;
  height: number;
}

function createCelebrationSparkle(width: number, height: number): SparkleParticle {
  return {
    x: Math.random() * width,
    y: -10,
    vx: (Math.random() - 0.5) * 4,
    vy: 2 + Math.random() * 4,
    life: 1,
    maxLife: 90 + Math.floor(Math.random() * 60),
    radius: 5 + Math.random() * 8,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.15,
    shape: (["star", "circle", "diamond"] as const)[Math.floor(Math.random() * 3)],
  };
}

export function CelebrationSparkles({ active, width, height }: CelebrationSparklesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<SparkleParticle[]>([]);
  const rafRef = useRef<number | null>(null);
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.maxLife--;
        p.rotation += p.rotSpeed;

        const alpha = Math.max(0, Math.min(1, p.maxLife / 60));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;

        if (p.shape === "star") {
          drawStar(ctx, p.x, p.y, p.radius, p.rotation);
        } else if (p.shape === "diamond") {
          drawDiamond(ctx, p.x, p.y, p.radius, p.rotation);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 0.65, 0, Math.PI * 2);
          ctx.fill();
        }

        if (p.maxLife <= 0) particlesRef.current.splice(i, 1);
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (spawnRef.current) { clearInterval(spawnRef.current); spawnRef.current = null; }
    if (!active) return;

    // Initial burst
    for (let i = 0; i < 40; i++) {
      setTimeout(() => {
        particlesRef.current.push(createCelebrationSparkle(width, height));
      }, i * 20);
    }

    // Continuous drizzle
    spawnRef.current = setInterval(() => {
      for (let i = 0; i < 5; i++) {
        particlesRef.current.push(createCelebrationSparkle(width, height));
      }
    }, 120);

    return () => { if (spawnRef.current) clearInterval(spawnRef.current); };
  }, [active, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
