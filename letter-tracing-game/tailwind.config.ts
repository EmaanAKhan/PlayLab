import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import { colors, motion, radii, shadows, toCssVariables } from "./src/shared/styles/tokens";

/**
 * Tailwind is the delivery mechanism for the design system defined in
 * src/shared/styles/tokens.ts — it never defines values of its own.
 *
 * The same token module also feeds a base plugin that emits every token as a
 * CSS custom property, so hand-written CSS (globals.css, the per-game style
 * sheets) and utility classes are guaranteed to agree.
 */
const config: Config = {
  content: [
    // MUST cover everywhere Tailwind classes are actually written. Note:
    // ./src/games and ./src/shared were previously missing — the games only
    // ever worked because a dead pre-refactor copy of their screens sat in
    // ./src/components and happened to contain the same class names, so
    // Tailwind generated them by accident. Deleting that dead code broke
    // every class used only by the games. These globs are the real fix.
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/games/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        rounded: ["Nunito", "Varela Round", "Arial Rounded MT Bold", "sans-serif"],
      },
      colors,
      borderRadius: radii,
      boxShadow: shadows,
      transitionTimingFunction: {
        settle: motion.easeSettle,
      },
      animation: {
        "float-slow": "float 6s ease-in-out infinite",
        "float-medium": "float 4s ease-in-out infinite",
        "bounce-gentle": "bounceGentle 2s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(0.97)" },
        },
      },
    },
  },
  plugins: [
    plugin(({ addBase }) => {
      addBase({ ":root": toCssVariables() });
    }),
  ],
};

export default config;
