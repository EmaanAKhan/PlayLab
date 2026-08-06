import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        rounded: ["Nunito", "Varela Round", "Arial Rounded MT Bold", "sans-serif"],
      },
      colors: {
        sky: {
          pastel: "#D4EEFF",
        },
        peach: {
          DEFAULT: "#FFD6BC",
          soft: "#FFEADE",
        },
        mint: {
          DEFAULT: "#C8F0D8",
          soft: "#E5F7ED",
        },
        lavender: {
          DEFAULT: "#DDD5F5",
          soft: "#EEE9FF",
        },
        sunshine: {
          DEFAULT: "#FFF0B3",
          soft: "#FFFADD",
        },
        coral: {
          DEFAULT: "#FF8B6A",
          light: "#FFBDA8",
        },
        plum: {
          DEFAULT: "#7C5CBF",
          light: "#A882E8",
        },
        jade: {
          DEFAULT: "#3DAA72",
          light: "#66CC94",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
        "5xl": "3rem",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(0,0,0,0.08)",
        card: "0 8px 32px rgba(0,0,0,0.1)",
        button: "0 6px 0 rgba(0,0,0,0.12)",
        "button-pressed": "0 2px 0 rgba(0,0,0,0.12)",
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
  plugins: [],
};

export default config;
