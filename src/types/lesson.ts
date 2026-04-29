import type { GitState } from "@/lib/git-engine/types";

/**
 * Single instructional step inside a lesson. Pure data; rendered by `Step`.
 */
export interface LessonStep {
  title: string;
  body: string;
}

/**
 * Final challenge of a lesson. The `successCondition` is evaluated against the
 * latest git state and command history every time the store updates.
 */
export interface LessonChallenge {
  prompt: string;
  successCondition: (
    state: GitState,
    history: { input: string }[],
  ) => boolean;
  hint: string;
}

/**
 * Top-level lesson contract. Lesson modules export an object that satisfies
 * this interface; the lesson shell consumes it and renders the UI.
 */
export interface Lesson {
  slug: string;
  title: string;
  /** markdown-lite (texto plano con \n). \n\n separates paragraphs. */
  intro: string;
  initialState: GitState;
  steps: LessonStep[];
  challenge: LessonChallenge;
  next?: string;
  prev?: string;
  showRemote?: boolean;
  /**
   * "auto" (default): la lección se completa cuando `successCondition` es true.
   * "manual": pura lectura. El alumno pulsa "Listo, lo entendí" para completarla.
   */
  mode?: "auto" | "manual";
  /** Mostrar el panel "áreas de trabajo" (working dir / staging / commits). */
  showAreas?: boolean;
}
