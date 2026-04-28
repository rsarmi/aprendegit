"use client";

import { motion, useReducedMotion } from "framer-motion";

export interface HeadIndicatorProps {
  /** Center of the commit HEAD points at. */
  x: number;
  y: number;
  /** True when HEAD is detached (not attached to a branch). */
  detached?: boolean;
  color?: string;
}

/**
 * Small triangle pointer used when HEAD is detached. When `detached` is false
 * we render nothing — the regular `BranchLabel` already shows the HEAD badge.
 */
export function HeadIndicator({
  x,
  y,
  detached = false,
  color = "#ffb454",
}: HeadIndicatorProps) {
  const reduceMotion = useReducedMotion();
  if (!detached) return null;

  // Small downward-pointing triangle floating above the commit.
  const ty = y - 30;
  const points = `${x - 6},${ty - 8} ${x + 6},${ty - 8} ${x},${ty}`;

  return (
    <motion.g
      layoutId="ref:HEAD"
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
    >
      <polygon points={points} fill={color} />
      <text
        x={x}
        y={ty - 12}
        textAnchor="middle"
        fontSize={9}
        className="font-mono fill-warn"
      >
        HEAD
      </text>
    </motion.g>
  );
}

export default HeadIndicator;
