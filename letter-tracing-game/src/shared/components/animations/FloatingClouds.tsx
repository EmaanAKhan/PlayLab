"use client";

import { motion } from "framer-motion";
import { cssVars } from "@shared/styles/cssVars";

interface Cloud {
  id: number;
  x: number;
  y: number;
  scale: number;
  duration: number;
  delay: number;
  opacity: number;
}

const CLOUDS: Cloud[] = [
  { id: 1, x: 5,  y: 8,  scale: 1.0, duration: 22, delay: 0,    opacity: 0.55 },
  { id: 2, x: 65, y: 6,  scale: 0.7, duration: 28, delay: -8,   opacity: 0.40 },
  { id: 3, x: 30, y: 18, scale: 0.85,duration: 24, delay: -4,   opacity: 0.45 },
  { id: 4, x: 80, y: 14, scale: 1.1, duration: 32, delay: -12,  opacity: 0.35 },
  { id: 5, x: 50, y: 4,  scale: 0.6, duration: 20, delay: -6,   opacity: 0.30 },
];

function CloudShape({ opacity, scale }: { opacity: number; scale: number }) {
  return (
    <svg
      width={120 * scale}
      height={52 * scale}
      viewBox="0 0 120 52"
      fill="none"
    >
      <ellipse cx="60" cy="38" rx="52" ry="14" fill="white" opacity={opacity} />
      <ellipse cx="42" cy="28" rx="26" ry="18" fill="white" opacity={opacity} />
      <ellipse cx="72" cy="24" rx="22" ry="20" fill="white" opacity={opacity} />
      <ellipse cx="90" cy="32" rx="18" ry="14" fill="white" opacity={opacity} />
    </svg>
  );
}

export function FloatingClouds() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {CLOUDS.map((cloud) => (
        <motion.div
          key={cloud.id}
          className="pl-at absolute"
          style={cssVars({ "--pl-x": `${cloud.x}%`, "--pl-y": `${cloud.y}%` })}
          animate={{ y: [0, -10, 0], x: [0, 6, 0] }}
          transition={{
            duration: cloud.duration,
            delay: cloud.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <CloudShape opacity={cloud.opacity} scale={cloud.scale} />
        </motion.div>
      ))}
    </div>
  );
}
