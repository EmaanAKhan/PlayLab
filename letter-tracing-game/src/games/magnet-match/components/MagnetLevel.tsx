"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CelebrationSparkles } from "@shared/components/animations/Sparkles";
import { playClickSound, playStarPop } from "@shared/audio/sfx";
import { playClip, playSequence, preloadClips, clipText, stopVoice } from "@shared/audio/voice";
import { shuffle } from "@shared/utils/random";
import { GROUPS, TOTAL_GROUPS, LOWERCASE, MAGNET_COLORS } from "@games/magnet-match/constants/letters";
import { SoupPot, ChefArt, OwlArt } from "@games/magnet-match/components/MagnetArt";
import { KitchenBackdrop } from "@games/magnet-match/components/KitchenBackdrop";

interface MagnetLevelProps {
  groupIndex: number;
  onGroupComplete: () => void;
}

/** Generous drop tolerance around each gray target (px) */
const DROP_SLOP_PX = 30;
/** Celebration length before auto-advancing to the next group */
const GROUP_DONE_MS = 2400;

interface DragState {
  letter: string;
  x: number;
  y: number;
}

/** A physical-looking alphabet magnet (colored) or its gray target twin. */
function Magnet({ letter, colorIndex, gray = false, size }: { letter: string; colorIndex: number; gray?: boolean; size: string }) {
  const c = MAGNET_COLORS[colorIndex % MAGNET_COLORS.length];
  return (
    <span
      className="flex items-center justify-center rounded-2xl font-rounded font-black leading-none"
      style={{
        width: size,
        height: size,
        fontSize: `calc(${size} * 0.62)`,
        color: gray ? "#8A8A96" : "white",
        background: gray ? "rgba(120,120,132,0.22)" : c.fill,
        border: gray ? "3px dashed rgba(120,120,132,0.5)" : `3px solid ${c.edge}`,
        boxShadow: gray ? "none" : "0 4px 0 rgba(0,0,0,0.14), inset 0 2px 0 rgba(255,255,255,0.35)",
        textShadow: gray ? "none" : "0 2px 0 rgba(0,0,0,0.18)",
      }}
    >
      {letter}
    </span>
  );
}

