"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useHuntStore } from "@games/letter-hunt/store/huntStore";
import { LETTERS } from "@games/letter-hunt/components/HuntScreens";
import { PencilPal, Notebook } from "@games/letter-hunt/components/PennyArt";
import { HomeEnvironment } from "@shared/components/animations/HomeEnvironment";
import { shuffle } from "@shared/utils/random";
import { playCorrectSound, playIncorrectSound, playClickSound } from "@shared/audio/sfx";
import { CelebrationSparkles } from "@shared/components/animations/Sparkles";
import { playClip, playSequence, preloadClips, clipText, stopVoice } from "@shared/audio/voice";

/** Letters that look too similar to make fair decoys for a given target */
const CONFUSABLE: Record<string, string[]> = {
  B: ["D", "P", "R"], D: ["B", "O", "Q"], O: ["Q", "C", "D"], Q: ["O", "G"],
  P: ["B", "R"], R: ["B", "P"], C: ["O", "G"], G: ["C", "Q"], I: ["L", "J", "T"],
  L: ["I", "J"], J: ["I", "L"], M: ["N", "W"], N: ["M"], W: ["M", "V"],
  V: ["W", "U"], U: ["V"], E: ["F"], F: ["E"],
};

/** Six clearly different visual treatments — same letter, different looks.
 *  The cognitive point: "A can look different but is still A." */
const CARD_STYLES = [
  { bg: "#DDD5F5", border: "#A882E8", color: "#7C5CBF", radius: "1.5rem", outline: false },
  { bg: "#FFFFFF", border: "#FF8FA3", color: "#FF8FA3", radius: "9999px", outline: false },
  { bg: "#C8F0D8", border: "#66CC94", color: "#3DAA72", radius: "1rem", outline: false },
  { bg: "#FFF0B3", border: "#F2C94C", color: "#C08A2D", radius: "1.75rem", outline: false },
  { bg: "#FFFFFF", border: "#74B9FF", color: "#74B9FF", radius: "1.25rem", outline: true },
  { bg: "#FFD6E8", border: "#FF9EBC", color: "#D14D82", radius: "9999px", outline: false },
] as const;

interface Card {
  id: number;
  letter: string;
  isTarget: boolean;
  found: boolean;
  style: (typeof CARD_STYLES)[number];
  /** percent position within the play area — a real spatial scatter, not a grid */
  x: number;
  y: number;
  rotate: number;
  fontSize: string;
}

/** Ten hand-placed slots spanning the FULL play area edge-to-edge — a busy,
 *  game-like scatter, not rows/columns. Shuffled per round. */
const SLOTS: readonly [number, number][] = [
  [8, 18], [30, 10], [54, 20], [76, 12], [94, 26],
  [12, 58], [34, 82], [58, 62], [80, 86], [95, 60],
];

/** Five font-size tiers — deliberately extreme (tiny → huge) so the board
 *  reads as genuinely varied, not just "slightly different". Applied to the
 *  glyph only; the tap target is kept comfortable via container padding. */
const SIZE_TIERS = [
  "clamp(18px, 3.6vmin, 26px)",
  "clamp(26px, 5.2vmin, 38px)",
  "clamp(36px, 7.2vmin, 54px)",
  "clamp(50px, 10vmin, 76px)",
  "clamp(66px, 13.5vmin, 104px)",
] as const;

/** Slowly rotating concentric rings — a calm (non-flashing) hypnotic pattern
 *  behind each letter, purely to make the board busier/harder to scan. */
/** Six clashing background patterns — rings, stripes, checker, dots,
 *  chevrons, waves — randomized per card so the board reads as genuinely
 *  chaotic to scan. All motion stays SLOW (≥13s loops, no flashing, no
 *  pulsing): busy to look at, never strobing. */
