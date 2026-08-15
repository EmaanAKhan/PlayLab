"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { ProgressBar } from "@shared/components/ui/ProgressBar";
import { CelebrationOverlay } from "@shared/components/game/CelebrationOverlay";
import { useElementSize } from "@shared/hooks/useElementSize";
import { useScheduler } from "@shared/hooks/useScheduler";
import { cssVars } from "@shared/styles/cssVars";
import { playClickSound, playStarPop, playIncorrectSound, playChime } from "@shared/audio/sfx";
import { playClip, playSequence, preloadClips, clipText, stopVoice } from "@shared/audio/voice";
import { shuffle } from "@shared/utils/random";
import { GROUPS, TOTAL_GROUPS, LOWERCASE } from "@games/magnet-match/constants/letters";
import { SoupPot, ChefArt, OwlArt, PuzzleMagnet as Magnet } from "@games/magnet-match/components/MagnetArt";
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

export function MagnetLevel({ groupIndex, onGroupComplete }: MagnetLevelProps) {
  const router = useRouter();
  const group = GROUPS[groupIndex];

  /** letters already matched into the pot this group */
  const [matched, setMatched] = useState<string[]>([]);
  // magnets on the tray, shuffled once per group (component remounts per
  // group via key, so a fresh order every time)
  const tray = useMemo(() => shuffle([...group]), [group]);
  const [drag, setDrag] = useState<DragState | null>(null);
  /** a correctly-dropped magnet mid-flight from the drop point to its slot */
  const [flying, setFlying] = useState<{ letter: string; fx: number; fy: number; tx: number; ty: number } | null>(null);
  /** slot currently under the dragged magnet — glows as a "drop here" cue */
  const [hoverSlot, setHoverSlot] = useState<string | null>(null);
  /** slot that just received a wrong magnet — shakes gently */
  const [wrongSlot, setWrongSlot] = useState<string | null>(null);
  /** slot that just got filled — shows the landing ring/sparkle burst */
  const [burstSlot, setBurstSlot] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [chefHappy, setChefHappy] = useState(false);
  const [owlHop, setOwlHop] = useState(false);

  const [rootRef, dims] = useElementSize();
  const targetRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // every timer tracked + cleared on unmount — no stale advances/audio
  const schedule = useScheduler();
  useEffect(() => () => stopVoice(), []);

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
  }, [rootRef]);

  const startDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>, letter: string) => {
      if (celebrating || drag || flying || matched.includes(letter)) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      playClickSound(); // soft pickup
      const p = toRoot(e.clientX, e.clientY);
      setDrag({ letter, x: p.x, y: p.y });
    },
    [celebrating, drag, flying, matched, toRoot]
  );

  const moveDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag) return;
      const p = toRoot(e.clientX, e.clientY);
      setDrag({ ...drag, x: p.x, y: p.y });
      // anticipation cue: which unmatched slot is under the magnet right now?
      let over: string | null = null;
      let best = Infinity;
      for (const [l, el] of targetRefs.current) {
        if (matched.includes(l)) continue;
        const r = el.getBoundingClientRect();
        const inside =
          e.clientX >= r.left - DROP_SLOP_PX && e.clientX <= r.right + DROP_SLOP_PX &&
          e.clientY >= r.top - DROP_SLOP_PX && e.clientY <= r.bottom + DROP_SLOP_PX;
        if (!inside) continue;
        const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
        if (d < best) { best = d; over = l; }
      }
      if (over !== hoverSlot) setHoverSlot(over);
    },
    [drag, toRoot, matched, hoverSlot]
  );

  /** the flight has landed — NOW the plop, the cheer, and the state flip,
   *  so the audio is synced to the visual landing instead of the release */
  const land = useCallback(
    (letter: string) => {
      setFlying(null);
      playStarPop();
      void playSequence(["cheer-yoo-hoo", `letter-${letter}`], 150);
      setBurstSlot(letter);
      schedule(() => setBurstSlot(null), 650);
      const now = [...matched, letter];
      setMatched(now);
      setChefHappy(true);
      schedule(() => setChefHappy(false), 900);
      if (now.length >= group.length) {
        schedule(() => {
          setCelebrating(true);
          setOwlHop(true);
          playChime(); // soft ding as the alphabet progress advances
          void playSequence(["magnet-excellent", "magnet-soup"], 250);
        }, 700);
        schedule(onGroupComplete, 700 + GROUP_DONE_MS);
      }
    },
    [matched, group, onGroupComplete, schedule]
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

      setHoverSlot(null);
      if (hit === letter) {
        // CORRECT: the magnet FLIES from the drop point into its slot; the
        // plop/cheer fire on landing (see land()), synced to the visual snap
        const el = targetRefs.current.get(letter);
        const root = rootRef.current?.getBoundingClientRect();
        if (el && root) {
          const r = el.getBoundingClientRect();
          const p = toRoot(e.clientX, e.clientY);
          setFlying({
            letter,
            fx: p.x,
            fy: p.y,
            tx: r.left + r.width / 2 - root.left,
            ty: r.top + r.height / 2 - root.top,
          });
        } else {
          land(letter); // refs unavailable (shouldn't happen) — land instantly
        }
      } else {
        // WRONG: gentle two-note "oops" + a soft shake on the slot that was
        // tried, then the magnet simply returns. Never harsh.
        playIncorrectSound();
        setWrongSlot(hit);
        schedule(() => setWrongSlot(null), 500);
      }
    },
    [drag, toRoot, land, schedule, rootRef]
  );

  const magnetSize = "clamp(58px, 12vmin, 96px)";
  // Slots are a literal clamp equal to exactly 20% of the pot's own clamp
  // above (200/38vmin/310 * 0.2 = 40/7.6vmin/62) — scaling a clamp() by a
  // constant scales it identically at every viewport size, not just the
  // endpoints, so this is mathematically tied to the pot at every size
  // without a live CSS var reference (that reference is what broke last
  // time: it silently pointed at a variable that was never defined). If the
  // pot's clamp above ever changes, multiply all three numbers by 0.2 again.
  const slotSize = "clamp(40px, 7.6vmin, 62px)";
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
        <NavPillButton
          label="Back"
          ariaLabel="Back to the start screen"
          tone="kitchen"
          surface="strong"
          onClick={() => { playClickSound(); stopVoice(); router.back(); }}
        />

        {/* alphabet-wide progress — never resets between groups */}
        <div className="min-w-0 flex-1" role="status" aria-label={`${lettersDone} of 26 letters in the soup`}>
          <ProgressBar
            value={lettersDone / LOWERCASE.length}
            trackClassName="h-3.5 w-full rounded-full bg-white/70 shadow-soft"
            fillClassName="mm-progress-fill h-full rounded-full"
          />
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
      <p className="relative z-10 mt-1.5 max-w-xl rounded-full bg-white/85 px-4 py-1.5 text-center font-rounded text-xs font-bold text-kitchen-ink shadow-soft md:text-sm">
        {clipText("magnet-intro")}
      </p>

      {/* ── main play area: chef standing beside the white cooking-station
             card; the card holds the pot + magnet tray (the reference's
             FULL KITCHEN → WHITE CARD → POT+LETTERS hierarchy) ── */}
      <div className="relative z-10 flex w-full max-w-3xl flex-1 items-center justify-center gap-[1.5vw] py-[2vh]">
        {/* the chef, on the counter beside the station — gentle idle
            breathing, bigger bounce on a correct match */}
        <motion.div
          className="mm-chef-level hidden shrink-0 sm:block"
          animate={chefHappy ? { y: [0, -10, 0] } : { y: [0, -3, 0] }}
          transition={chefHappy ? { duration: 0.5 } : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        >
          <ChefArt happy={chefHappy} />
        </motion.div>

        {/* the white cooking-station card */}
        <div
          className="mm-station relative flex items-center gap-[2.5vw] rounded-[2rem] bg-white/95 px-[2.2vw] py-[2.5vmin] shadow-card"
        >
        {/* the pot with its gray targets */}
        <div className="mm-pot relative">
          {/* living soup: two tiny bubbles + a steam wisp over the rim */}
          <motion.span className="absolute left-[38%] top-[6%] z-10 h-2 w-2 rounded-full bg-white/70" initial={{ y: 0, opacity: 0 }} animate={{ y: -16, opacity: [0, 0.8, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeOut" }} aria-hidden="true" />
          <motion.span className="absolute left-[58%] top-[8%] z-10 h-1.5 w-1.5 rounded-full bg-white/70" initial={{ y: 0, opacity: 0 }} animate={{ y: -12, opacity: [0, 0.7, 0] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut", delay: 1.2 }} aria-hidden="true" />
          <div className="mm-pot-art">
            <SoupPot />
          </div>
          {/* target slots — staggered inside the pot like the reference */}
          <div className="absolute inset-x-0 top-[14%] flex flex-col items-center gap-[2.5%]">
            {group.map((l, i) => {
              const isMatched = matched.includes(l);
              return (
                <motion.div
                  key={l}
                  ref={(el) => {
                    if (el) targetRefs.current.set(l, el);
                    else targetRefs.current.delete(l);
                  }}
                  className="mm-slot relative"
                  style={cssVars({ "--pl-ml": `${(i % 2 === 0 ? -1 : 1) * 14}%` })}
                  animate={wrongSlot === l ? { x: [-6, 6, -4, 4, 0] } : { x: 0 }}
                  transition={{ duration: 0.45 }}
                  role="img"
                  aria-label={isMatched ? `${l} — matched!` : `gray target letter ${l}`}
                >
                  {/* halo while dragging; brighter + swollen when the magnet
                      is hovering right over this slot */}
                  {drag && !isMatched && (
                    <motion.div
                      className="mm-slot-halo absolute -inset-2 rounded-3xl"
                      animate={{ opacity: hoverSlot === l ? 1 : 0.5, scale: hoverSlot === l ? 1.12 : 1 }}
                      transition={{ duration: 0.15 }}
                      aria-hidden="true"
                    />
                  )}
                  {/* landing burst: expanding ring + four sparkle dots */}
                  {burstSlot === l && (
                    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                      <motion.div
                        className="mm-burst-ring absolute inset-0 rounded-2xl"
                        initial={{ opacity: 0.8, scale: 1 }}
                        animate={{ opacity: 0, scale: 1.9 }}
                        transition={{ duration: 0.55, ease: "easeOut" }}
                      />
                      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dy], k) => (
                        <motion.span
                          key={k}
                          className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-kitchen-amber"
                          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                          animate={{ x: dx * 34, y: dy * 30, opacity: 0, scale: 0.4 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      ))}
                    </div>
                  )}
                  <AnimatePresence mode="wait" initial={false}>
                    {isMatched ? (
                      <motion.div key="filled" initial={{ scale: 1.35 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 16 }}>
                        <Magnet letter={l} colorIndex={group.indexOf(l)} size={slotSize} />
                      </motion.div>
                    ) : (
                      <motion.div key="gray" exit={{ opacity: 0 }}>
                        <Magnet letter={l} colorIndex={0} gray size={slotSize} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
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
                    className={`touch-none ${beingDragged ? "cursor-grabbing opacity-25" : "cursor-grab"}`}
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
      </div>

      {/* correct-drop flight: the magnet arcs from the drop point into its
          slot, shrinking from hand-size to slot-size, then land() fires */}
      {flying && (
        <motion.div
          className="pointer-events-none absolute z-40"
          initial={{ left: flying.fx, top: flying.fy }}
          animate={{ left: flying.tx, top: flying.ty }}
          transition={{ duration: 0.28, ease: [0.2, 0.8, 0.3, 1] }}
          onAnimationComplete={() => land(flying.letter)}
          aria-hidden="true"
        >
          <div className="pl-center-self">
            <motion.div initial={{ scale: 1.25, rotate: -4 }} animate={{ scale: 1, rotate: 0 }} transition={{ duration: 0.28 }}>
              <Magnet letter={flying.letter} colorIndex={group.indexOf(flying.letter)} size={slotSize} />
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* drag ghost — root-relative absolute (never position:fixed) */}
      {drag && (
        <div
          className="mm-ghost pl-at pointer-events-none absolute z-40"
          style={cssVars({ "--pl-x": `${drag.x}px`, "--pl-y": `${drag.y}px` })}
          aria-hidden="true"
        >
          <Magnet letter={drag.letter} colorIndex={group.indexOf(drag.letter)} size={magnetSize} />
        </div>
      )}

      {/* ── group complete — auto-advancing celebration ── */}
      <AnimatePresence>
        {celebrating && (
          <CelebrationOverlay tintClassName="mm-celebrate-tint" size={dims}>
            <motion.h2
              className="mm-cheer rounded-full bg-white/95 px-8 py-3 font-rounded font-black shadow-card"
              initial={{ scale: 0.5, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 15 }}
            >
              {clipText("magnet-excellent")}
            </motion.h2>
            <p className="font-rounded text-base font-bold text-kitchen-ink">
              {clipText("magnet-soup")} {groupIndex + 1} / {TOTAL_GROUPS}
            </p>
          </CelebrationOverlay>
        )}
      </AnimatePresence>
    </div>
  );
}
