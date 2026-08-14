"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useJungleStore } from "@games/jungle-spy/store/jungleStore";
import { JUNGLE_ANIMALS } from "@games/jungle-spy/constants/animals";
import {
  Monkey, Frog, Lion, Elephant, Giraffe, Zebra, Penguin, Koala, Turtle,
} from "@shared/components/illustrations/AnimalArt";
import { playClip } from "@shared/audio/voice";
import { playClickSound } from "@shared/audio/sfx";
import { StartOptions } from "@shared/components/ui/StartOptions";

/** Soft jungle backdrop: layered pastel leaves and vines in the margins.
 *  Decorative only — pointer-events none, calm slow sway. */
export function JungleBackdrop() {
  const leaves = [
    { x: "-3%", y: "-4%", r: -30, w: "clamp(90px, 15vw, 190px)", c: "#8FD6A8", d: 9 },
    { x: "82%", y: "-6%", r: 140, w: "clamp(80px, 13vw, 170px)", c: "#A8E3BC", d: 11 },
    { x: "-5%", y: "72%", r: 40, w: "clamp(84px, 14vw, 180px)", c: "#A8E3BC", d: 10 },
    { x: "84%", y: "70%", r: -140, w: "clamp(90px, 15vw, 190px)", c: "#8FD6A8", d: 12 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {leaves.map((l, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 100 100"
          className="absolute"
          style={{ left: l.x, top: l.y, width: l.w, rotate: `${l.r}deg` }}
          animate={{ rotate: [l.r, l.r + 3, l.r] }}
          transition={{ duration: l.d, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d="M50 96 Q10 70 14 30 Q16 6 50 4 Q84 6 86 30 Q90 70 50 96 Z" fill={l.c} opacity="0.5" />
          <path d="M50 90 L50 12 M50 34 Q34 40 26 32 M50 34 Q66 40 74 32 M50 58 Q32 64 24 54 M50 58 Q68 64 76 54" stroke="#5FAE7E" strokeWidth="2.4" fill="none" opacity="0.45" strokeLinecap="round" />
        </motion.svg>
      ))}
      {/* hanging vine */}
      <motion.svg
        viewBox="0 0 40 160"
        className="absolute"
        style={{ left: "30%", top: "-2%", width: "clamp(20px, 3vw, 36px)" }}
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M20 0 Q10 40 24 80 Q34 112 18 156" stroke="#5FAE7E" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.5" />
        <ellipse cx="12" cy="52" rx="9" ry="5" fill="#8FD6A8" opacity="0.6" transform="rotate(-30 12 52)" />
        <ellipse cx="30" cy="104" rx="9" ry="5" fill="#8FD6A8" opacity="0.6" transform="rotate(28 30 104)" />
      </motion.svg>
    </div>
  );
}

/** Splash: title + pick a case (ABC / abc) */
export function JungleSplash({ onExitPortal }: { onExitPortal?: () => void }) {
  const { setCase, setScreen } = useJungleStore();
  const pick = (c: "upper" | "lower") => {
    playClickSound();
    setCase(c);
    setScreen("grid");
  };
  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center gap-8 overflow-y-auto overflow-x-hidden px-6 py-8"
      style={{ background: "linear-gradient(165deg, #E8F8EE 0%, #FFF6D6 100%)" }}
    >
      <JungleBackdrop />

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

      {/* Jungle sun */}
      <motion.svg
        viewBox="0 0 60 60"
        className="pointer-events-none absolute right-[6%] top-[5%] z-0"
        style={{ width: "clamp(48px, 8vw, 90px)" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        aria-hidden="true"
      >
        <circle cx="30" cy="30" r="14" fill="#FFD93D" />
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <line key={i}
              x1={30 + Math.cos(a) * 19} y1={30 + Math.sin(a) * 19}
              x2={30 + Math.cos(a) * 26} y2={30 + Math.sin(a) * 26}
              stroke="#FFD93D" strokeWidth="4" strokeLinecap="round" />
          );
        })}
      </motion.svg>

      {/* Fluttering butterflies */}
      {[
        { x: "10%", y: "18%", w: "clamp(26px, 4.5vw, 46px)", c: "#FF9EBC", d: 7 },
        { x: "84%", y: "40%", w: "clamp(22px, 4vw, 40px)", c: "#C9A9F5", d: 8.5 },
      ].map((b, i) => (
        <motion.svg key={i} viewBox="0 0 40 30"
          className="pointer-events-none absolute z-0"
          style={{ left: b.x, top: b.y, width: b.w }}
          animate={{ y: [0, -12, 0], x: [0, i ? -10 : 10, 0], rotate: [-4, 4, -4] }}
          transition={{ duration: b.d, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        >
          <ellipse cx="13" cy="12" rx="10" ry="8" fill={b.c} opacity="0.85" />
          <ellipse cx="27" cy="12" rx="10" ry="8" fill={b.c} opacity="0.85" />
          <ellipse cx="14" cy="22" rx="7" ry="5" fill={b.c} opacity="0.6" />
          <ellipse cx="26" cy="22" rx="7" ry="5" fill={b.c} opacity="0.6" />
          <ellipse cx="20" cy="15" rx="2.4" ry="9" fill="#6B5B7B" />
        </motion.svg>
      ))}

      <motion.div
        className="relative z-10 flex flex-col items-center gap-2"
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-end gap-2">
          <div style={{ width: "clamp(52px, 9vmin, 84px)" }}><Monkey /></div>
          <div style={{ width: "clamp(40px, 7vmin, 64px)" }}><Frog /></div>
        </div>
        <h1 className="text-center font-rounded text-4xl font-black text-plum md:text-5xl">
          Jungle ABC Spy
        </h1>
        <p className="font-rounded text-sm font-semibold text-plum/55 md:text-base">
          Spy the hiding letters!
        </p>
      </motion.div>

      <div className="relative z-10 flex gap-5">
        {(
          [
            { c: "upper" as const, label: "ABC", aria: "Play with big letters" },
            { c: "lower" as const, label: "abc", aria: "Play with small letters" },
          ]
        ).map((b, i) => (
          <motion.button
            key={b.c}
            onClick={() => pick(b.c)}
            className="flex items-center justify-center rounded-4xl shadow-lg"
            style={{
              background: i === 0 ? "#C8F0D8" : "#FFF0B3",
              border: `3px solid ${i === 0 ? "#66CC94" : "#F2C94C"}`,
              width: "clamp(110px, 20vmin, 160px)",
              height: "clamp(90px, 16vmin, 130px)",
            }}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.08 }}
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.05 }}
            aria-label={b.aria}
          >
            <span
              className="font-rounded font-black"
              style={{ color: i === 0 ? "#3DAA72" : "#C08A2D", fontSize: "clamp(30px, 6vmin, 44px)" }}
            >
              {b.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* The whole gang waits at the bottom, gently bobbing */}
      <div className="pointer-events-none relative z-10 flex w-full max-w-3xl items-end justify-center gap-1 px-2 sm:gap-3" aria-hidden="true">
        {[
          { A: Lion, w: "clamp(44px, 8vmin, 76px)", d: 0 },
          { A: Giraffe, w: "clamp(52px, 9.5vmin, 88px)", d: 0.3 },
          { A: Elephant, w: "clamp(50px, 9vmin, 84px)", d: 0.6 },
          { A: Zebra, w: "clamp(46px, 8.5vmin, 80px)", d: 0.9 },
          { A: Penguin, w: "clamp(38px, 7vmin, 64px)", d: 1.2 },
          { A: Koala, w: "clamp(42px, 7.5vmin, 70px)", d: 1.5 },
          { A: Turtle, w: "clamp(44px, 8vmin, 74px)", d: 1.8 },
        ].map(({ A, w, d }, i) => (
          <motion.div
            key={i}
            style={{ width: w }}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: [0, -7, 0], opacity: 1 }}
            transition={{
              opacity: { delay: 0.3 + i * 0.08, duration: 0.4 },
              y: { duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: d },
            }}
          >
            <A />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/** Alphabet grid on leafy tiles + rainbow progress */
export function JungleGrid() {
  const { letterCase, found, setLetter, setScreen, setCase } = useJungleStore();
  const foundCount = found.length;

  // Same narrator, same clip as the tracing home: "Pick a letter!"
  useEffect(() => {
    const t = setTimeout(() => void playClip("instr-choose-a-letter"), 450);
    return () => clearTimeout(t);
  }, []);

  const openLetter = (l: string) => {
    playClickSound();
    setLetter(l);
    setScreen("level");
  };

  // Unified start flow (same as Letter Tracing / Letter Hunt): continue from
  // the first animal not yet found, or start over from A.
  const ALPHA = JUNGLE_ANIMALS.map((a) => a.letter);
  const nextUnfound = ALPHA.find((l) => !found.includes(l)) ?? "A";
  const hasProgress = found.length > 0 && found.length < ALPHA.length;

  return (
    <div
      className="relative flex h-full w-full flex-col items-center gap-4 overflow-y-auto overflow-x-hidden px-5 py-6"
      style={{ background: "linear-gradient(165deg, #E8F8EE 0%, #FFF6D6 100%)" }}
    >
      <JungleBackdrop />

      {/* Back to this game's home (the ABC/abc splash) — pinned top-left */}
      <button
        onClick={() => { playClickSound(); setScreen("splash"); }}
        className="absolute left-4 top-4 z-20 flex min-h-[44px] items-center gap-1.5 rounded-full bg-white/75 px-3.5 py-2 shadow-soft"
        aria-label="Back to Jungle Spy home"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="#3DAA72" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-rounded text-xs font-bold" style={{ color: "#3DAA72" }}>Back</span>
      </button>

      {/* Top bar — case toggle now centered on its own, no longer sharing
          the row with the back button */}
      <div className="relative z-10 flex w-full max-w-md items-center justify-center md:max-w-2xl">
        <div className="flex rounded-full bg-white/70 p-1" role="group" aria-label="Letter size">
          {(["upper", "lower"] as const).map((c) => (
            <button
              key={c}
              onClick={() => { playClickSound(); setCase(c); }}
              className="min-h-[38px] rounded-full px-3.5 font-rounded text-sm font-black"
              style={{
                background: letterCase === c ? "white" : "transparent",
                color: letterCase === c ? "#3DAA72" : "#9AB8A6",
                boxShadow: letterCase === c ? "0 2px 8px rgba(61,170,114,0.2)" : "none",
              }}
              aria-pressed={letterCase === c}
              aria-label={c === "upper" ? "Big letters" : "Small letters"}
            >
              {c === "upper" ? "ABC" : "abc"}
            </button>
          ))}
        </div>
      </div>

      {/* Rainbow progress */}
      <div className="relative z-10 w-full max-w-md md:max-w-2xl">
        <div className="mb-1 flex justify-between">
          <span className="font-rounded text-sm font-bold text-plum/70">Found animals</span>
          <span className="font-rounded text-sm font-black text-plum">{foundCount} / 26</span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-white/60">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #FF8FA3, #FFD93D, #8FD6A8, #74B9FF, #C9A9F5)",
            }}
            initial={false}
            animate={{ width: `${(foundCount / 26) * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
      </div>

      
      {/* Letter tiles */}
      <div
        className="relative z-10 grid w-full max-w-md gap-2.5 md:max-w-2xl"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(52px, 1fr))" }}
      >
        {JUNGLE_ANIMALS.map((a, i) => {
          const isFound = found.includes(a.letter);
          const display = letterCase === "lower" ? a.letter.toLowerCase() : a.letter;
          const shades = ["#C8F0D8", "#D9F2C4", "#BFEAD2"];
          return (
            <motion.button
              key={a.letter}
              onClick={() => openLetter(a.letter)}
              className="relative flex aspect-square min-h-[48px] items-center justify-center rounded-2xl shadow-sm"
              style={{
                background: isFound ? "#FFE79C" : shades[i % 3],
                border: `2.5px solid ${isFound ? "#F2C94C" : "#8FD6A8"}`,
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.02 * i, type: "spring", stiffness: 300, damping: 20 }}
              whileTap={{ scale: 0.92 }}
              aria-label={`${a.letter} — find the ${a.name}${isFound ? " (found)" : ""}`}
            >
              <span
                className="font-rounded font-black"
                style={{ color: isFound ? "#C08A2D" : "#3DAA72", fontSize: "clamp(19px, 2.8vw, 26px)" }}
              >
                {display}
              </span>
              {isFound && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] shadow-sm" aria-hidden="true">
                  ⭐
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Unified start flow — beneath the grid, matching the other games */}
      <StartOptions
        hasProgress={hasProgress}
        onContinue={() => openLetter(nextUnfound)}
        continueLabel={`Continue · ${nextUnfound}`}
        onStartFromA={() => openLetter("A")}
      />
    </div>
  );
}