function CardPattern({ hue, variant }: { hue: string; variant: number }) {
  const spin = {
    animate: { rotate: 360 },
    transition: { duration: 14 + (variant % 3) * 3, repeat: Infinity, ease: "linear" as const },
  };
  const drift = {
    animate: { x: [0, 10, 0] },
    transition: { duration: 11, repeat: Infinity, ease: "easeInOut" as const },
  };

  switch (variant % 6) {
    case 0: // concentric dashed rings (the original)
      return (
        <motion.svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" style={{ opacity: 0.45 }} {...spin} aria-hidden="true">
          {[0.95, 0.76, 0.57, 0.38, 0.19].map((r, i) => (
            <circle key={i} cx="50" cy="50" r={r * 46} fill="none" stroke={hue} strokeWidth="6"
              strokeDasharray={i % 2 === 0 ? "10 7" : "4 6"} opacity={0.5 + (i % 2) * 0.3} />
          ))}
        </motion.svg>
      );
    case 1: // diagonal stripes
      return (
        <motion.svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" style={{ opacity: 0.4 }} {...drift} aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={i} x1={-30 + i * 14} y1="110" x2={10 + i * 14} y2="-10"
              stroke={hue} strokeWidth="5" opacity={i % 2 ? 0.9 : 0.5} />
          ))}
        </motion.svg>
      );
    case 2: // checkerboard
      return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" style={{ opacity: 0.3 }} aria-hidden="true">
          {Array.from({ length: 36 }).map((_, i) => {
            const x = (i % 6) * 17 - 1;
            const y = Math.floor(i / 6) * 17 - 1;
            return (i % 6 + Math.floor(i / 6)) % 2 === 0
              ? <rect key={i} x={x} y={y} width="17" height="17" fill={hue} />
              : null;
          })}
        </svg>
      );
    case 3: // offset polka dots
      return (
        <motion.svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" style={{ opacity: 0.45 }} {...spin} aria-hidden="true">
          {Array.from({ length: 25 }).map((_, i) => {
            const row = Math.floor(i / 5);
            const x = (i % 5) * 22 + (row % 2 ? 11 : 0);
            return <circle key={i} cx={x} cy={row * 22 + 6} r={4 + (i % 3) * 2} fill={hue} opacity={0.4 + (i % 3) * 0.2} />;
          })}
        </motion.svg>
      );
    case 4: // chevrons / zigzag
      return (
        <motion.svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" style={{ opacity: 0.4 }} {...drift} aria-hidden="true">
          {Array.from({ length: 7 }).map((_, i) => (
            <path key={i} d={`M-5 ${i * 16} L15 ${i * 16 + 10} L35 ${i * 16} L55 ${i * 16 + 10} L75 ${i * 16} L95 ${i * 16 + 10} L115 ${i * 16}`}
              fill="none" stroke={hue} strokeWidth="4.5" opacity={i % 2 ? 0.85 : 0.5} />
          ))}
        </motion.svg>
      );
    default: // wavy lines
      return (
        <motion.svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" style={{ opacity: 0.42 }} {...drift} aria-hidden="true">
          {Array.from({ length: 7 }).map((_, i) => (
            <path key={i} d={`M-10 ${8 + i * 15} Q15 ${i * 15 - 4} 40 ${8 + i * 15} T90 ${8 + i * 15} T140 ${8 + i * 15}`}
              fill="none" stroke={hue} strokeWidth="5" opacity={i % 2 ? 0.9 : 0.55} />
          ))}
        </motion.svg>
      );
  }
}

