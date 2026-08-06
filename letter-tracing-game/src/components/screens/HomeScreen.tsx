"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useGameStore } from "@/stores/gameStore";
import { getThemeColors } from "@/constants/rewards";

interface HomeScreenProps {
  onContinue: () => void;
  onStartFromA: () => void;
}

// Soft nature SVG decorations
function Hills() {
  return (
    <svg
      viewBox="0 0 420 140"
      fill="none"
      className="absolute bottom-0 left-0 w-full"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    >
      <ellipse cx="70" cy="155" rx="130" ry="90" fill="#C8F0D8" opacity="0.55" />
      <ellipse cx="260" cy="170" rx="180" ry="100" fill="#B8EAC8" opacity="0.55" />
      <ellipse cx="400" cy="160" rx="120" ry="80" fill="#D4F0DC" opacity="0.5" />
    </svg>
  );
}

function TreeSvg({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <rect x="-5" y="28" width="10" height="22" rx="3" fill="#A0785A" opacity="0.7" />
      <ellipse cx="0" cy="18" rx="18" ry="20" fill="#5DBE8A" opacity="0.8" />
      <ellipse cx="-6" cy="22" rx="12" ry="14" fill="#6ECF9A" opacity="0.6" />
      <ellipse cx="7" cy="20" rx="11" ry="13" fill="#4CAF78" opacity="0.6" />
    </g>
  );
}

function FlowerSvg({ x, y }: { x: number; y: number }) {
  const colors = ["#FF9EBC", "#FFAA80", "#A882E8", "#66CC94", "#FFD700"];
  const c = colors[Math.floor((x * 13 + y * 7) % colors.length)];
  return (
    <g transform={`translate(${x}, ${y})`}>
      <line x1="0" y1="0" x2="0" y2="18" stroke="#5DBE8A" strokeWidth="2.5" strokeLinecap="round" />
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <ellipse
          key={i}
          cx={Math.cos((deg * Math.PI) / 180) * 7}
          cy={Math.sin((deg * Math.PI) / 180) * 7}
          rx="5"
          ry="3.5"
          fill={c}
          opacity="0.85"
          transform={`rotate(${deg}, ${Math.cos((deg * Math.PI) / 180) * 7}, ${Math.sin((deg * Math.PI) / 180) * 7})`}
        />
      ))}
      <circle cx="0" cy="0" r="4.5" fill="#FECA57" />
    </g>
  );
}

function CloudSvg({ x, y, w = 60 }: { x: number; y: number; w?: number }) {
  const h = w * 0.45;
  return (
    <g transform={`translate(${x}, ${y})`} opacity="0.7">
      <ellipse cx={w * 0.5} cy={h} rx={w * 0.5} ry={h * 0.6} fill="white" />
      <circle cx={w * 0.3} cy={h * 0.65} r={h * 0.65} fill="white" />
      <circle cx={w * 0.6} cy={h * 0.55} r={h * 0.8} fill="white" />
      <circle cx={w * 0.78} cy={h * 0.75} r={h * 0.55} fill="white" />
    </g>
  );
}

