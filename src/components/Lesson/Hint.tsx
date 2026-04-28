"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface HintProps {
  /** Custom CTA label. Defaults to "¿Necesitas una pista?". */
  text?: string;
  children?: ReactNode;
  className?: string;
  /** Force open state from parent (used by Challenge "Ver pista" button). */
  open?: boolean;
  defaultOpen?: boolean;
}

/**
 * Disclosure component that hides a hint until the user opts in to seeing it.
 * Can be controlled (via `open`) or uncontrolled (clickable summary).
 */
export function Hint({
  text = "¿Necesitas una pista?",
  children,
  className,
  open: controlledOpen,
  defaultOpen = false,
}: HintProps) {
  const reduce = useReducedMotion();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const isControlled = controlledOpen !== undefined;

  return (
    <div className={cn("text-sm", className)}>
      {!isControlled && (
        <button
          type="button"
          onClick={() => setInternalOpen((v) => !v)}
          className="text-accent-soft hover:text-accent transition-colors font-medium"
          aria-expanded={open}
        >
          {open ? "Ocultar pista" : text}
        </button>
      )}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="hint-content"
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={reduce ? undefined : { opacity: 1, height: "auto" }}
            exit={reduce ? undefined : { opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-xl border border-warn/30 bg-warn/10 px-4 py-3 text-ink-soft">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
