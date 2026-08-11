"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GAMES } from "@games/registry";

/**
 * Game Portal — styled as a simple, calm picture-book page: cream paper, a
 * thin ink frame, big friendly game tiles. Cards render from the registry;
 * adding a game there makes it appear here automatically.
 */
export default function PortalHome() {
  return (
    <div
      className="flex h-full w-full items-center justify-center overflow-y-auto overflow-x-hidden px-4 py-6"
      style={{ background: "#EFE7D8" }}
    >
      {/* The page */}
      <motion.div
        className="relative flex w-full max-w-2xl flex-col items-center gap-8 rounded-2xl px-6 py-10 shadow-xl md:px-12"
        style={{
          background: "#FDF9F0",
          border: "1px solid #E3D9C6",
          boxShadow: "0 12px 40px rgba(90,72,50,0.18), inset 0 0 0 10px #FDF9F0, inset 0 0 0 11px #EADFC9",
        }}
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Title, like a book heading */}
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-center font-rounded text-4xl font-black text-plum md:text-5xl">
            Little Learners
          </h1>
          <div className="mt-1 h-1 w-24 rounded-full" style={{ background: "#E3D9C6" }} aria-hidden="true" />
          <p className="mt-1 font-rounded text-sm font-semibold text-plum/45">
            Pick a game
          </p>
        </div>

        {/* Game tiles */}
        <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2">
          {GAMES.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 + i * 0.08, duration: 0.35 }}
            >
              <Link href={game.route} aria-label={`Play ${game.title} — ${game.description}`}>
                <motion.div
                  className="flex flex-col items-center gap-2 rounded-2xl px-6 py-8"
                  style={{
                    background: "white",
                    border: `2.5px solid ${game.colors.border}`,
                  }}
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <span className="leading-none" style={{ fontSize: "clamp(44px, 8vw, 64px)" }} aria-hidden="true">
                    {game.glyph}
                  </span>
                  <span className="font-rounded text-2xl font-black" style={{ color: game.colors.text }}>
                    {game.title}
                  </span>
                  <span className="text-center font-rounded text-sm font-semibold text-plum/45">
                    {game.description}
                  </span>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Page-corner curl */}
        <svg
          className="pointer-events-none absolute bottom-0 right-0"
          width="46" height="46" viewBox="0 0 46 46" aria-hidden="true"
        >
          <path d="M46 0 L46 46 L0 46 Q30 42 42 30 Q46 20 46 0 Z" fill="#F3ECDD" />
          <path d="M46 46 L14 46 Q34 40 46 14 Z" fill="#E8DFCB" />
        </svg>
      </motion.div>
    </div>
  );
}
