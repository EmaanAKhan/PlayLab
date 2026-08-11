"use client";

import React from "react";
import { motion } from "framer-motion";

type StickerIcon =
  | "flower" | "butterfly" | "tree" | "rainbow" | "bird" | "leaf"
  | "sun" | "cloud" | "star" | "heart" | "moon" | "apple"
  | "balloon" | "cake" | "diamond" | "egg" | "fish" | "gift"
  | "hat" | "ice-cream" | "jar" | "kite" | "ladybug" | "mushroom"
  | "nest" | "owl" | string;

function FlowerSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none">
      {[0,60,120,180,240,300].map((deg, i) => (
        <ellipse key={i} cx={50 + 20*Math.cos(deg*Math.PI/180)} cy={50 + 20*Math.sin(deg*Math.PI/180)} rx="11" ry="16" fill={color} transform={`rotate(${deg} ${50 + 20*Math.cos(deg*Math.PI/180)} ${50 + 20*Math.sin(deg*Math.PI/180)})`} />
      ))}
      <circle cx="50" cy="50" r="15" fill="#FFF176" />
      <circle cx="50" cy="50" r="8" fill="#FFD600" />
    </svg>
  );
}

function ButterflySvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none">
      <ellipse cx="28" cy="38" rx="22" ry="28" fill={color} opacity="0.9" transform="rotate(-20 28 38)" />
      <ellipse cx="72" cy="38" rx="22" ry="28" fill={color} opacity="0.9" transform="rotate(20 72 38)" />
      <ellipse cx="30" cy="68" rx="14" ry="18" fill={color} opacity="0.7" transform="rotate(15 30 68)" />
      <ellipse cx="70" cy="68" rx="14" ry="18" fill={color} opacity="0.7" transform="rotate(-15 70 68)" />
      <ellipse cx="50" cy="50" rx="5" ry="28" fill="#5D4037" />
      <circle cx="50" cy="22" r="5" fill="#5D4037" />
      <line x1="50" y1="22" x2="38" y2="10" stroke="#5D4037" strokeWidth="2" strokeLinecap="round"/>
      <line x1="50" y1="22" x2="62" y2="10" stroke="#5D4037" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function TreeSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none">
      <polygon points="50,8 18,55 82,55" fill={color} />
      <polygon points="50,28 15,72 85,72" fill={color} opacity="0.85" />
      <rect x="40" y="70" width="20" height="22" rx="3" fill="#A1887F" />
    </svg>
  );
}

function RainbowSvg() {
  return (
    <svg viewBox="0 0 100 70" fill="none">
      {[
        ["#FF5252", 50], ["#FF9800", 44], ["#FFEB3B", 38],
        ["#4CAF50", 32], ["#2196F3", 26], ["#9C27B0", 20]
      ].map(([c, r], i) => (
        <path key={i} d={`M 10 65 A ${r} ${r} 0 0 1 90 65`} stroke={c as string} strokeWidth="6" fill="none" strokeLinecap="round" />
      ))}
    </svg>
  );
}

function BirdSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none">
      <ellipse cx="42" cy="52" rx="22" ry="16" fill={color} />
      <circle cx="68" cy="44" r="14" fill={color} />
      <circle cx="74" cy="40" r="4" fill="white" />
      <circle cx="76" cy="40" r="2" fill="#222" />
      <path d="M 80 44 L 92 42 L 80 48 Z" fill="#FFA000" />
      <path d="M 40 52 C 20 40 10 56 18 62 C 26 52 36 54 40 52 Z" fill={color} opacity="0.8" />
      <path d="M 44 56 C 44 70 32 78 30 72 C 36 70 40 62 44 56 Z" fill={color} opacity="0.75" />
    </svg>
  );
}

function LeafSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none">
      <path d="M 50 90 C 50 90 10 60 14 30 C 18 10 50 8 50 8 C 50 8 82 10 86 30 C 90 60 50 90 50 90 Z" fill={color} />
      <path d="M 50 90 L 50 20" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M 50 55 L 28 38" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M 50 55 L 72 38" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function StarSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none">
      <polygon points="50,8 61,35 90,35 67,54 76,82 50,64 24,82 33,54 10,35 39,35" fill={color} />
      <polygon points="50,20 58,38 78,38 63,50 68,68 50,57 32,68 37,50 22,38 42,38" fill="white" opacity="0.25" />
    </svg>
  );
}

function HeartSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none">
      <path d="M 50 82 C 50 82 12 58 12 34 C 12 20 22 12 34 14 C 42 15 48 20 50 26 C 52 20 58 15 66 14 C 78 12 88 20 88 34 C 88 58 50 82 50 82 Z" fill={color} />
      <ellipse cx="36" cy="30" rx="8" ry="6" fill="white" opacity="0.3" transform="rotate(-30 36 30)" />
    </svg>
  );
}

function SunSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none">
      {[0,45,90,135,180,225,270,315].map((deg, i) => (
        <line key={i} x1={50 + 28*Math.cos(deg*Math.PI/180)} y1={50 + 28*Math.sin(deg*Math.PI/180)} x2={50 + 40*Math.cos(deg*Math.PI/180)} y2={50 + 40*Math.sin(deg*Math.PI/180)} stroke={color} strokeWidth="4" strokeLinecap="round" />
      ))}
      <circle cx="50" cy="50" r="22" fill={color} />
      <circle cx="50" cy="50" r="14" fill="#FFF176" opacity="0.5" />
    </svg>
  );
}

function GenericStickerSvg({ color, letter }: { color: string; letter: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="44" fill={color} opacity="0.9" />
      <circle cx="50" cy="50" r="36" fill="white" opacity="0.2" />
      <text x="50" y="64" textAnchor="middle" fontSize="38" fontWeight="bold" fill="white" fontFamily="Arial Rounded MT Bold, sans-serif">{letter}</text>
    </svg>
  );
}

const STICKER_COMPONENTS: Record<string, (color: string) => React.ReactNode> = {
  flower:     (c) => <FlowerSvg color={c} />,
  butterfly:  (c) => <ButterflySvg color={c} />,
  tree:       (c) => <TreeSvg color={c} />,
  rainbow:    ()  => <RainbowSvg />,
  bird:       (c) => <BirdSvg color={c} />,
  leaf:       (c) => <LeafSvg color={c} />,
  sun:        (c) => <SunSvg color={c} />,
  star:       (c) => <StarSvg color={c} />,
  heart:      (c) => <HeartSvg color={c} />,
};

interface StickerDisplayProps {
  icon: StickerIcon;
  color: string;
  size?: number;
  animate?: boolean;
  className?: string;
}

export function StickerDisplay({ icon, color, size = 80, animate = false, className = "" }: StickerDisplayProps) {
  const renderer = STICKER_COMPONENTS[icon];
  const content = renderer ? renderer(color) : <GenericStickerSvg color={color} letter={icon[0]?.toUpperCase() ?? "?"} />;

  return (
    <motion.div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      initial={animate ? { scale: 0, rotate: -20 } : false}
      animate={animate ? { scale: 1, rotate: 0 } : undefined}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
    >
      <div style={{ width: size, height: size }} className="drop-shadow-md">
        {content}
      </div>
    </motion.div>
  );
}
