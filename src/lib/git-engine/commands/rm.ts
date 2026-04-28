import type { CommandHandler } from "../types";

/**
 * `git rm <path>` (versión simulada y didáctica)
 * Quita el archivo del workingDir y del staging.
 */
export const rmCmd: CommandHandler = (state, parsed) => {
  if (parsed.args.length === 0) {
    return {
      output: [],
      error: ["fatal: No pathspec was given. Usa: git rm <archivo>"],
      state,
    };
  }

  const newWorkingDir = { ...state.workingDir };
  const newStaging = { ...state.staging };
  const removed: string[] = [];

  for (const path of parsed.args) {
    if (
      newWorkingDir[path] === undefined &&
      newStaging[path] === undefined &&
      state.lastCommitted[path] === undefined
    ) {
      return {
        output: [],
        error: [`fatal: pathspec '${path}' did not match any files`],
        state,
      };
    }
    delete newWorkingDir[path];
    delete newStaging[path];
    removed.push(path);
  }

  return {
    output: removed.map((p) => `rm '${p}'`),
    state: {
      ...state,
      workingDir: newWorkingDir,
      staging: newStaging,
    },
  };
};