function buildCards(target: string): Card[] {
  const avoid = new Set([target, ...(CONFUSABLE[target] ?? [])]);
  const decoyPool = shuffle(LETTERS.filter((l) => !avoid.has(l)));
  // Two different decoy identities (not one repeated seven times) — busier,
  // more genuinely confusing board while every distractor stays fair
  // (never a letter that's visually confusable with the target).
  const [decoyA, decoyB] = decoyPool;
  const styles = shuffle([...CARD_STYLES, ...CARD_STYLES]).slice(0, 10);
  const slots = shuffle(SLOTS);
  const sizes = shuffle([...SIZE_TIERS, ...SIZE_TIERS]).slice(0, 10);
  const letters = shuffle([
    { letter: target, isTarget: true },
    { letter: target, isTarget: true },
    { letter: target, isTarget: true },
    { letter: decoyA, isTarget: false },
    { letter: decoyA, isTarget: false },
    { letter: decoyA, isTarget: false },
    { letter: decoyA, isTarget: false },
    { letter: decoyB, isTarget: false },
    { letter: decoyB, isTarget: false },
    { letter: decoyB, isTarget: false },
  ]);
  return letters.map((l, i) => ({
    id: i,
    ...l,
    found: false,
    style: styles[i],
    x: slots[i][0],
    y: slots[i][1],
    rotate: [-8, -5, -2, 0, 2, 4, 6, -4, 3, -6][i],
    fontSize: sizes[i],
  }));
}

type Phase = "intro" | "find" | "done";

/** Tiny star burst local to one card — never screen-covering, so the child
 *  always keeps sight of the remaining letters. */
function MiniBurst() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i * Math.PI) / 3;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 text-base"
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
            animate={{ x: Math.cos(a) * 42, y: Math.sin(a) * 42, opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            ✨
          </motion.span>
        );
      })}
    </div>
  );
}

