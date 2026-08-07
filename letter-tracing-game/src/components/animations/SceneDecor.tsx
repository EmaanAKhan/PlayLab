"use client";

import { motion } from "framer-motion";

/**
 * Purely decorative, percentage-positioned pastel scenery.
 * Responsive by construction (no fixed viewBox), never intercepts touch/pointer
 * input, and keeps its motion extremely subtle so it never distracts from
 * gameplay — ideal for autism-friendly, low-stimulation screens.
 */

function Cloud({ w = 70 }: { w?: number }) {
  const h = w * 0.42;
  return (
    <svg width={w} height={h} viewBox="0 0 100 42" fill="none">
      <ellipse cx="50" cy="30" rx="46" ry="12" fill="white" />
      <circle cx="30" cy="20" r="16" fill="white" />
      <circle cx="55" cy="15" r="19" fill="white" />
      <circle cx="76" cy="22" r="14" fill="white" />
    </svg>
  );
}

function Star({ w = 18, color = "#FFD93D" }: { w?: number; color?: string }) {
  return (
    <svg width={w} height={w} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 1.5l2.9 6.8 7.4.6-5.6 4.9 1.7 7.2L12 17.1l-6.4 3.9 1.7-7.2-5.6-4.9 7.4-.6L12 1.5z"
        fill={color}
      />
    </svg>
  );
}

function Leaf({ w = 20, color = "#5DBE8A" }: { w?: number; color?: string }) {
  return (
    <svg width={w} height={w * 1.4} viewBox="0 0 20 28" fill="none">
      <ellipse cx="10" cy="14" rx="9" ry="14" fill={color} />
      <line x1="10" y1="2" x2="10" y2="26" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
    </svg>
  );
}

function Rainbow({ w = 110 }: { w?: number }) {
  const h = w * 0.55;
  const colors = ["#FF9EBC", "#FFD6BC", "#FFF0B3", "#C8F0D8", "#D4EEFF", "#DDD5F5"];
  return (
    <svg width={w} height={h} viewBox="0 0 110 60" fill="none">
      {colors.map((c, i) => (
        <path
          key={c}
          d={`M ${5 + i * 1.5} 60 A ${50 - i * 8} ${50 - i * 8} 0 0 1 ${105 - i * 1.5} 60`}
          stroke={c}
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

function Sun({ w = 46 }: { w?: number }) {
  return (
    <svg width={w} height={w} viewBox="0 0 46 46" fill="none">
      <circle cx="23" cy="23" r="13" fill="#FFD93D" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * Math.PI) / 4;
        const x1 = 23 + Math.cos(a) * 17;
        const y1 = 23 + Math.sin(a) * 17;
        const x2 = 23 + Math.cos(a) * 22;
        const y2 = 23 + Math.sin(a) * 22;
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FFD93D" strokeWidth="3" strokeLinecap="round" />
        );
      })}
    </svg>
  );
}

