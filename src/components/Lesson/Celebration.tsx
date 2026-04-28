"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import { Button } from "@/components/ui/Button";

export interface CelebrationProps {
  visible: boolean;
  onContinue: () => void;
  /** Override the default "Siguiente lección" CTA label. */
  continueLabel?: string;
  /** Optional override for the heading. */
  title?: string;
  /** Optional secondary text under the title. */
  subtitle?: string;
}

const CONFETTI_COLORS = [
  "#7c5cff",
  "#a48cff",
  "#3ddc97",
  "#ffb454",
  "#ff6b6b",
  "#e6ecff",
];

interface Particle {
  left: number;
  delay: number;
  duration: number;
  rotate: number;
  color: string;
  size: number;
}

function buildParticles(seed = 0): Particle[] {
  // Deterministic enough for a single render; particles don't need to be
  // truly random across renders, just visually varied.
  const out: Particle[] = [];
  const count = 16;
  for (let i = 0; i < count; i++) {
    const t = (i + seed) / count;
    out.push({
      left: (t * 97 + 3) % 100,
      delay: (i % 6) * 0.08,
      duration: 1.6 + ((i * 13) % 9) / 10,
      rotate: ((i * 47) % 360) - 180,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 8 + (i % 4) * 3,
    });
  }
  return out;
}

/**
 * Full-screen overlay shown once the lesson's challenge succeeds. Shows a
 * shower of confetti particles, a celebratory message, and a CTA to advance.
 */
export function Celebration({
  visible,
  onContinue,
  continueLabel = "Siguiente lección",
  title = "¡Lo lograste!",
  subtitle = "Has completado el reto. Bien hecho.",
}: CelebrationProps) {
  const reduce = useReducedMotion();
  const particles = useMemo(() => buildParticles(), []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="celebration"
          role="dialog"
          aria-modal="true"
          aria-label="Reto superado"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm"
        >
          {!reduce && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {particles.map((p, i) => (
                <motion.svg
                  key={i}
                  width={p.size}
                  height={p.size}
                  viewBox="0 0 10 10"
                  className="absolute"
                  style={{ left: `${p.left}%`, top: -20 }}
                  initial={{ y: -40, rotate: 0, opacity: 0 }}
                  animate={{
                    y: ["-5%", "110vh"],
                    rotate: [0, p.rotate, p.rotate * 2],
                    opacity: [0, 1, 1, 0.7],
                  }}
                  transition={{
                    duration: p.duration,
                    delay: p.delay,
                    ease: "easeIn",
                    repeat: Infinity,
                    repeatDelay: 0.4,
                  }}
                >
                  <rect
                    x="0"
                    y="0"
                    width="10"
                    height="10"
                    rx="2"
                    fill={p.color}
                  />
                </motion.svg>
              ))}
            </div>
          )}

          <motion.div
            initial={reduce ? false : { scale: 0.9, y: 8, opacity: 0 }}
            animate={reduce ? undefined : { scale: 1, y: 0, opacity: 1 }}
            exit={reduce ? undefined : { scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative z-10 mx-4 max-w-md rounded-2xl border border-white/10 bg-bg-card p-8 text-center shadow-glow"
          >
            <div className="text-5xl mb-3" aria-hidden>
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                className="mx-auto text-success"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M7 12.5l3 3 7-7"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-ink mb-2">{title}</h2>
            <p className="text-ink-soft mb-6">{subtitle}</p>
            <Button variant="primary" size="lg" onClick={onContinue}>
              {continueLabel}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
