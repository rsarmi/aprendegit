"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

export interface ProgressBarProps {
  slugs: string[];
  currentSlug: string;
  completed: Set<string>;
  className?: string;
}

/**
 * Horizontal pill bar showing progress through the lesson sequence. Each
 * lesson is a small segment; completed ones turn green, the current one
 * pulses, pending ones are muted.
 */
export function ProgressBar({
  slugs,
  currentSlug,
  completed,
  className,
}: ProgressBarProps) {
  const reduce = useReducedMotion();
  const total = slugs.length || 1;
  const doneCount = slugs.reduce(
    (acc, s) => (completed.has(s) ? acc + 1 : acc),
    0,
  );
  const pct = Math.round((doneCount / total) * 100);

  return (
    <div className={cn("flex items-center gap-3 w-full max-w-xl", className)}>
      <div
        className="flex-1 flex items-center gap-1.5"
        role="progressbar"
        aria-valuenow={doneCount}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`Progreso: ${doneCount} de ${total} lecciones`}
      >
        {slugs.map((slug) => {
          const isDone = completed.has(slug);
          const isCurrent = slug === currentSlug;
          return (
            <Link
              key={slug}
              href={`/lecciones/${slug}`}
              aria-label={slug}
              aria-current={isCurrent ? "step" : undefined}
              className="group relative flex-1 min-w-[12px]"
            >
              <motion.span
                initial={false}
                animate={{
                  opacity: isDone || isCurrent ? 1 : 0.6,
                }}
                transition={reduce ? { duration: 0 } : { duration: 0.2 }}
                className={cn(
                  "block h-2 rounded-full transition-colors",
                  isDone
                    ? "bg-success"
                    : isCurrent
                      ? "bg-accent animate-pulseGlow"
                      : "bg-bg-soft",
                )}
              />
            </Link>
          );
        })}
      </div>
      <span className="text-ink-dim text-xs font-mono shrink-0 hidden sm:block">
        {doneCount}/{total} · {pct}%
      </span>
    </div>
  );
}
