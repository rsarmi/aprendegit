"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

export interface HistoryEntry {
  input: string;
  output: string[];
  error?: string[];
  ts: number;
}

export interface HistoryProps {
  entries: HistoryEntry[];
  className?: string;
}

const lineVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0 },
};

export function History({ entries, className }: HistoryProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "px-4 py-3 font-mono text-sm leading-relaxed",
        className,
      )}
      role="log"
      aria-live="polite"
    >
      {entries.length === 0 ? (
        <p className="text-ink-dim italic">
          Escribe un comando para empezar. Prueba con <span className="text-accent">git status</span>.
        </p>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry, i) => {
            const isSuccess = !entry.error || entry.error.length === 0;
            return (
              <li key={`${entry.ts}-${i}`} className="group">
                <motion.div
                  initial={reduceMotion ? false : "hidden"}
                  animate="visible"
                  variants={lineVariants}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="flex items-start gap-2"
                >
                  <span className="text-accent select-none shrink-0">$</span>
                  <span className="text-ink whitespace-pre-wrap break-all">
                    {entry.input}
                  </span>
                  {isSuccess && (
                    <span
                      aria-hidden
                      className="ml-auto text-success opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      title="Comando ejecutado"
                    >
                      ✓
                    </span>
                  )}
                </motion.div>

                {entry.output.length > 0 && (
                  <div className="mt-1 pl-4 space-y-0.5">
                    {entry.output.map((line, j) => (
                      <motion.p
                        key={`o-${j}`}
                        initial={reduceMotion ? false : "hidden"}
                        animate="visible"
                        variants={lineVariants}
                        transition={{
                          duration: 0.18,
                          ease: "easeOut",
                          delay: reduceMotion ? 0 : 0.02 * j,
                        }}
                        className="text-ink-soft whitespace-pre"
                      >
                        {line}
                      </motion.p>
                    ))}
                  </div>
                )}

                {entry.error && entry.error.length > 0 && (
                  <div className="mt-1 pl-4 space-y-0.5">
                    {entry.error.map((line, j) => (
                      <motion.p
                        key={`e-${j}`}
                        initial={reduceMotion ? false : "hidden"}
                        animate="visible"
                        variants={lineVariants}
                        transition={{
                          duration: 0.18,
                          ease: "easeOut",
                          delay: reduceMotion ? 0 : 0.02 * j,
                        }}
                        className="text-danger whitespace-pre"
                      >
                        {line}
                      </motion.p>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
