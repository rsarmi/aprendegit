"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

export interface PushAnimationProps {
  direction: "push" | "pull" | null;
  onDone: () => void;
}

const DURATION = 1.2;
const PARTICLES = 4;

/**
 * PushAnimation — overlay decorativo que muestra una fila de partículas
 * cruzando entre "local" y "remote" para visualizar `git push` y `git pull`.
 *
 * Se monta cuando `direction` no es null, dispara la animación durante 1.2s
 * y luego invoca `onDone` para que el padre vuelva a poner `direction = null`.
 */
export function PushAnimation({ direction, onDone }: PushAnimationProps) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!direction) return;
    const ms = reduceMotion ? 0 : DURATION * 1000;
    const id = window.setTimeout(onDone, ms);
    return () => window.clearTimeout(id);
  }, [direction, onDone, reduceMotion]);

  return (
    <AnimatePresence>
      {direction && (
        <motion.div
          key={direction}
          aria-hidden
          className={cn(
            "pointer-events-none fixed inset-0 z-50 flex items-center justify-center",
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="relative flex w-[min(640px,80vw)] items-center justify-between rounded-2xl border border-white/10 bg-bg-card/80 px-6 py-4 shadow-glow backdrop-blur">
            <Endpoint label="local" side="left" active={direction === "pull"} />
            <div className="relative mx-4 h-2 flex-1 overflow-hidden rounded-full bg-white/5">
              {Array.from({ length: PARTICLES }).map((_, i) => (
                <Particle
                  key={i}
                  index={i}
                  direction={direction}
                  reduceMotion={reduceMotion}
                />
              ))}
            </div>
            <Endpoint label="remote" side="right" active={direction === "push"} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ParticleProps {
  index: number;
  direction: "push" | "pull";
  reduceMotion: boolean | null;
}

function Particle({ index, direction, reduceMotion }: ParticleProps) {
  const fromLeft = direction === "push";
  const initialX = fromLeft ? "-10%" : "110%";
  const finalX = fromLeft ? "110%" : "-10%";

  return (
    <motion.span
      className={cn(
        "absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full",
        direction === "push" ? "bg-accent" : "bg-success",
      )}
      style={{ left: 0, boxShadow: "0 0 12px currentColor" }}
      initial={{ x: initialX, opacity: 0 }}
      animate={{
        x: reduceMotion ? finalX : finalX,
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: reduceMotion ? 0 : DURATION,
        delay: reduceMotion ? 0 : index * 0.12,
        ease: "easeInOut",
        times: [0, 0.15, 0.85, 1],
      }}
    />
  );
}

interface EndpointProps {
  label: string;
  side: "left" | "right";
  active: boolean;
}

function Endpoint({ label, side, active }: EndpointProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1",
        side === "left" ? "items-start" : "items-end",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-bold transition-colors",
          active
            ? "border-accent bg-accent/20 text-accent-soft"
            : "border-white/10 bg-bg-soft text-ink-soft",
        )}
        aria-hidden
      >
        {side === "left" ? "💻" : "🐙"}
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-dim">
        {label}
      </span>
    </div>
  );
}

export default PushAnimation;
