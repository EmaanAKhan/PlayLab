"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { FloatingClouds } from "@shared/components/animations/FloatingClouds";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(160deg, #E8F4FF 0%, #F0E8FF 50%, #E8FFE8 100%)" }}
    >
      <FloatingClouds />

      {/* Subtle background dots */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {Array.from({ length: 16 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-plum/10"
            style={{
              width: 6 + (i % 3) * 4,
              height: 6 + (i % 3) * 4,
              left: `${(i * 67 + 12) % 90}%`,
              top: `${(i * 53 + 8) % 90}%`,
            }}
            animate={{ y: [0, -8, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3 + (i % 4), delay: i * 0.2, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Logo */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-6"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Letter mascots */}
        <div className="flex items-end gap-3">
          {["A", "B", "C"].map((letter, i) => (
            <motion.div
              key={letter}
              className="flex h-16 w-14 items-center justify-center rounded-2xl shadow-card"
              style={{
                background: ["#DDD5F5", "#FFD6BC", "#C8F0D8"][i],
                border: `3px solid ${["#A882E8", "#FFAA80", "#66CC94"][i]}`,
              }}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.12, type: "spring", stiffness: 260, damping: 18 }}
            >
              <span className="font-rounded text-3xl font-black" style={{ color: ["#7C5CBF", "#E07040", "#3DAA72"][i] }}>
                {letter}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Title */}
        <motion.div
          className="text-center"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.6 }}
        >
          <h1 className="font-rounded text-4xl font-black tracking-tight text-plum drop-shadow-sm">
            Letter Tracing
          </h1>
          <p className="mt-1 font-rounded text-lg font-semibold text-plum/60">
            Learn the alphabet
          </p>
        </motion.div>

        {/* Loading dots */}
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2.5 w-2.5 rounded-full bg-plum/40"
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.9, delay: i * 0.18, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
