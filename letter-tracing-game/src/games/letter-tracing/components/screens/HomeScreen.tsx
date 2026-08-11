"use client";

import { motion } from "framer-motion";
import { Button } from "@shared/components/ui/Button";
import { HomeEnvironment } from "@shared/components/animations/HomeEnvironment";
import { LETTER_SYMBOLS, NUMBER_SYMBOLS } from "@games/letter-tracing/constants/symbols";
import { playClip, clipText } from "@shared/audio/voice";
import { useEffect } from "react";
import { useGameStore } from "@games/letter-tracing/store/gameStore";
import { getThemeColors } from "@games/letter-tracing/constants/rewards";

interface HomeScreenProps {
  onContinue: () => void;
  onStartFromA: () => void;
  /** The child taps any letter on the shelf to start tracing from it */
  onSelectLetter: (index: number) => void;
}

// ─── SVG nature elements ──────────────────────────────────────────────────────

function CloudSvg({ x, y, w = 60 }: { x: number; y: number; w?: number }) {
  const h = w * 0.45;
  return (
    <g transform={`translate(${x}, ${y})`} opacity="0.72">
      <ellipse cx={w * 0.5} cy={h} rx={w * 0.5} ry={h * 0.6} fill="white" />
      <circle cx={w * 0.3} cy={h * 0.65} r={h * 0.65} fill="white" />
      <circle cx={w * 0.6} cy={h * 0.55} r={h * 0.8} fill="white" />
      <circle cx={w * 0.78} cy={h * 0.75} r={h * 0.55} fill="white" />
    </g>
  );
}

function BirdSvg({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`} opacity="0.6">
      <path d="M0 0 Q4 -5 8 0" stroke="#A882E8" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M10 0 Q14 -5 18 0" stroke="#A882E8" strokeWidth="2" strokeLinecap="round" fill="none" />
    </g>
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

function FlowerSvg({ x, y, sway = false }: { x: number; y: number; sway?: boolean }) {
  const colors = ["#FF9EBC", "#FFAA80", "#A882E8", "#66CC94", "#FFD700", "#74B9FF"];
  const c = colors[Math.floor((x * 13 + y * 7) % colors.length)];
  const inner = (
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
  if (!sway) return inner;
  return (
    <motion.g
      animate={{ rotate: [-4, 4, -4] }}
      transition={{ duration: 2.8 + (x % 5) * 0.3, repeat: Infinity, ease: "easeInOut" }}
      style={{ originX: `${x}px`, originY: `${y + 18}px` }}
    >
      {inner}
    </motion.g>
  );
}

function ButterflyBody({ x, y, color, r = 0 }: { x: number; y: number; color: string; r?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${r})`}>
      <ellipse cx="-10" cy="-5" rx="11" ry="7" fill={color} opacity="0.78" transform="rotate(-25 -10 -5)" />
      <ellipse cx="10" cy="-5" rx="11" ry="7" fill={color} opacity="0.78" transform="rotate(25 10 -5)" />
      <ellipse cx="-8" cy="5" rx="7" ry="5" fill={color} opacity="0.6" transform="rotate(15 -8 5)" />
      <ellipse cx="8" cy="5" rx="7" ry="5" fill={color} opacity="0.6" transform="rotate(-15 8 5)" />
      <ellipse cx="0" cy="0" rx="2.5" ry="6" fill="#555" opacity="0.5" />
    </g>
  );
}

function BeeSvg({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Wings */}
      <ellipse cx="-5" cy="-6" rx="7" ry="4" fill="white" opacity="0.65" transform="rotate(-15 -5 -6)" />
      <ellipse cx="5" cy="-6" rx="7" ry="4" fill="white" opacity="0.65" transform="rotate(15 5 -6)" />
      {/* Body */}
      <ellipse cx="0" cy="0" rx="5" ry="7" fill="#FFD93D" opacity="0.9" />
      <rect x="-5" y="-3" width="10" height="2.5" rx="1.2" fill="#333" opacity="0.55" />
      <rect x="-5" y="1" width="10" height="2.5" rx="1.2" fill="#333" opacity="0.55" />
      {/* Eye */}
      <circle cx="3" cy="-4" r="1.2" fill="#333" opacity="0.7" />
    </g>
  );
}

