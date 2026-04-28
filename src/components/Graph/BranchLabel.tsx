"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import type { Sha } from "@/lib/git-engine/types";

export interface BranchLabelProps {
  name: string;
  sha: Sha;
  color?: string;
  isHead?: boolean;
  /** Position in SVG coordinates. The label is rendered as a foreignObject
   *  so we can use Tailwind classes for nice typography. */
  x: number;
  y: number;
}

/**
 * Colored pill with the branch name. Shares a `layoutId` so when HEAD or a
 * branch ref jumps to another commit (commit, switch, push…) Framer Motion
 * anima la transición.
 */
export function BranchLabel({
  name,
  sha,
  color = "#7c5cff",
  isHead = false,
  x,
  y,
}: BranchLabelProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.g
      layoutId={`ref:${name}`}
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: y - 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 240,
        damping: 24,
      }}
    >
      <foreignObject x={x - 60} y={y - 14} width={120} height={28}>
        <div
          className={cn(
            "flex items-center justify-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
            "border shadow-sm select-none",
          )}
          style={{
            backgroundColor: `${color}22`,
            borderColor: color,
            color,
          }}
          title={`${name} → ${sha.slice(0, 7)}`}
        >
          {isHead && (
            <span
              className="rounded-sm bg-accent px-1 py-px text-[9px] font-bold uppercase tracking-wide text-accent-ink"
              style={{ backgroundColor: color, color: "#0b1020" }}
            >
              HEAD
            </span>
          )}
          <span className="font-mono">{name}</span>
        </div>
      </foreignObject>
    </motion.g>
  );
}

export default BranchLabel;