function Butterfly({ w = 26, color = "#FF9EBC" }: { w?: number; color?: string }) {
  return (
    <svg width={w} height={w * 0.8} viewBox="0 0 30 24" fill="none">
      <ellipse cx="9" cy="8" rx="8" ry="6" fill={color} opacity="0.82" transform="rotate(-22 9 8)" />
      <ellipse cx="21" cy="8" rx="8" ry="6" fill={color} opacity="0.82" transform="rotate(22 21 8)" />
      <ellipse cx="10" cy="16" rx="5.5" ry="4" fill={color} opacity="0.6" transform="rotate(14 10 16)" />
      <ellipse cx="20" cy="16" rx="5.5" ry="4" fill={color} opacity="0.6" transform="rotate(-14 20 16)" />
      <ellipse cx="15" cy="12" rx="2" ry="6" fill="#6B5B7B" opacity="0.55" />
      <path d="M14 6 Q12 2 10 1 M16 6 Q18 2 20 1" stroke="#6B5B7B" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function Bird({ w = 34, color = "#74B9FF" }: { w?: number; color?: string }) {
  return (
    <svg width={w} height={w * 0.78} viewBox="0 0 34 26" fill="none">
      {/* body */}
      <ellipse cx="16" cy="15" rx="10" ry="7.5" fill={color} opacity="0.85" />
      {/* wing */}
      <ellipse cx="13" cy="12" rx="6" ry="4" fill="white" opacity="0.55" transform="rotate(-18 13 12)" />
      {/* head */}
      <circle cx="26" cy="10" r="5.5" fill={color} opacity="0.9" />
      {/* eye */}
      <circle cx="28" cy="9" r="1.2" fill="#3D3D5C" />
      {/* beak */}
      <path d="M31 10 L34.5 11.2 L31 12.6 Z" fill="#F4A73E" />
      {/* tail */}
      <path d="M6 13 L0 9 L2 15 L0 19 Z" fill={color} opacity="0.7" />
      {/* belly */}
      <ellipse cx="17" cy="18" rx="6" ry="4" fill="white" opacity="0.4" />
    </svg>
  );
}

interface DecorItem {
  el: React.ReactNode;
  x: string;
  y: string;
  driftX?: number;
  driftY?: number;
  duration: number;
  delay?: number;
}

const ITEMS: DecorItem[] = [
  { el: <Cloud w={104} />, x: "4%", y: "5%", driftX: 16, duration: 16 },
  { el: <Cloud w={72} />, x: "78%", y: "3%", driftX: -12, duration: 20, delay: 1 },
  { el: <Star w={22} color="#FFD93D" />, x: "12%", y: "24%", driftY: 7, duration: 5 },
  { el: <Star w={17} color="#A882E8" />, x: "90%", y: "20%", driftY: 9, duration: 6, delay: 0.6 },
  { el: <Leaf w={26} color="#A8DFB8" />, x: "3%", y: "78%", driftY: -9, duration: 7, delay: 0.4 },
  { el: <Leaf w={28} color="#6ECF9A" />, x: "92%", y: "82%", driftY: -7, duration: 8, delay: 1.2 },
  { el: <Sun w={60} />, x: "86%", y: "9%", driftY: 5, duration: 9, delay: 0.2 },
  // Butterflies drift gently in the outer margins, never over the board
  { el: <Butterfly w={42} color="#FF9EBC" />, x: "4%", y: "40%", driftX: 14, driftY: -12, duration: 6.5, delay: 0.8 },
  { el: <Butterfly w={34} color="#A882E8" />, x: "92%", y: "46%", driftX: -12, driftY: -9, duration: 7.5, delay: 2 },
  { el: <Butterfly w={38} color="#74B9FF" />, x: "6%", y: "62%", driftX: 12, driftY: -14, duration: 8.2, delay: 3.1 },
  { el: <Butterfly w={30} color="#FFD93D" />, x: "89%", y: "66%", driftX: -10, driftY: -11, duration: 6.8, delay: 1.5 },
  // Birds glide across the upper margins
  { el: <Bird w={40} color="#74B9FF" />, x: "16%", y: "12%", driftX: 22, driftY: -6, duration: 9, delay: 0.5 },
  { el: <Bird w={32} color="#FF9EBC" />, x: "68%", y: "16%", driftX: -18, driftY: -5, duration: 11, delay: 2.4 },
];

export function SceneDecor({
  variant = "default",
  className = "",
}: {
  variant?: "default" | "minimal";
  className?: string;
}) {
  const items = variant === "minimal" ? ITEMS.slice(0, 4) : ITEMS;
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {items.map((item, i) => (
        <motion.div
          key={i}
          className="absolute opacity-60"
          style={{ left: item.x, top: item.y }}
          animate={{
            x: item.driftX ? [0, item.driftX, 0] : 0,
            y: item.driftY ? [0, item.driftY, 0] : [0, -6, 0],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay ?? 0,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {item.el}
        </motion.div>
      ))}
      {/* Corner rainbow, purely for warmth — very low opacity so it never competes with content */}
      <div className="absolute -bottom-2 -left-4 opacity-30 md:opacity-40">
        <Rainbow w={150} />
      </div>
    </div>
  );
}
