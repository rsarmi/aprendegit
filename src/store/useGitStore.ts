import { create } from "zustand";
import { persist, type PersistStorage, type StorageValue } from "zustand/middleware";
import { runCommand as runCommandEngine } from "@/lib/git-engine/engine";
import { emptyState, type GitEffect, type GitState } from "@/lib/git-engine/types";

export interface HistoryEntry {
  input: string;
  output: string[];
  error?: string[];
  ts: number;
  effect?: GitEffect;
}

export interface GitStore {
  git: GitState;
  history: HistoryEntry[];
  /** Sólo los inputs del usuario para flechas ↑↓ */
  inputHistory: string[];
  completed: Set<string>;
  /** Último effect que disparó un comando, para animaciones one-shot */
  pendingEffect: GitEffect | null;

  runCommand: (input: string) => void;
  resetTo: (state: GitState) => void;
  clearTerminal: () => void;
  markCompleted: (slug: string) => void;
  /** Limpia pendingEffect tras animar */
  consumeEffect: () => void;
}

/**
 * Persisted shape (sólo `completed`, serializado como array para sobrevivir a JSON).
 */
interface PersistedShape {
  completed: string[];
}

/**
 * Storage adaptado para serializar el `Set<string>` como array. Usa
 * `localStorage` en cliente y un no-op en SSR.
 */
const completedStorage: PersistStorage<PersistedShape> = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(name);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StorageValue<PersistedShape>;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name) => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(name);
  },
};

export const useGitStore = create<GitStore>()(
  persist<GitStore, [], [], PersistedShape>(
    (set, get) => ({
      git: { ...emptyState },
      history: [],
      inputHistory: [],
      completed: new Set<string>(),
      pendingEffect: null,

      runCommand: (input: string) => {
        // Línea en blanco: añade entrada vacía al historial y termina.
        if (input.trim() === "") {
          set((s) => ({
            history: [
              ...s.history,
              { input: "", output: [], ts: Date.now() },
            ],
          }));
          return;
        }

        const result = runCommandEngine(get().git, input);

        set((s) => {
          const lastInput = s.inputHistory[s.inputHistory.length - 1];
          const nextInputHistory =
            lastInput === input
              ? s.inputHistory
              : [...s.inputHistory, input];

          return {
            git: result.state,
            history: [
              ...s.history,
              {
                input,
                output: result.output,
                error: result.error,
                ts: Date.now(),
                effect: result.effect,
              },
            ],
            inputHistory: nextInputHistory,
            pendingEffect: result.effect ?? null,
          };
        });
      },

      resetTo: (state: GitState) => {
        set({
          git: state,
          history: [],
          inputHistory: [],
          pendingEffect: null,
        });
      },

      clearTerminal: () => {
        set({ history: [] });
      },

      markCompleted: (slug: string) => {
        set((s) => {
          if (s.completed.has(slug)) return s;
          const next = new Set(s.completed);
          next.add(slug);
          return { completed: next };
        });
      },

      consumeEffect: () => {
        set({ pendingEffect: null });
      },
    }),
    {
      name: "aprendegit:completed",
      storage: completedStorage,
      partialize: (state): PersistedShape => ({
        completed: Array.from(state.completed),
      }),
      merge: (persisted, current) => {
        const list =
          (persisted as PersistedShape | undefined)?.completed ?? [];
        return {
          ...current,
          completed: new Set<string>(list),
        };
      },
    },
  ),
);
