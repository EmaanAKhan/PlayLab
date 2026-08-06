"use client";

import { motion } from "framer-motion";
import type { Module } from "@/types";

interface MainMenuScreenProps {
  onSelectModule: (module: Module) => void;
}

const MODULES = [
  {
    id: "uppercase" as Module,
    label: "ABC",
    title: "Uppercase Letters",
    subtitle: "Trace A → Z",
    bg: "#DDD5F5",
    border: "#A882E8",
    text: "#7C5CBF",
    accent: "#7C5CBF",
    emoji: "🔤",
  },
  {
    id: "lowercase" as Module,
    label: "abc",
    title: "Lowercase Letters",
    subtitle: "Trace a → z",
    bg: "#C8F0D8",
    border: "#66CC94",
    text: "#3DAA72",
    accent: "#3DAA72",
    emoji: "✏️",
  },
  {
    id: "sequencing" as Module,
    label: "A B C",
    title: "Letter Order",
    subtitle: "Sort A to Z",
    bg: "#FFD6BC",
    border: "#FFAA80",
    text: "#C06030",
    accent: "#E07040",
    emoji: "🔀",
  },
];

export function MainMenuScreen({ onSelectModule }: MainMenuScreenProps) {
  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden px-5 py-8"
      style={{ background: "linear-gradient(160deg, #E8F4FF 0%, #F0E8FF 50%, #E8FFE8 100%)" }}
    >
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

      {/* Module cards */}
      <div className="relative z-10 flex w-full max-w-sm flex-col gap-4">
        {MODULES.map((mod, i) => (
          <motion.button
            key={mod.id}
            onClick={() => onSelectModule(mod.id)}
            className="w-full rounded-3xl p-4 text-left shadow-lg active:scale-95"
            style={{
              background: mod.bg,
              border: `2.5px solid ${mod.border}`,
            }}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-inner"
                style={{ background: "white", opacity: 0.85 }}
              >
                <span className="font-rounded text-xl font-black" style={{ color: mod.text }}>
                  {mod.label}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-rounded text-base font-black" style={{ color: mod.text }}>
                  {mod.title}
                </p>
                <p className="font-rounded text-sm font-semibold" style={{ color: mod.text, opacity: 0.65 }}>
                  {mod.subtitle}
                </p>
              </div>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                style={{ color: mod.accent, opacity: 0.7 }}
              >
                <path
                  d="M9 18l6-6-6-6"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
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
