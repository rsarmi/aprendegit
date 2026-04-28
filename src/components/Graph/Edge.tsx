"use client";

import { motion, useReducedMotion } from "framer-motion";

export interface EdgeProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color?: string;
}

/**
 * A single edge between a child commit (`from`) and its parent (`to`).
 *
 * If both points share the same column we draw a straight vertical line.
 * Otherwise we draw a smooth Bezier curve so cross-branch links read as
 * "this rama nace de aquella rama".
 */
export function Edge({ from, to, color = "#6b7699" }: EdgeProps) {
  const reduceMotion = useReducedMotion();

  const sameColumn = Math.abs(from.x - to.x) < 0.5;
  const d = sameColumn
    ? `M ${from.x} ${from.y} L ${to.x} ${to.y}`
    : (() => {
        // Smooth S-curve. Control points are pulled vertically so the curve
        // hugs the columns near both endpoints.
        const midY = (from.y + to.y) / 2;
        const c1x = from.x;
        const c1y = midY;
        const c2x = to.x;
        const c2y = midY;
        return `M ${from.x} ${from.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${to.x} ${to.y}`;
      })();

  return (
    <motion.path
      d={d}
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      fill="none"
      initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.4, ease: "easeOut" }}
    />
  );
}

export default Edge;