function BirdSvg({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`} opacity="0.65">
      <path d="M0 0 Q4 -5 8 0" stroke="#A882E8" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M10 0 Q14 -5 18 0" stroke="#A882E8" strokeWidth="2" strokeLinecap="round" fill="none" />
    </g>
  );
}

function ButterflyBody({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <ellipse cx="-10" cy="-5" rx="11" ry="7" fill={color} opacity="0.75" transform="rotate(-25 -10 -5)" />
      <ellipse cx="10" cy="-5" rx="11" ry="7" fill={color} opacity="0.75" transform="rotate(25 10 -5)" />
      <ellipse cx="-8" cy="5" rx="7" ry="5" fill={color} opacity="0.6" transform="rotate(15 -8 5)" />
      <ellipse cx="8" cy="5" rx="7" ry="5" fill={color} opacity="0.6" transform="rotate(-15 8 5)" />
      <ellipse cx="0" cy="0" rx="2.5" ry="6" fill="#555" opacity="0.5" />
    </g>
  );
}

function HedgehogSvg({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <ellipse cx="0" cy="0" rx="22" ry="14" fill="#D4A574" opacity="0.85" />
      <ellipse cx="-4" cy="-2" rx="18" ry="12" fill="#C49060" opacity="0.7" />
      {[-12, -6, 0, 6, 12, -9, -3, 3, 9].map((dx, i) => (
        <line
          key={i}
          x1={dx}
          y1={-10 + (i % 3) * 1}
          x2={dx + (dx < 0 ? -3 : 3)}
          y2={-18 + (i % 3) * 1}
          stroke="#8B6040"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.7"
        />
      ))}
      <circle cx="12" cy="-2" r="5" fill="#E8C090" opacity="0.9" />
      <circle cx="14" cy="-3" r="2" fill="#333" opacity="0.8" />
      <circle cx="14.8" cy="-3.5" r="0.8" fill="white" />
      <ellipse cx="16" cy="2" rx="4" ry="2.5" fill="#E8A090" opacity="0.7" />
    </g>
  );
}

export function HomeScreen({ onContinue, onStartFromA }: HomeScreenProps) {
  const { progress, module, lowercaseProgress } = useGameStore();
  const currentProgress = module === "lowercase" ? lowercaseProgress : progress;
  const completedCount = currentProgress.completedLetters.length;
  const currentLetter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[currentProgress.currentLetterIndex] ?? "A";
  const [bg1, bg2] = getThemeColors(currentProgress.currentTheme);

  const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${bg1} 0%, ${bg2} 60%, #C8F0D8 100%)` }}
    >
      {/* Animated nature background */}
      <svg
        className="pointer-events-none absolute inset-0 w-full h-full"
        viewBox="0 0 420 896"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        style={{ zIndex: 0 }}
      >
        {/* Clouds */}
        <motion.g
          animate={{ x: [0, 18, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        >
          <CloudSvg x={20} y={55} w={80} />
          <CloudSvg x={300} y={35} w={60} />
        </motion.g>
        <motion.g
          animate={{ x: [0, -14, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        >
          <CloudSvg x={160} y={70} w={50} />
          <CloudSvg x={360} y={80} w={45} />
        </motion.g>

        {/* Birds */}
        <motion.g
          animate={{ x: [0, 30, 0], y: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <BirdSvg x={70} y={110} />
          <BirdSvg x={90} y={100} />
        </motion.g>
        <motion.g
          animate={{ x: [0, -20, 0], y: [0, -8, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        >
          <BirdSvg x={330} y={130} />
        </motion.g>

        {/* Trees — left side */}
        <TreeSvg x={30} y={790} scale={1.2} />
        <TreeSvg x={80} y={810} scale={0.9} />

        {/* Trees — right side */}
        <TreeSvg x={370} y={785} scale={1.1} />
        <TreeSvg x={395} y={815} scale={0.8} />

        {/* Flowers — bottom corners */}
        <FlowerSvg x={18} y={840} />
        <FlowerSvg x={40} y={855} />
        <FlowerSvg x={55} y={845} />
        <FlowerSvg x={370} y={842} />
        <FlowerSvg x={390} y={858} />
        <FlowerSvg x={405} y={848} />

        {/* Hedgehog */}
        <motion.g
          animate={{ x: [0, 8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <HedgehogSvg x={345} y={858} />
        </motion.g>

        {/* Butterflies */}
        <motion.g
          animate={{ x: [0, 15, 0], y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <ButterflyBody x={55} y={680} color="#FF9EBC" />
        </motion.g>
        <motion.g
          animate={{ x: [0, -12, 0], y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        >
          <ButterflyBody x={370} y={650} color="#A882E8" />
        </motion.g>

        {/* Hills */}
        <ellipse cx="80" cy="910" rx="140" ry="95" fill="#A8DFB8" opacity="0.45" />
        <ellipse cx="280" cy="920" rx="200" ry="105" fill="#9ED8B0" opacity="0.45" />
        <ellipse cx="420" cy="915" rx="130" ry="85" fill="#B4E2C0" opacity="0.4" />
      </svg>

      {/* Content */}
      <div className="relative z-10 flex w-full flex-col items-center px-6 pt-10">
        {/* Logo */}
        <motion.div
          className="mb-5 flex flex-col items-center gap-2"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-end gap-2">
            {["A", "B", "C"].map((l, i) => (
              <motion.div
                key={l}
                className="flex items-center justify-center rounded-2xl shadow-lg"
                style={{
                  width: 46 + i * 4,
                  height: 46 + i * 4,
                  background: ["#DDD5F5", "#C8F0D8", "#FFD6BC"][i],
                  border: `2.5px solid ${["#A882E8", "#66CC94", "#FFAA80"][i]}`,
                }}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.5, delay: i * 0.35, repeat: Infinity, ease: "easeInOut" }}
              >
                <span
                  className="font-rounded font-black"
                  style={{ fontSize: 22 + i * 2, color: ["#7C5CBF", "#3DAA72", "#C06030"][i] }}
                >
                  {l}
                </span>
              </motion.div>
            ))}
          </div>
          <h1 className="font-rounded text-2xl font-black text-plum">Letter Tracing</h1>
          <p className="font-rounded text-sm font-semibold text-plum/50">
            {module === "lowercase" ? "Lowercase Letters" : "Uppercase Letters"}
          </p>
        </motion.div>

        {/* Progress card */}
        <motion.div
          className="w-full max-w-sm rounded-3xl bg-white/75 p-4 shadow-lg backdrop-blur-sm"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="font-rounded text-sm font-bold text-plum/70">Your progress</span>
            <span className="font-rounded text-sm font-bold text-plum">
              {completedCount} / 26
            </span>
          </div>

          {/* Letter grid */}
          <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(13, 1fr)" }}>
            {allLetters.map((letter) => {
              const isDone = currentProgress.completedLetters.includes(letter);
              const isCurrent = letter === currentLetter && !isDone;
              return (
                <div
                  key={letter}
                  className="flex aspect-square items-center justify-center rounded-lg"
                  style={{
                    background: isDone ? "#7C5CBF" : isCurrent ? "#DDD5F5" : "transparent",
                    border: isCurrent ? "2px solid #A882E8" : "none",
                  }}
                >
                  <span
                    className="font-rounded font-black"
                    style={{
                      color: isDone ? "white" : isCurrent ? "#7C5CBF" : "#C4B5F5",
                      fontSize: "clamp(9px, 2vw, 11px)",
                    }}
                  >
                    {letter}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-lavender">
            <motion.div
              className="h-full rounded-full bg-plum"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / 26) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      </div>

      {/* Buttons */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-3 px-6 pb-10">
        <motion.div
          className="w-full"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <Button size="xl" onClick={onContinue} className="w-full" aria-label="Continue where you left off">
            {completedCount === 0 ? "Start Learning" : "Continue"}
          </Button>
        </motion.div>

        {completedCount > 0 && (
          <motion.div
            className="w-full"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            <Button size="md" variant="secondary" onClick={onStartFromA} className="w-full" aria-label="Start over from letter A">
              Start from A
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
