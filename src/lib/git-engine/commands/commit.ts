import type { Commit, CommandHandler } from "../types";
import { genSha } from "../engine";

/**
 * `git commit -m "msg"`
 * Toma el contenido del staging y crea un commit nuevo.
 * - parents: el tip de la rama actual (si existe).
 * - branches[currentBranch] -> sha del nuevo commit.
 * - lastCommitted = snapshot del staging (lo que acaba de quedar registrado).
 * - Limpia staging.
 */
export const commitCmd: CommandHandler = (state, parsed) => {
  const message =
    typeof parsed.flags.m === "string"
      ? (parsed.flags.m as string)
      : typeof parsed.flags.message === "string"
        ? (parsed.flags.message as string)
        : "";

  if (!message) {
    return {
      output: [],
      error: [
        "fatal: necesitas un mensaje. Usa: git commit -m \"tu mensaje\"",
      ],
      state,
    };
  }

  const stagedKeys = Object.keys(state.staging);
  if (stagedKeys.length === 0) {
    return {
      output: [],
      error: [
        "nothing to commit, working tree clean",
      ],
      state,
    };
  }

  const branch = state.refs.HEAD;
  const parentSha = state.refs.branches[branch];
  const parents: string[] = parentSha ? [parentSha] : [];

  const author =
    state.config.user
      ? `${state.config.user.name} <${state.config.user.email}>`
      : "Tu Amigo <amigo@ejemplo.com>";

  // El nuevo snapshot mezcla lo último committeado con lo que se está
  // staged ahora (los archivos staged sobreescriben).
  const snapshot: Record<string, string> = {
    ...state.lastCommitted,
    ...state.staging,
  };

  const commit: Commit = {
    sha: genSha(),
    parents,
    message,
    author,
    timestamp: Date.now(),
    files: snapshot,
  };

  const newState = {
    ...state,
    commits: [...state.commits, commit],
    lastCommitted: snapshot,
    staging: {},
    refs: {
      ...state.refs,
      branches: {
        ...state.refs.branches,
        [branch]: commit.sha,
      },
    },
  };

  return {
    output: [
      `[${branch} ${commit.sha}] ${message}`,
      ` ${stagedKeys.length} file${stagedKeys.length === 1 ? "" : "s"} changed`,
    ],
    state: newState,
    effect: { kind: "commit", sha: commit.sha, branch },
  };
};
