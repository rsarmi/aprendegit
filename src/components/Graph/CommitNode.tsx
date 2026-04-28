"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import type { Sha } from "@/lib/git-engine/types";

export interface CommitNodeProps {
  sha: Sha;
  cx: number;
  cy: number;
  color?: string;
  message?: string;
  isHead?: boolean;
}

/**
 * A 24px circle with the short SHA below.
 *
 * `layoutId` is shared across graphs so when the same commit appears in a
 * different graph (e.g. tras un push, en el remoto) Framer Motion la mueve
 * suavemente entre ambos contenedores.
 */
export function CommitNode({
  sha,
  cx,
  cy,
  color = "#7c5cff",
  message,
  isHead = false,
}: CommitNodeProps) {
  const reduceMotion = useReducedMotion();
  const shortSha = sha.slice(0, 7);

  return (
    <motion.g
      layoutId={`commit:${sha}`}
      initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 280, damping: 22 }
      }
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    >
      {/* Title element gives us a free native tooltip. */}
      <title>{message ?? shortSha}</title>

      {isHead && (
        <motion.circle
          cx={cx}
          cy={cy}
          fill="none"
          stroke={color}
          strokeWidth={2}
          initial={{ r: 18, opacity: 0.4 }}
          animate={
            reduceMotion
              ? { r: 18, opacity: 0.4 }
              : {
                  r: [16, 22, 16],
                  opacity: [0.45, 0.05, 0.45],
                }
          }
          transition={{
            duration: 1.6,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      )}

      <circle
        cx={cx}
        cy={cy}
        r={12}
        fill={color}
        stroke="#0b1020"
        strokeWidth={2}
        className={cn(isHead && "drop-shadow-[0_0_12px_rgba(124,92,255,0.6)]")}
      />

      <text
        x={cx}
        y={cy + 28}
        textAnchor="middle"
        className="fill-ink-dim font-mono"
        fontSize={10}
      >
        {shortSha}
      </text>
    </motion.g>
  );
}

export default CommitNode;
