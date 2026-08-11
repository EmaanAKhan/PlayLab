import type { StickerDefinition, StickerTheme } from "@games/letter-tracing/types";

/** One sticker unlocked per completed letter, A–Z */
export const STICKERS: StickerDefinition[] = [
  { id: "flower",     name: "Flower",     icon: "flower",     color: "#FF9EBC" },
  { id: "butterfly",  name: "Butterfly",  icon: "butterfly",  color: "#B47FEB" },
  { id: "tree",       name: "Tree",       icon: "tree",       color: "#5DBE8A" },
  { id: "rainbow",    name: "Rainbow",    icon: "rainbow",    color: "#FF9F43" },
  { id: "bird",       name: "Bird",       icon: "bird",       color: "#54A0FF" },
  { id: "leaf",       name: "Leaf",       icon: "leaf",       color: "#1DD1A1" },
  { id: "sun",        name: "Sun",        icon: "sun",        color: "#FECA57" },
  { id: "cloud",      name: "Cloud",      icon: "cloud",      color: "#74B9FF" },
  { id: "star",       name: "Star",       icon: "star",       color: "#FDCB6E" },
  { id: "heart",      name: "Heart",      icon: "heart",      color: "#FD79A8" },
  { id: "moon",       name: "Moon",       icon: "moon",       color: "#6C5CE7" },
  { id: "apple",      name: "Apple",      icon: "apple",      color: "#FF6B6B" },
  { id: "balloon",    name: "Balloon",    icon: "balloon",    color: "#A29BFE" },
  { id: "cake",       name: "Cake",       icon: "cake",       color: "#FD7272" },
  { id: "diamond",    name: "Diamond",    icon: "diamond",    color: "#00D2D3" },
  { id: "egg",        name: "Egg",        icon: "egg",        color: "#F9CA24" },
  { id: "fish",       name: "Fish",       icon: "fish",       color: "#38ADA9" },
  { id: "gift",       name: "Gift",       icon: "gift",       color: "#E55039" },
  { id: "hat",        name: "Hat",        icon: "hat",        color: "#8854D0" },
  { id: "ice-cream",  name: "Ice Cream",  icon: "ice-cream",  color: "#FD9644" },
  { id: "jar",        name: "Jar",        icon: "jar",        color: "#26DE81" },
  { id: "kite",       name: "Kite",       icon: "kite",       color: "#FC5C65" },
  { id: "ladybug",    name: "Ladybug",    icon: "ladybug",    color: "#FF3F34" },
  { id: "mushroom",   name: "Mushroom",   icon: "mushroom",   color: "#EF5777" },
  { id: "nest",       name: "Nest",       icon: "nest",       color: "#D1A054" },
  { id: "owl",        name: "Owl",        icon: "owl",        color: "#778CA3" },
];

/** Theme unlocked every 5 letters */
export const BACKGROUND_THEMES: { threshold: number; theme: StickerTheme; label: string; colors: [string, string] }[] = [
  { threshold: 0,  theme: "garden",  label: "Garden",  colors: ["#C8F0D8", "#E8F8EF"] },
  { threshold: 5,  theme: "ocean",   label: "Ocean",   colors: ["#BDEEFF", "#EAF8FF"] },
  { threshold: 10, theme: "sky",     label: "Sky",     colors: ["#D4EEFF", "#EEF7FF"] },
  { threshold: 15, theme: "forest",  label: "Forest",  colors: ["#D6EAD0", "#EBF5E8"] },
  { threshold: 20, theme: "safari",  label: "Safari",  colors: ["#FAE8C6", "#FFF5E6"] },
  { threshold: 25, theme: "space",   label: "Space",   colors: ["#E0D8F5", "#F0EBFF"] },
];

export function getThemeForProgress(completedCount: number): StickerTheme {
  let theme: StickerTheme = "garden";
  for (const t of BACKGROUND_THEMES) {
    if (completedCount >= t.threshold) {
      theme = t.theme;
    }
  }
  return theme;
}

export function getThemeColors(theme: StickerTheme): [string, string] {
  const found = BACKGROUND_THEMES.find((t) => t.theme === theme);
  return found ? found.colors : ["#C8F0D8", "#E8F8EF"];
}
