"use client";

import { motion } from "framer-motion";
import { HomeEnvironment } from "@shared/components/animations/HomeEnvironment";
import type { Module } from "@games/letter-tracing/types";

interface MainMenuScreenProps {
  onSelectModule: (module: Module) => void;
  /** Optional: shown as a small back pill returning to the game portal */
  onExitPortal?: () => void;
}

/** The cards communicate their purpose visually — big glyphs, minimal text */
const MODULES = [
  {
    id: "uppercase" as Module,
    glyph: "ABC",
    aria: "Uppercase letter tracing",
    bg: "#DDD5F5",
    border: "#A882E8",
    text: "#7C5CBF",
  },
  {
    id: "lowercase" as Module,
    glyph: "abc",
    aria: "Lowercase letter tracing",
    bg: "#C8F0D8",
    border: "#66CC94",
    text: "#3DAA72",
  },
  {
    id: "numbers" as Module,
    glyph: "123",
    aria: "Number tracing, one to ten",
    bg: "#D4EEFF",
    border: "#74B9FF",
    text: "#2980B9",
  },
  {
    id: "sequencing" as Module,
    glyph: "A → B → C",
    aria: "Letter order game — drag letters into place",
    bg: "#FFD6BC",
    border: "#FFAA80",
    text: "#C06030",
  },
];

export function MainMenuScreen({ onSelectModule, onExitPortal }: MainMenuScreenProps) {
  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-between gap-4 overflow-y-auto overflow-x-hidden px-5 py-6"
      style={{ background: "linear-gradient(160deg, #E8F4FF 0%, #F0E8FF 50%, #E8FFE8 100%)" }}
    >
      {/* Garden environment: birds & butterflies in the outer bands */}
      <HomeEnvironment />

      {/* Back to the game portal */}
      {onExitPortal && (
        <motion.button
          onClick={onExitPortal}
          className="absolute left-4 top-4 z-20 flex min-h-[44px] items-center gap-1.5 rounded-full bg-white/75 px-3.5 py-2 shadow-soft"
          whileTap={{ scale: 0.93 }}
          whileHover={{ scale: 1.05 }}
          aria-label="Back to the game portal"
          initial={{ x: -14, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#7C5CBF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-rounded text-xs font-bold text-plum/80">Games</span>
        </motion.button>
      )}

      {/* Floating background dots */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {[
          { size: 60, x: "8%", y: "12%", color: "#DDD5F5", delay: 0 },
          { size: 40, x: "85%", y: "8%", color: "#C8F0D8", delay: 0.5 },
          { size: 50, x: "92%", y: "55%", color: "#FFD6BC", delay: 1 },
          { size: 35, x: "5%", y: "70%", color: "#DDD5F5", delay: 1.5 },
          { size: 45, x: "75%", y: "85%", color: "#C8F0D8", delay: 0.8 },
          { size: 30, x: "40%", y: "6%", color: "#FFD6BC", delay: 0.3 },
        ].map((dot, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: dot.size,
              height: dot.size,
              left: dot.x,
              top: dot.y,
              background: dot.color,
              opacity: 0.5,
            }}
            animate={{ y: [0, -12, 0], opacity: [0.4, 0.65, 0.4] }}
            transition={{
              duration: 4 + i * 0.6,
              delay: dot.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Logo */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-2"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Custom logo */}
        <div className="flex items-end gap-2">
          {["A", "B", "C"].map((letter, i) => (
            <motion.div
              key={letter}
              className="flex items-center justify-center rounded-2xl shadow-lg"
              style={{
                width: 52 + i * 4,
                height: 52 + i * 4,
                background: ["#DDD5F5", "#C8F0D8", "#FFD6BC"][i],
                border: `3px solid ${["#A882E8", "#66CC94", "#FFAA80"][i]}`,
              }}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2.5, delay: i * 0.3, repeat: Infinity, ease: "easeInOut" }}
            >
              <span
                className="font-rounded font-black"
                style={{ fontSize: 28 + i * 2, color: ["#7C5CBF", "#3DAA72", "#C06030"][i] }}
              >
                {letter}
              </span>
            </motion.div>
          ))}
        </div>
        <div className="text-center">
          <h1 className="font-rounded text-2xl font-black text-plum tracking-tight">
            Letter Tracing
          </h1>
          <p className="font-rounded text-sm font-semibold text-plum/50">
            Choose what to learn today
          </p>
        </div>
      </motion.div>

      {/* Module cards — four big visual tiles, no text-heavy labels */}
      <div className="relative z-10 grid w-full max-w-md grid-cols-2 gap-4 md:max-w-lg md:gap-5">
        {MODULES.map((mod, i) => (
          <motion.button
            key={mod.id}
            onClick={() => onSelectModule(mod.id)}
            className="flex items-center justify-center rounded-4xl shadow-lg"
            style={{
              background: mod.bg,
              border: `3px solid ${mod.border}`,
              minHeight: "clamp(96px, 16vh, 150px)",
            }}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.04 }}
            aria-label={mod.aria}
          >
            <span
              className="font-rounded font-black leading-none"
              style={{
                color: mod.text,
                fontSize: mod.glyph.length > 4 ? "clamp(20px, 4.2vw, 30px)" : "clamp(30px, 6vw, 44px)",
                whiteSpace: "nowrap",
              }}
            >
              {mod.glyph}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Bottom hint */}
      <motion.p
        className="relative z-10 font-rounded text-xs font-semibold text-plum/35"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        Tap a mode to begin
      </motion.p>
    </div>
  );
}