function LeafSvg({ x, y, color = "#5DBE8A" }: { x: number; y: number; color?: string }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <ellipse cx="0" cy="0" rx="7" ry="12" fill={color} opacity="0.7" />
      <line x1="0" y1="-10" x2="0" y2="10" stroke="white" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
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
          y1={-10 + (i % 3)}
          x2={dx + (dx < 0 ? -3 : 3)}
          y2={-18 + (i % 3)}
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

// ─── Component ────────────────────────────────────────────────────────────────


export function HomeScreen({ onContinue, onStartFromA, onSelectLetter }: HomeScreenProps) {
  const { progress, module, lowercaseProgress, numbersProgress, practiceMode, setPracticeMode } =
    useGameStore();
  const currentProgress =
    module === "lowercase" ? lowercaseProgress : module === "numbers" ? numbersProgress : progress;
  const completedCount = currentProgress.completedLetters.length;
  const allLetters = module === "numbers" ? NUMBER_SYMBOLS : LETTER_SYMBOLS;
  const total = allLetters.length;
  const currentLetter = allLetters[currentProgress.currentLetterIndex] ?? allLetters[0];
  const [bg1, bg2] = getThemeColors(currentProgress.currentTheme);

  // Spoken prompt matches the on-screen "Pick a letter/number" label exactly
  useEffect(() => {
    const t = setTimeout(
      () => void playClip(module === "numbers" ? "instr-choose-a-number" : "instr-choose-a-letter"),
      450
    );
    return () => clearTimeout(t);
  }, [module]);

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-between gap-4 overflow-y-auto overflow-x-hidden"
      style={{ background: `linear-gradient(180deg, ${bg1} 0%, ${bg2} 60%, #C8F0D8 100%)` }}
    >
      {/* ── Animated nature background ─────────────────────────────────── */}
      <svg
        className="pointer-events-none absolute inset-0 w-full h-full"
        viewBox="0 0 420 896"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
        style={{ zIndex: 0 }}
      >
        {/* ── Clouds (4 groups, slow drift) ── */}
        <motion.g
          animate={{ x: [0, 22, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        >
          <CloudSvg x={10} y={50} w={90} />
          <CloudSvg x={295} y={30} w={65} />
        </motion.g>
        <motion.g
          animate={{ x: [0, -16, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        >
          <CloudSvg x={155} y={68} w={55} />
          <CloudSvg x={355} y={78} w={48} />
        </motion.g>
        <motion.g
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        >
          <CloudSvg x={60} y={130} w={38} />
          <CloudSvg x={340} y={120} w={42} />
        </motion.g>

        {/* ── Birds (3 groups) ── */}
        <motion.g
          animate={{ x: [0, 38, 0], y: [0, -7, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <BirdSvg x={65} y={108} />
          <BirdSvg x={85} y={98} />
        </motion.g>
        <motion.g
          animate={{ x: [0, -28, 0], y: [0, -9, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        >
          <BirdSvg x={325} y={125} />
          <BirdSvg x={345} y={115} />
        </motion.g>
        <motion.g
          animate={{ x: [0, 20, 0], y: [0, -5, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 6 }}
        >
          <BirdSvg x={190} y={155} />
        </motion.g>

        {/* ── Butterflies (5 total, varied colours) ── */}
        <motion.g
          animate={{ x: [0, 18, 0], y: [0, -12, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ButterflyBody x={52} y={670} color="#FF9EBC" />
        </motion.g>
        <motion.g
          animate={{ x: [0, -14, 0], y: [0, -9, 0] }}
          transition={{ duration: 5.1, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        >
          <ButterflyBody x={368} y={645} color="#A882E8" />
        </motion.g>
        <motion.g
          animate={{ x: [0, 10, -10, 0], y: [0, -14, -6, 0] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        >
          <ButterflyBody x={200} y={580} color="#66CC94" />
        </motion.g>
        <motion.g
          animate={{ x: [0, -12, 0], y: [0, -8, 0] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 2.2 }}
        >
          <ButterflyBody x={110} y={720} color="#FFD93D" />
        </motion.g>
        <motion.g
          animate={{ x: [0, 16, 0], y: [0, -10, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 3.4 }}
        >
          <ButterflyBody x={310} y={740} color="#74B9FF" />
        </motion.g>

        {/* ── Bees (2, figure-eight paths) ── */}
        <motion.g
          animate={{ x: [0, 20, 0, -15, 0], y: [0, -10, -18, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <BeeSvg x={150} y={790} />
        </motion.g>
        <motion.g
          animate={{ x: [0, -18, 0, 14, 0], y: [0, -8, -16, -5, 0] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
        >
          <BeeSvg x={280} y={775} />
        </motion.g>

        {/* ── Floating leaves ── */}
        <motion.g
          animate={{ x: [0, 12, 6, -6, 0], y: [0, 30, 60, 90, 120], rotate: [0, 30, 60, 90, 120], opacity: [0.7, 0.6, 0.5, 0.3, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0 }}
        >
          <LeafSvg x={80} y={400} color="#5DBE8A" />
        </motion.g>
        <motion.g
          animate={{ x: [0, -10, -4, 8, 0], y: [0, 25, 55, 85, 110], rotate: [0, -20, -40, -60, -80], opacity: [0.7, 0.6, 0.4, 0.2, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        >
          <LeafSvg x={340} y={350} color="#A8DFB8" />
        </motion.g>
        <motion.g
          animate={{ x: [0, 8, -4, -12, 0], y: [0, 20, 50, 78, 100], rotate: [0, 15, 30, 50, 65], opacity: [0.6, 0.5, 0.35, 0.2, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 5.5 }}
        >
          <LeafSvg x={200} y={440} color="#6ECF9A" />
        </motion.g>

        {/* ── Trees ── */}
        <TreeSvg x={28} y={790} scale={1.2} />
        <TreeSvg x={78} y={812} scale={0.9} />
        <TreeSvg x={370} y={786} scale={1.1} />
        <TreeSvg x={396} y={818} scale={0.8} />

        {/* ── Swaying flowers (bottom) ── */}
        <FlowerSvg x={16} y={840} sway />
        <FlowerSvg x={36} y={856} sway />
        <FlowerSvg x={56} y={845} sway />
        <FlowerSvg x={130} y={860} sway />
        <FlowerSvg x={155} y={850} sway />
        <FlowerSvg x={265} y={858} sway />
        <FlowerSvg x={290} y={848} sway />
        <FlowerSvg x={366} y={843} sway />
        <FlowerSvg x={388} y={858} sway />
        <FlowerSvg x={408} y={848} sway />

        {/* ── Hedgehog ── */}
        <motion.g
          animate={{ x: [0, 9, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <HedgehogSvg x={340} y={858} />
        </motion.g>

        {/* ── Hills ── */}
        <ellipse cx="80" cy="910" rx="140" ry="95" fill="#A8DFB8" opacity="0.45" />
        <ellipse cx="280" cy="920" rx="200" ry="105" fill="#9ED8B0" opacity="0.45" />
        <ellipse cx="420" cy="915" rx="130" ry="85" fill="#B4E2C0" opacity="0.4" />
      </svg>

      {/* ── Garden environment: birds & butterflies in the outer bands ──── */}
      <HomeEnvironment />

      {/* ── Content ──────────────────────────────────────────────────────── */}
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
            {module === "lowercase"
              ? "Lowercase Letters"
              : module === "numbers"
              ? "Numbers 1 to 10"
              : "Uppercase Letters"}
          </p>
        </motion.div>

        {/* Letter shelf — big, tappable letters; the child can start anywhere */}
        <motion.div
          className="w-full max-w-md rounded-3xl bg-white/75 p-4 shadow-lg backdrop-blur-sm md:max-w-2xl"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          {/* Practice mode — changeable any time, for every module */}
          <div className="mb-3 flex items-center justify-center">
            <div className="flex rounded-full bg-lavender/50 p-1" role="group" aria-label="Practice mode">
              {([
                { id: "free", label: "Free", icon: "✏️" },
                { id: "five-star", label: "5 Star", icon: "⭐" },
              ] as const).map((m) => {
                const selected = practiceMode === m.id;
                return (
                  <motion.button
                    key={m.id}
                    onClick={() => setPracticeMode(m.id)}
                    className="flex min-h-[38px] items-center gap-1.5 rounded-full px-4 py-1.5"
                    style={{
                      background: selected ? "white" : "transparent",
                      boxShadow: selected ? "0 2px 8px rgba(124,92,191,0.18)" : "none",
                    }}
                    whileTap={{ scale: 0.94 }}
                    aria-pressed={selected}
                    aria-label={m.id === "free" ? "Free mode — trace each letter once" : "Five star mode — practice five times"}
                  >
                    <span className="text-sm">{m.icon}</span>
                    <span
                      className="font-rounded text-sm font-black"
                      style={{ color: selected ? "#7C5CBF" : "#A594C8" }}
                    >
                      {m.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="mb-3 flex items-center justify-between">
            <span className="font-rounded text-sm font-bold text-plum/70">
              {module === "numbers" ? clipText("instr-choose-a-number") : clipText("instr-choose-a-letter")}
            </span>
            <span className="font-rounded text-sm font-bold text-plum">
              {completedCount} / {total}
            </span>
          </div>

          {/* Alphabet shelf */}
          <div
            className="grid gap-1.5 sm:gap-2"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(50px, 1fr))" }}
          >
            {allLetters.map((letter, index) => {
              const isDone = currentProgress.completedLetters.includes(letter);
              const isCurrent = letter === currentLetter && !isDone;
              const display = module === "lowercase" ? letter.toLowerCase() : letter;
              const isNumber = module === "numbers";
              return (
                <motion.button
                  key={letter}
                  onClick={() => onSelectLetter(index)}
                  className="flex aspect-square min-h-[48px] min-w-[48px] items-center justify-center rounded-xl shadow-sm"
                  style={{
                    background: isDone ? "#7C5CBF" : isCurrent ? "#DDD5F5" : "white",
                    border: isCurrent ? "2.5px solid #A882E8" : "2px solid #EDE7FA",
                  }}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.06 }}
                  aria-label={`Trace the letter ${display}`}
                >
                  <span
                    className="font-rounded font-black"
                    style={{
                      color: isDone ? "white" : "#7C5CBF",
                      fontSize: isNumber && display.length > 1 ? "clamp(15px, 2.2vw, 21px)" : "clamp(19px, 2.8vw, 26px)",
                      lineHeight: 1,
                    }}
                  >
                    {display}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-lavender">
            <motion.div
              className="h-full rounded-full bg-plum"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / total) * 100}%` }}
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
            <Button
              size="md"
              variant="secondary"
              onClick={onStartFromA}
              className="w-full"
              aria-label={module === "numbers" ? "Start over from number 1" : "Start over from letter A"}
            >
              {module === "numbers" ? "Start from 1" : "Start from A"}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
