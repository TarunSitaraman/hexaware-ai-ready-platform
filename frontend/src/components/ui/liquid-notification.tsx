"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiquidGlassCardProps {
  children: React.ReactNode;
  width?: string;
  height?: string;
  expandedWidth?: string;
  expandedHeight?: string;
  expandable?: boolean;
  draggable?: boolean;
  shadowIntensity?: "sm" | "md" | "lg" | "xl" | "2xl";
  blurIntensity?: "sm" | "md" | "lg" | "xl" | "2xl";
  glowIntensity?: "sm" | "md" | "lg" | "xl";
  borderRadius?: string;
  className?: string;
}

const shadowMap = {
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  "2xl": "shadow-2xl",
};

const blurMap = {
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl",
  "2xl": "backdrop-blur-2xl",
};

const glowMap = {
  sm: "after:shadow-[0_0_10px_rgba(255,255,255,0.1)]",
  md: "after:shadow-[0_0_20px_rgba(255,255,255,0.2)]",
  lg: "after:shadow-[0_0_30px_rgba(255,255,255,0.3)]",
  xl: "after:shadow-[0_0_40px_rgba(255,255,255,0.4)]",
};

export function LiquidGlassCard({
  children,
  width = "auto",
  height = "auto",
  expandedWidth,
  expandedHeight,
  expandable = false,
  draggable = false,
  shadowIntensity = "md",
  blurIntensity = "md",
  glowIntensity = "md",
  borderRadius = "16px",
  className,
}: LiquidGlassCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    if (expandable) {
      setIsExpanded(!isExpanded);
    }
  };

  const currentWidth = isExpanded && expandedWidth ? expandedWidth : width;
  const currentHeight = isExpanded && expandedHeight ? expandedHeight : height;

  return (
    <motion.div
      drag={draggable}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onClick={toggleExpand}
      initial={false}
      animate={{
        width: currentWidth,
        height: currentHeight,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 1,
      }}
      style={{ borderRadius }}
      className={cn(
        "relative cursor-pointer select-none",
        "bg-white/10 dark:bg-black/20",
        "border border-white/20 dark:border-white/10",
        "overflow-hidden",
        shadowMap[shadowIntensity],
        blurMap[blurIntensity],
        // Subtle liquid specular highlight at the top
        "before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/30 before:to-transparent before:pointer-events-none",
        // Internal glow effect
        "after:absolute after:inset-0 after:pointer-events-none after:rounded-[inherit]",
        glowMap[glowIntensity],
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
}