export function HuntLevel() {
  const router = useRouter();
  const { currentIndex, setIndex, markCompleted } = useHuntStore();
  const target = LETTERS[currentIndex];

  const [phase, setPhase] = useState<Phase>("intro");
  const [introStep, setIntroStep] = useState(0); // 0 settle · 1 letter shown · 2 prompt
  const [cards, setCards] = useState<Card[]>(() => buildCards(target));
  const [shakeId, setShakeId] = useState<number | null>(null);
  const [cheerId] = useState(
    () => ["cheer-well-done", "cheer-great-job", "cheer-you-did-it", "cheer-fantastic"][
      Math.floor(Math.random() * 4)
    ]
  );
  // Measured from the ACTUAL rendered root — not window.innerWidth/height —
  // so the confetti always spans the true play viewport, immune to any
  // transformed ancestor (which is what causes confetti to bunch to one
  // side: position:fixed breaks inside a transformed parent, this doesn't).
  const rootRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 360, h: 640 });
  useEffect(() => {
    const el = rootRef.current;
    if (el) setDims({ w: el.offsetWidth, h: el.offsetHeight });
  }, []);

  const foundCount = useMemo(() => cards.filter((c) => c.isTarget && c.found).length, [cards]);
  const targetTotal = 3;

  // ── Introduction choreography, driven by the real audio lifecycle:
  // Penny settles → notebook + letter → "A" → "aaah" → "Can you find A?" → find
  useEffect(() => {
    const l = target.toLowerCase();
    preloadClips([`letter-${l}`, `phonics-${l}`, `hunt-find-${l}`, cheerId]);
    setCards(buildCards(target));
    setPhase("intro");
    setIntroStep(0);
    let cancelled = false;
    const t = setTimeout(() => {
      void playSequence(
        [`letter-${l}`, `phonics-${l}`, `hunt-find-${l}`],
        300,
        (i) => {
          if (cancelled) return;
          if (i === 0) setIntroStep(1); // letter pops as its name is spoken
          if (i === 2) setIntroStep(2); // prompt caption as the question is asked
        }
      ).then(() => {
        if (!cancelled) setTimeout(() => !cancelled && setPhase("find"), 450);
      });
    }, 900); // Penny + notebook settle first
    return () => { cancelled = true; clearTimeout(t); stopVoice(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  const tapCard = useCallback(
    (c: Card) => {
      if (phase !== "find" || c.found) return;
      if (c.isTarget) {
        playCorrectSound();
        void playClip(`letter-${target.toLowerCase()}`);
        setCards((prev) => {
          const next = prev.map((p) => (p.id === c.id ? { ...p, found: true } : p));
          if (next.filter((p) => p.isTarget && p.found).length === targetTotal) {
            setTimeout(() => {
              setPhase("done");
              markCompleted(target);
              void playClip(cheerId);
            }, 500);
          }
          return next;
        });
      } else {
        playIncorrectSound();
        setShakeId(c.id);
        setTimeout(() => setShakeId(null), 500);
      }
    },
    [phase, target, cheerId, markCompleted]
  );

  const goNext = useCallback(() => {
    playClickSound();
    stopVoice();
    setIndex((currentIndex + 1) % 26);
  }, [currentIndex, setIndex]);

  return (
    <div
      ref={rootRef}
      className="relative flex h-full w-full flex-col items-center overflow-hidden px-4 py-4"
      style={{ background: "linear-gradient(180deg, #C8F0D8 0%, #E8F8EF 60%, #C8F0D8 100%)" }}
    >
      <HomeEnvironment />

      {/* Top bar */}
      <div className="relative z-10 flex w-full max-w-xl items-center justify-between">
        <button
          onClick={() => { playClickSound(); stopVoice(); router.back(); }}
          className="flex min-h-[44px] items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-2 shadow-soft"
          aria-label="Back to Letter Hunt home"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#7C5CBF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-rounded text-xs font-bold text-plum/80">Home</span>
        </button>

        {phase === "find" && (
          <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-soft">
            <span className="font-rounded text-sm font-bold text-plum/70">Find</span>
            <span className="font-rounded text-2xl font-black text-plum">{target}</span>
          </div>
        )}

        {/* gentle 1/3 · 2/3 · 3/3 dots */}
        {phase !== "intro" ? (
          <div className="flex min-h-[44px] items-center gap-1.5 rounded-full bg-white/80 px-3.5 shadow-soft"
               role="status" aria-label={`${foundCount} of ${targetTotal} found`}>
            {Array.from({ length: targetTotal }).map((_, i) => (
              <motion.span
                key={i}
                className="block h-3.5 w-3.5 rounded-full"
                initial={false}
                animate={{
                  background: i < foundCount ? "#66CC94" : "rgba(124,92,191,0.18)",
                  scale: i < foundCount ? [1, 1.5, 1] : 1,
                }}
                transition={{ duration: 0.35 }}
              />
            ))}
          </div>
        ) : (
          <div className="w-[84px]" aria-hidden="true" />
        )}
      </div>

      {/* ── INTRODUCTION: Penny + the notebook ── */}
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div
            key="intro"
            className="relative z-10 flex flex-1 items-center justify-center gap-2 sm:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <motion.div
              style={{ width: "clamp(80px, 18vmin, 140px)" }}
              initial={{ x: -60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 160, damping: 18 }}
            >
              <PencilPal pointing />
            </motion.div>

            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.35, type: "spring", stiffness: 180, damping: 18 }}
              className="flex flex-col items-center gap-3"
            >
              <Notebook>
                <AnimatePresence>
                  {introStep >= 1 && (
                    <motion.span
                      className="font-rounded font-black text-plum"
                      style={{ fontSize: "clamp(90px, 24vmin, 190px)", lineHeight: 1 }}
                      initial={{ scale: 0.3, opacity: 0 }}
                      animate={{ scale: [0.3, 1.12, 1], opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {target}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Notebook>
              {/* caption matches the spoken clip exactly */}
              <div className="min-h-[32px]">
                <AnimatePresence>
                  {introStep >= 2 && (
                    <motion.p
                      className="rounded-full bg-white/85 px-4 py-1.5 font-rounded text-base font-black text-plum shadow-soft"
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                    >
                      {clipText(`hunt-find-${target.toLowerCase()}`)}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── FIND: a real play-space — six cards scattered across the
              whole area, varied tilt/scale, never a grid or list ── */}
        {phase !== "intro" && (
          <motion.div
            key="find"
            className="relative z-10 w-full max-w-3xl flex-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {cards.map((c) => (
              <motion.button
                key={c.id}
                onClick={() => tapCard(c)}
                className="absolute flex min-h-[52px] min-w-[52px] items-center justify-center p-2 shadow-card"
                style={{
                  left: `clamp(60px, ${c.x}%, calc(100% - 60px))`,
                  top: `clamp(52px, ${c.y}%, calc(100% - 52px))`,
                  background: c.style.bg,
                  border: `3.5px solid ${c.found ? "#66CC94" : c.style.border}`,
                  borderRadius: c.style.radius,
                  touchAction: "manipulation",
                }}
                initial={{ x: "-50%", y: "-50%", scale: 0, opacity: 0, rotate: c.rotate }}
                animate={
                  shakeId === c.id
                    ? { x: ["-56%", "-44%", "-53%", "-47%", "-51%", "-50%"], y: "-50%", scale: 1, opacity: 1, rotate: c.rotate }
                    : { x: "-50%", y: "-50%", scale: c.found ? [1, 1.12, 1] : 1, opacity: 1, rotate: c.rotate }
                }
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                aria-label={`Letter ${c.letter}${c.found ? " — found!" : ""}`}
                disabled={c.found}
              >
                {/* slow, calm hypnotic ring pattern — clipped to the card shape only,
                    so the sparkle burst below can still fly freely outside it */}
                <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: c.style.radius }}>
                  <CardPattern hue={c.style.border} variant={c.id} />
                </div>
                {/* soft halo keeps the letter legible over the busy rings */}
                <span
                  className="absolute rounded-full bg-white/70"
                  style={{ width: "72%", height: "72%" }}
                  aria-hidden="true"
                />
                <span
                  className="relative font-rounded font-black"
                  style={{
                    fontSize: c.fontSize,
                    lineHeight: 1,
                    color: c.style.outline ? "transparent" : c.style.color,
                    WebkitTextStroke: c.style.outline ? `3px ${c.style.color}` : undefined,
                  }}
                >
                  {c.letter}
                </span>
                {/* small local sparkle on found — never screen-covering */}
                {c.found && <MiniBurst />}
                {c.found && (
                  <span className="absolute -right-1.5 -top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm shadow-sm" aria-hidden="true">
                    ⭐
                  </span>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Completion: Penny with a star + MATCHING spoken/displayed cheer ── */}
      <AnimatePresence>
        {phase === "done" && (
          <motion.div
            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 px-6"
            style={{ background: "rgba(240,232,255,0.93)", backdropFilter: "blur(3px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <CelebrationSparkles active width={dims.w} height={dims.h} />
            </div>
            <motion.div
              className="relative"
              style={{ width: "clamp(100px, 24vmin, 170px)" }}
              initial={{ scale: 0.5, y: 20 }}
              animate={{ scale: 1, y: [0, -10, 0] }}
              transition={{
                scale: { type: "spring", stiffness: 220, damping: 16 },
                y: { duration: 0.9, repeat: 2, ease: "easeInOut", delay: 0.3 },
              }}
            >
              <motion.span
                className="absolute -right-3 -top-3 text-4xl"
                animate={{ rotate: [0, 18, -12, 0], scale: [1, 1.25, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                aria-hidden="true"
              >
                ⭐
              </motion.span>
              <PencilPal />
            </motion.div>
            <h2 className="font-rounded font-black text-plum" style={{ fontSize: "clamp(28px, 7vmin, 44px)" }}>
              {clipText(cheerId)}
            </h2>
            <p className="font-rounded text-base font-semibold text-plum/60">
              You found every {target}!
            </p>
            <button
              onClick={goNext}
              className="inline-flex min-h-[52px] items-center gap-2 px-7 font-rounded text-base font-black text-white shadow-lg"
              style={{ background: "#7C5CBF", borderRadius: 9999 }}
              aria-label={`Next letter: ${LETTERS[(currentIndex + 1) % 26]}`}
            >
              <span>Next</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 6l6 6-6 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
