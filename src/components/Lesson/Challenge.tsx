"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Hint } from "./Hint";
import { cn } from "@/lib/cn";

export interface ChallengeProps {
  prompt: string;
  hint: string;
  className?: string;
}

/**
 * Highlighted card with the lesson's challenge prompt and a button to reveal
 * the hint. Validation is owned by the parent `LessonShell`.
 */
export function Challenge({ prompt, hint, className }: ChallengeProps) {
  const reduce = useReducedMotion();
  const [showHint, setShowHint] = useState(false);
  const paragraphs = prompt.split(/\n\n+/).filter(Boolean);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card
        className={cn(
          "border-accent/40 bg-gradient-to-br from-accent/10 via-bg-card/80 to-bg-card/80",
          className,
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <Badge variant="accent">Reto</Badge>
        </div>
        <div className="space-y-2 text-ink leading-relaxed">
          {paragraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-wrap">
              {p}
            </p>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowHint((v) => !v)}
            aria-expanded={showHint}
          >
            {showHint ? "Ocultar pista" : "Ver pista"}
          </Button>
        </div>
        <Hint open={showHint}>{hint}</Hint>
      </Card>
    </motion.div>
  );
}