export function MagnetLevel({ groupIndex, onGroupComplete }: MagnetLevelProps) {
  const router = useRouter();
  const group = GROUPS[groupIndex];

  /** letters already matched into the pot this group */
  const [matched, setMatched] = useState<string[]>([]);
  // magnets on the tray, shuffled once per group (component remounts per
  // group via key, so a fresh order every time)
  const tray = useMemo(() => shuffle([...group]), [group]);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [chefHappy, setChefHappy] = useState(false);
  const [owlHop, setOwlHop] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const targetRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [dims, setDims] = useState({ w: 360, h: 640 });

  // every timer tracked + cleared on unmount — no stale advances/audio
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const schedule = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(setTimeout(fn, ms));
  }, []);
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      stopVoice();
    };
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (el) setDims({ w: el.offsetWidth, h: el.offsetHeight });
  }, []);

  // Group intro narration: full instruction on the very first group, then
  // just the group's letter names — always ending with the letters so the
  // child hears exactly what to look for.
  useEffect(() => {
    const letterClips = group.map((l) => `letter-${l}`);
    preloadClips(["magnet-intro", "cheer-yoo-hoo", "magnet-excellent", "magnet-soup", ...letterClips]);
    let cancelled = false;
    const t = setTimeout(() => {
      if (cancelled) return;
      void playSequence(groupIndex === 0 ? ["magnet-intro", ...letterClips] : letterClips, 280);
    }, 600);
    return () => { cancelled = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupIndex]);

  // ── drag engine (root-relative, pointer capture — the shark pattern) ──
  const toRoot = useCallback((cx: number, cy: number) => {
    const r = rootRef.current?.getBoundingClientRect();
    return { x: cx - (r?.left ?? 0), y: cy - (r?.top ?? 0) };
  }, []);

  const startDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>, letter: string) => {
      if (celebrating || drag || matched.includes(letter)) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      const p = toRoot(e.clientX, e.clientY);
      setDrag({ letter, x: p.x, y: p.y });
    },
    [celebrating, drag, matched, toRoot]
  );

  const moveDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag) return;
      const p = toRoot(e.clientX, e.clientY);
      setDrag({ ...drag, x: p.x, y: p.y });
    },
    [drag, toRoot]
  );

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag) return;
      const letter = drag.letter;
      setDrag(null);

      // nearest hit target among inflated rects (nearest-center wins where
      // the generous zones overlap)
      let hit: string | null = null;
      let best = Infinity;
      for (const [l, el] of targetRefs.current) {
        const r = el.getBoundingClientRect();
        const inside =
          e.clientX >= r.left - DROP_SLOP_PX && e.clientX <= r.right + DROP_SLOP_PX &&
          e.clientY >= r.top - DROP_SLOP_PX && e.clientY <= r.bottom + DROP_SLOP_PX;
        if (!inside) continue;
        const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
        if (d < best) { best = d; hit = l; }
      }

      if (!hit) return; // dropped on open counter — magnet just returns

      if (hit === letter) {
        // CORRECT: soft plop → "Yoo hoo!" → letter name (spec's layering,
        // sequenced so the voices never overlap)
        playStarPop();
        void playSequence(["cheer-yoo-hoo", `letter-${letter}`], 150);
        const now = [...matched, letter];
        setMatched(now);
        setChefHappy(true);
        schedule(() => setChefHappy(false), 900);
        if (now.length >= group.length) {
          schedule(() => {
            setCelebrating(true);
            setOwlHop(true);
            void playSequence(["magnet-excellent", "magnet-soup"], 250);
          }, 700);
          schedule(onGroupComplete, 700 + GROUP_DONE_MS);
        }
      }
      // WRONG: no buzzer, no message — the magnet simply returns (spec 13)
    },
    [drag, matched, group, onGroupComplete, schedule]
  );

  const magnetSize = "clamp(58px, 12vmin, 96px)";
  const lettersDone = Math.min(groupIndex * 3, 26);

  return (
    <div
      ref={rootRef}
      className="relative flex h-full w-full flex-col items-center overflow-hidden px-4 py-3"
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <KitchenBackdrop />

      {/* ── top bar: back · alphabet progress · owl ── */}
      <div className="relative z-10 flex w-full max-w-2xl items-center gap-2">
        <button
          onClick={() => { playClickSound(); stopVoice(); router.back(); }}
          className="flex min-h-[44px] items-center gap-1.5 rounded-full bg-white/85 px-3.5 py-2 shadow-soft"
          aria-label="Back to the start screen"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#C97B4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-rounded text-xs font-bold" style={{ color: "#C97B4A" }}>Back</span>
        </button>

        {/* alphabet-wide progress — never resets between groups */}
        <div className="min-w-0 flex-1" role="status" aria-label={`${lettersDone} of 26 letters in the soup`}>
          <div className="h-3.5 w-full overflow-hidden rounded-full bg-white/70 shadow-soft">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #F2B84D, #E88A5D)" }}
              initial={false}
              animate={{ width: `${(lettersDone / LOWERCASE.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
        </div>

        <motion.div
          className="h-11 w-11"
          animate={owlHop ? { y: [0, -10, 0, -6, 0] } : { y: 0 }}
          transition={{ duration: 0.7 }}
          onAnimationComplete={() => setOwlHop(false)}
        >
          <OwlArt />
        </motion.div>
      </div>

      {/* instruction — same text as the spoken clip */}
      <p className="relative z-10 mt-1.5 max-w-xl rounded-full bg-white/85 px-4 py-1.5 text-center font-rounded text-xs font-bold shadow-soft md:text-sm" style={{ color: "#8A5A2E" }}>
        {clipText("magnet-intro")}
      </p>

      {/* ── main play area: pot (left) · magnet tray (right) · chef (corner) ── */}
      <div className="relative z-10 flex w-full max-w-3xl flex-1 items-center justify-center gap-[4vw]">
        {/* the pot with its gray targets */}
        <div className="relative" style={{ width: "clamp(220px, 46vmin, 380px)" }}>
          <div style={{ aspectRatio: "260/240" }}>
            <SoupPot />
          </div>
          {/* target slots — staggered inside the pot like the reference */}
          <div className="absolute inset-x-0 top-[24%] flex flex-col items-center gap-[4%]">
            {group.map((l, i) => {
              const isMatched = matched.includes(l);
              return (
                <div
                  key={l}
                  ref={(el) => {
                    if (el) targetRefs.current.set(l, el);
                    else targetRefs.current.delete(l);
                  }}
                  className="relative"
                  style={{ marginLeft: `${(i % 2 === 0 ? -1 : 1) * 14}%` }}
                  role="img"
                  aria-label={isMatched ? `${l} — matched!` : `gray target letter ${l}`}
                >
                  {/* halo while dragging, on unmatched targets */}
                  {drag && !isMatched && (
                    <div className="absolute -inset-2 rounded-3xl" style={{ background: "radial-gradient(ellipse, rgba(255,255,255,0.5), transparent 70%)" }} aria-hidden="true" />
                  )}
                  <AnimatePresence mode="wait" initial={false}>
                    {isMatched ? (
                      <motion.div key="filled" initial={{ scale: 1.35 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 16 }}>
                        <Magnet letter={l} colorIndex={group.indexOf(l)} size={magnetSize} />
                      </motion.div>
                    ) : (
                      <motion.div key="gray" exit={{ opacity: 0 }}>
                        <Magnet letter={l} colorIndex={0} gray size={magnetSize} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* the magnet tray */}
        <div className="flex flex-col items-center gap-[2.5vmin]">
          {tray.map((l) => {
            const gone = matched.includes(l);
            const beingDragged = drag?.letter === l;
            return (
              <AnimatePresence key={l} mode="popLayout">
                {!gone && (
                  <motion.div
                    className="touch-none"
                    style={{ cursor: beingDragged ? "grabbing" : "grab", opacity: beingDragged ? 0.25 : 1 }}
                    initial={{ scale: 0, x: 30 }}
                    animate={{ scale: 1, x: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    onPointerDown={(e) => startDrag(e, l)}
                    role="button"
                    tabIndex={0}
                    aria-label={`magnet letter ${l} — drag it onto the gray ${l} in the pot`}
                  >
                    <Magnet letter={l} colorIndex={group.indexOf(l)} size={magnetSize} />
                  </motion.div>
                )}
              </AnimatePresence>
            );
          })}
        </div>
      </div>

      {/* chef in the corner, reacting to matches — never over the letters */}
      <motion.div
        className="pointer-events-none absolute bottom-1 right-1 z-10 hidden sm:block"
        style={{ width: "clamp(90px, 20vmin, 160px)" }}
        animate={chefHappy ? { y: [0, -8, 0] } : { y: 0 }}
        transition={{ duration: 0.5 }}
        aria-hidden="true"
      >
        <ChefArt happy={chefHappy} />
      </motion.div>

      {/* drag ghost — root-relative absolute (never position:fixed) */}
      {drag && (
        <div
          className="pointer-events-none absolute z-40"
          style={{ left: drag.x, top: drag.y, transform: "translate(-50%, -60%) scale(1.12) rotate(-3deg)" }}
          aria-hidden="true"
        >
          <Magnet letter={drag.letter} colorIndex={group.indexOf(drag.letter)} size={magnetSize} />
        </div>
      )}

      {/* ── group complete — auto-advancing celebration ── */}
      <AnimatePresence>
        {celebrating && (
          <motion.div
            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 px-6"
            style={{ background: "rgba(251,231,162,0.6)", backdropFilter: "blur(2px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <CelebrationSparkles active width={dims.w} height={dims.h} />
            </div>
            <motion.h2
              className="rounded-full bg-white/95 px-8 py-3 font-rounded font-black shadow-card"
              style={{ fontSize: "clamp(26px, 6.5vmin, 42px)", color: "#C97B4A" }}
              initial={{ scale: 0.5, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 15 }}
            >
              {clipText("magnet-excellent")}
            </motion.h2>
            <p className="font-rounded text-base font-bold" style={{ color: "#8A5A2E" }}>
              {clipText("magnet-soup")} {groupIndex + 1} / {TOTAL_GROUPS}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
