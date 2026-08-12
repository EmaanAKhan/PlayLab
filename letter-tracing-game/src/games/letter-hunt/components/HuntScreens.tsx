"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useHuntStore } from "@games/letter-hunt/store/huntStore";
import { PencilPal } from "@games/letter-hunt/components/PennyArt";
import { HomeEnvironment } from "@shared/components/animations/HomeEnvironment";
import { Button } from "@shared/components/ui/Button";
import { playClickSound } from "@shared/audio/sfx";
import { playClip } from "@shared/audio/voice";

export const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const BG = { background: "linear-gradient(160deg, #F0E8FF 0%, #E8F4FF 100%)" };

/** Short splash — Penny + drifting letters, auto-advances (tap to skip). */
export function HuntSplash() {
  const setScreen = useHuntStore((s) => s.setScreen);
  useEffect(() => {
    const t = setTimeout(() => setScreen("home"), 2100);
    return () => clearTimeout(t);
  }, [setScreen]);

  return (
    <button
      className="relative flex h-full w-full flex-col items-center justify-center gap-4 overflow-hidden"
      style={BG}
      onClick={() => setScreen("home")}
      aria-label="Letter Hunt — tap to start"
    >
      <HomeEnvironment />
      {/* drifting alphabet letters */}
      {[
        { l: "A", x: "18%", y: "20%", c: "#A882E8", d: 0 },
        { l: "b", x: "76%", y: "16%", c: "#FF8FA3", d: 0.4 },
        { l: "C", x: "12%", y: "66%", c: "#66CC94", d: 0.8 },
        { l: "d", x: "82%", y: "62%", c: "#74B9FF", d: 1.2 },
      ].map((f) => (
        <motion.span
          key={f.l}
          className="pointer-events-none absolute font-rounded font-black"
          style={{ left: f.x, top: f.y, color: f.c, fontSize: "clamp(30px, 6vmin, 52px)" }}
          animate={{ y: [0, -12, 0], rotate: [-5, 5, -5] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: f.d }}
          aria-hidden="true"
        >
          {f.l}
        </motion.span>
      ))}
      <motion.div
        style={{ width: "clamp(90px, 20vmin, 150px)" }}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 16 }}
      >
        <PencilPal />
      </motion.div>
      <motion.h1
        className="relative z-10 font-rounded text-4xl font-black text-plum md:text-5xl"
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        Letter Hunt
      </motion.h1>
    </button>
  );
}

/** Home — title, Penny, Continue/Start buttons, the letter list right here
 *  (no separate "choose a letter" page to navigate to). */
export function HuntHome({ onExitPortal }: { onExitPortal?: () => void }) {
  const { currentIndex, completed, setIndex, setScreen } = useHuntStore();

  const startFromA = () => {
    playClickSound();
    setIndex(0);
    setScreen("level");
  };
  const pick = (i: number) => {
    playClickSound();
    setIndex(i);
    setScreen("level");
  };

  return (
    <div
      className="relative flex h-full w-full flex-col items-center gap-4 overflow-y-auto overflow-x-hidden px-6 py-8"
      style={{ background: "linear-gradient(180deg, #C8F0D8 0%, #E8F8EF 60%, #C8F0D8 100%)" }}
    >
      <HomeEnvironment />

      {onExitPortal && (
        <button
          onClick={() => { playClickSound(); onExitPortal(); }}
          className="absolute left-4 top-4 z-20 flex min-h-[44px] items-center gap-1.5 rounded-full bg-white/75 px-3.5 py-2 shadow-soft"
          aria-label="Back to the game portal"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#7C5CBF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-rounded text-xs font-bold text-plum/80">Back to Games</span>
        </button>
      )}

      <div className="relative z-10 mt-6 flex flex-col items-center gap-1">
        <h1 className="font-rounded text-3xl font-black text-plum md:text-4xl">Letter Hunt</h1>
        <p className="font-rounded text-sm font-semibold text-plum/50">
          Find the matching letters!
        </p>
      </div>

      <motion.div
        className="relative z-10"
        style={{ width: "clamp(64px, 12vmin, 96px)" }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <PencilPal />
      </motion.div>

      {/* Narrower, side-by-side buttons — not stretched to the panel width */}
      <div className="relative z-10 flex items-center gap-3">
        <Button
          size="md"
          onClick={() => { playClickSound(); setScreen("level"); }}
          aria-label={`Continue hunting from the letter ${LETTERS[currentIndex]}`}
        >
          Continue · {LETTERS[currentIndex]}
        </Button>
        <Button
          size="md"
          variant="secondary"
          onClick={startFromA}
          aria-label="Start hunting from the letter A"
        >
          Start from A
        </Button>
      </div>

      {/* soft progress */}
      <div className="relative z-10 w-full max-w-xs">
        <div className="h-3 w-full overflow-hidden rounded-full bg-white/70">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #A882E8, #74B9FF)" }}
            initial={false}
            animate={{ width: `${(completed.length / 26) * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        <p className="mt-1 text-center font-rounded text-xs font-bold text-plum/55">
          {completed.length} / 26 letters found
        </p>
      </div>

      {/* The letter list, right on this page — no separate screen to visit */}
      <motion.div
        className="relative z-10 w-full max-w-md rounded-3xl bg-white/75 p-4 shadow-lg backdrop-blur-sm md:max-w-2xl"
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.35 }}
      >
        <div className="mb-3 text-center">
          <span className="font-rounded text-sm font-bold text-plum/70">
            Or pick any letter
          </span>
        </div>
        <div
          className="grid gap-1.5 sm:gap-2"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(50px, 1fr))" }}
        >
          {LETTERS.map((l, i) => {
            const isDone = completed.includes(l);
            return (
              <motion.button
                key={l}
                onClick={() => pick(i)}
                className="flex aspect-square min-h-[48px] min-w-[48px] items-center justify-center rounded-xl shadow-sm"
                style={{
                  background: isDone ? "#7C5CBF" : "white",
                  border: isDone ? "2.5px solid #7C5CBF" : "2px solid #EDE7FA",
                }}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.06 }}
                aria-label={`Hunt the letter ${l}${isDone ? " (already found)" : ""}`}
              >
                <span
                  className="font-rounded font-black"
                  style={{ color: isDone ? "white" : "#7C5CBF", fontSize: "clamp(16px, 3.2vmin, 22px)" }}
                >
                  {l}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
