"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useGitStore } from "@/store/useGitStore";
import { Button } from "@/components/ui/Button";
import { Step } from "./Step";
import { Challenge } from "./Challenge";
import { Celebration } from "./Celebration";
import { cn } from "@/lib/cn";
import type { Lesson } from "@/types/lesson";

const navLinkBase =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium h-10 px-4 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg";
const navLinkPrimary =
  "bg-accent text-accent-ink hover:bg-accent-soft shadow-glow";
const navLinkGhost = "text-ink-soft hover:text-ink hover:bg-white/5";

export interface LessonShellProps {
  lesson: Lesson;
  /** Optional slot for the live workspace (terminal + graph + remote). */
  children?: ReactNode;
}

/**
 * Shell that renders an entire lesson: intro, steps, challenge, navigation,
 * and the celebration overlay. It is responsible for resetting the git store
 * to the lesson's initial state and observing the success condition.
 */
export function LessonShell({ lesson, children }: LessonShellProps) {
  const reduce = useReducedMotion();
  const [completed, setCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const fired = useRef(false);

  // Reset the git store to the lesson's initial state on mount / lesson change.
  useEffect(() => {
    fired.current = false;
    setCompleted(false);
    setShowCelebration(false);
    useGitStore.getState().resetTo(lesson.initialState);
  }, [lesson.slug, lesson.initialState]);

  // Subscribe to the store and watch for the challenge's success condition.
  useEffect(() => {
    const unsub = useGitStore.subscribe((state) => {
      if (fired.current) return;
      try {
        if (lesson.challenge.successCondition(state.git, state.history)) {
          fired.current = true;
          setCompleted(true);
          setShowCelebration(true);
          useGitStore.getState().markCompleted(lesson.slug);
        }
      } catch {
        // Defensive: a malformed condition shouldn't crash the shell.
      }
    });
    return unsub;
  }, [lesson.slug, lesson.challenge]);

  const introParagraphs = lesson.intro.split(/\n\n+/).filter(Boolean);

  const stepContainer = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  };

  const stepItem = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-10">
      {/* Intro */}
      <motion.section
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="space-y-4"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-ink tracking-tight">
          {lesson.title}
        </h1>
        <div className="space-y-3 text-ink-soft text-base leading-relaxed max-w-2xl">
          {introParagraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-wrap">
              {p}
            </p>
          ))}
        </div>
      </motion.section>

      {/* Optional workspace slot (terminal/graph/remote) */}
      {children && <section>{children}</section>}

      {/* Steps */}
      <motion.section
        variants={reduce ? undefined : stepContainer}
        initial={reduce ? false : "hidden"}
        animate={reduce ? undefined : "visible"}
        className="space-y-4"
        aria-label="Pasos de la lección"
      >
        {lesson.steps.map((step, i) => (
          <motion.div key={i} variants={reduce ? undefined : stepItem}>
            <Step index={i} title={step.title} body={step.body} />
          </motion.div>
        ))}
      </motion.section>

      {/* Challenge */}
      <section aria-label="Reto de la lección">
        <Challenge
          prompt={lesson.challenge.prompt}
          hint={lesson.challenge.hint}
        />
      </section>

      {/* Navigation */}
      <nav
        className="flex items-center justify-between pt-4 border-t border-white/5"
        aria-label="Navegación entre lecciones"
      >
        <div>
          {lesson.prev ? (
            <Link
              href={`/lecciones/${lesson.prev}`}
              className={cn(navLinkBase, navLinkGhost)}
            >
              ← Anterior
            </Link>
          ) : (
            <span aria-hidden />
          )}
        </div>
        <div className="flex items-center gap-3">
          {completed && (
            <span className="text-success text-sm font-medium">
              Completada
            </span>
          )}
          {lesson.next ? (
            <Link
              href={`/lecciones/${lesson.next}`}
              className={cn(navLinkBase, navLinkPrimary)}
            >
              Siguiente →
            </Link>
          ) : (
            <Button variant="secondary" size="md" disabled>
              Última lección
            </Button>
          )}
        </div>
      </nav>

      {/* Celebration overlay */}
      <Celebration
        visible={showCelebration}
        onContinue={() => {
          setShowCelebration(false);
          if (lesson.next && typeof window !== "undefined") {
            window.location.href = `/lecciones/${lesson.next}`;
          }
        }}
        continueLabel={lesson.next ? "Siguiente lección" : "Cerrar"}
      />
    </div>
  );
}
