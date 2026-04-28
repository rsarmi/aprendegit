"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

export interface StepProps {
  index: number;
  title: string;
  body: string;
  className?: string;
}

/**
 * Single instructional step inside a lesson. Renders inside a `Card` with a
 * numbered circle and the step's body. The body splits on \n\n into paragraphs.
 */
export function Step({ index, title, body, className }: StepProps) {
  const reduce = useReducedMotion();
  const paragraphs = body.split(/\n\n+/).filter(Boolean);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Card className={cn("flex gap-4", className)}>
        <div
          aria-hidden
          className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-accent-soft border border-accent/30 font-mono text-sm"
        >
          {index + 1}
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="text-ink font-semibold text-lg">{title}</h3>
          <div className="space-y-2 text-ink-soft text-sm leading-relaxed">
            {paragraphs.map((p, i) => (
              <p key={i} className="whitespace-pre-wrap">
                {p}
              </p>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
