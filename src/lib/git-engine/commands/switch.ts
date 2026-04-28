import type { CommandHandler, Commit, GitState } from "../types";

/**
 * Reconstruye workingDir/lastCommitted al snapshot del commit dado.
 * Si no hay commit (sha vacío), todo queda vacío.
 */
function checkoutSnapshot(
  state: GitState,
  sha: string,
): { workingDir: Record<string, string>; lastCommitted: Record<string, string> } {
  if (!sha) {
    return { workingDir: {}, lastCommitted: {} };
  }
  const commit: Commit | undefined = state.commits.find((c) => c.sha === sha);
  if (!commit) {
    return { workingDir: {}, lastCommitted: {} };
  }
  return {
    workingDir: { ...commit.files },
    lastCommitted: { ...commit.files },
  };
}

/**
 * `git switch <branch>`
 * `git switch -c <branch>` -> crea y cambia
 *
 * En este simulador, mantenemos los cambios sin commitear (workingDir/staging)
 * cuando es posible — es didáctico, no abortamos.
 */
export const switchCmd: CommandHandler = (state, parsed) => {
  const create =
    parsed.flags.c === true || typeof parsed.flags.c === "string";
  const name =
    typeof parsed.flags.c === "string"
      ? (parsed.flags.c as string)
      : parsed.args[0];

  if (!name) {
    return {
      output: [],
      error: ["fatal: missing branch or commit argument"],
      state,
    };
  }

  if (create) {
    if (state.refs.branches[name] !== undefined) {
      return {
        output: [],
        error: [`fatal: A branch named '${name}' already exists.`],
        state,
      };
    }
    const headTip = state.refs.branches[state.refs.HEAD] ?? "";
    return {
      output: [`Switched to a new branch '${name}'`],
      state: {
        ...state,
        refs: {
          HEAD: name,
          branches: { ...state.refs.branches, [name]: headTip },
        },
      },
      effect: { kind: "switch-branch", name },
    };
  }

  if (state.refs.branches[name] === undefined) {
    return {
      output: [],
      error: [`fatal: invalid reference: ${name}`],
      state,
    };
  }

  if (state.refs.HEAD === name) {
    return {
      output: [`Already on '${name}'`],
      state,
    };
  }

  const targetSha = state.refs.branches[name];
  const snap = checkoutSnapshot(state, targetSha);

  return {
    output: [`Switched to branch '${name}'`],
    state: {
      ...state,
      refs: { ...state.refs, HEAD: name },
      workingDir: snap.workingDir,
      lastCommitted: snap.lastCommitted,
      // Conservamos el staging tal cual (didáctico).
    },
    effect: { kind: "switch-branch", name },
  };
};
