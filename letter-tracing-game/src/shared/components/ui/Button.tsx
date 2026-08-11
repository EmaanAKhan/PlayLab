"use client";

import React from "react";
import { motion } from "framer-motion";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
}

const variantStyles: Record<string, string> = {
  primary:
    "bg-plum text-white shadow-button active:shadow-button-pressed active:translate-y-1",
  secondary:
    "bg-white text-plum border-2 border-plum shadow-soft active:shadow-none active:translate-y-1",
  ghost: "bg-white/60 text-plum shadow-soft active:bg-white/80",
};

const sizeStyles: Record<string, string> = {
  sm: "px-5 py-2 text-base rounded-2xl min-h-[44px] min-w-[44px]",
  md: "px-8 py-3 text-lg rounded-3xl min-h-[52px]",
  lg: "px-10 py-4 text-xl rounded-3xl min-h-[60px]",
  xl: "px-12 py-5 text-2xl rounded-4xl min-h-[72px]",
};

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  style,
  "aria-label": ariaLabel,
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={style}
      className={[
        "font-rounded font-bold select-none cursor-pointer transition-colors duration-150",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-plum/30",
        variantStyles[variant],
        sizeStyles[size],
        disabled ? "opacity-50 cursor-not-allowed" : "",
        className,
      ].join(" ")}
    >
      {children}
    </motion.button>
  );
}
