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
import { StarRow } from "@shared/components/ui/StarRow";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { CelebrationOverlay } from "@shared/components/game/CelebrationOverlay";
import { useElementSize } from "@shared/hooks/useElementSize";
import { cssVars } from "@shared/styles/cssVars";
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
function HypnoRings({ hue }: { hue: string }) {
  const rings = [0.95, 0.76, 0.57, 0.38, 0.19];
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className="absolute inset-0 h-full w-full opacity-40"
      animate={{ rotate: 360 }}
      transition={{ duration: 13, repeat: Infinity, ease: "linear" }}
      aria-hidden="true"
    >
      {rings.map((r, i) => (
        <circle
          key={i}
          cx="50" cy="50" r={r * 46}
          fill="none"
          stroke={hue}
          strokeWidth="6"
          strokeDasharray={i % 2 === 0 ? "10 7" : "4 6"}
          opacity={0.5 + (i % 2) * 0.3}
        />
      ))}
    </motion.svg>
  );
}

/** How many copies of the target the child must find (was 3). */
const TARGET_TOTAL = 5;

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
    ...Array.from({ length: TARGET_TOTAL }, () => ({ letter: target, isTarget: true })),
    { letter: decoyA, isTarget: false },
    { letter: decoyA, isTarget: false },
    { letter: decoyA, isTarget: false },
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
  const [rootRef, dims] = useElementSize();

  const foundCount = useMemo(() => cards.filter((c) => c.isTarget && c.found).length, [cards]);


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
          if (next.filter((p) => p.isTarget && p.found).length === TARGET_TOTAL) {
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
      className="bg-wash-mint relative flex h-full w-full flex-col items-center overflow-hidden px-4 py-4">
      <HomeEnvironment />

      {/* Top bar */}
      <div className="relative z-10 flex w-full max-w-xl items-center justify-between">
        <NavPillButton
          label="Home"
          ariaLabel="Back to Letter Hunt home"
          tone="plum"
          onClick={() => { playClickSound(); stopVoice(); router.back(); }}
        />

        {phase === "find" && (
          <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-soft">
            <span className="font-rounded text-sm font-bold text-plum/70">Find</span>
            <span className="font-rounded text-2xl font-black text-plum">{target}</span>
          </div>
        )}

        {/* collected stars — same gold stars as the tracing game's 5-star mode */}
        {phase !== "intro" ? (
          <div className="flex min-h-[44px] items-center gap-1.5 rounded-full bg-white/80 px-3.5 shadow-soft"
               role="status" aria-label={`${foundCount} of ${TARGET_TOTAL} stars earned`}>
            <StarRow earned={foundCount} total={TARGET_TOTAL} />
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
              className="hunt-penny-intro"
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
                      className="hunt-notebook-letter font-rounded font-black leading-none text-plum"
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
                className="hunt-card absolute flex min-h-[52px] min-w-[52px] items-center justify-center p-2 shadow-card"
                style={cssVars({
                  "--pl-x": `clamp(60px, ${c.x}%, calc(100% - 60px))`,
                  "--pl-y": `clamp(52px, ${c.y}%, calc(100% - 52px))`,
                  "--pl-bg": c.style.bg,
                  "--pl-border": c.found ? "#66CC94" : c.style.border,
                  "--pl-radius": c.style.radius,
                })}
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
                <div className="hunt-card-clip absolute inset-0 overflow-hidden">
                  <HypnoRings hue={c.style.border} />
                </div>
                {/* soft halo keeps the letter legible over the busy rings */}
                <span
                  className="hunt-card-halo absolute rounded-full bg-white/70"
                  aria-hidden="true"
                />
                <span
                  className={`pl-glyph relative font-rounded font-black leading-none ${
                    c.style.outline ? "hunt-glyph--outline" : "pl-tint"
                  }`}
                  style={cssVars({ "--pl-font-size": c.fontSize, "--pl-color": c.style.color })}
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
          <CelebrationOverlay tintClassName="hunt-done-tint" gapClassName="gap-4" blur="3px" size={dims}>
            <motion.div
              className="hunt-penny-done relative"
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
            <h2 className="hunt-done-heading font-rounded font-black text-plum">
              {clipText(cheerId)}
            </h2>
            <p className="font-rounded text-base font-semibold text-plum/60">
              You found every {target}!
            </p>
            <button
              onClick={goNext}
              className="inline-flex min-h-[52px] items-center gap-2 rounded-full bg-plum px-7 font-rounded text-base font-black text-white shadow-lg"
              aria-label={`Next letter: ${LETTERS[(currentIndex + 1) % 26]}`}
            >
              <span>Next</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 6l6 6-6 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </CelebrationOverlay>
        )}
      </AnimatePresence>
    </div>
  );
}
