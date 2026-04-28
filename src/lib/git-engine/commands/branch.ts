import type { CommandHandler } from "../types";

/**
 * `git branch`           -> lista ramas
 * `git branch <name>`    -> crea rama apuntando al HEAD actual
 * `git branch -d <name>` -> borra rama
 */
export const branchCmd: CommandHandler = (state, parsed) => {
  const deleteFlag =
    parsed.flags.d === true ||
    typeof parsed.flags.d === "string" ||
    parsed.flags.delete === true;

  // Borrar
  if (deleteFlag) {
    const name =
      typeof parsed.flags.d === "string"
        ? (parsed.flags.d as string)
        : parsed.args[0];
    if (!name) {
      return {
        output: [],
        error: ["fatal: branch name required"],
        state,
      };
    }
    if (!state.refs.branches[name]) {
      return {
        output: [],
        error: [`error: branch '${name}' not found.`],
        state,
      };
    }
    if (state.refs.HEAD === name) {
      return {
        output: [],
        error: [
          `error: Cannot delete branch '${name}' checked out at HEAD`,
        ],
        state,
      };
    }
    const newBranches = { ...state.refs.branches };
    delete newBranches[name];
    return {
      output: [`Deleted branch ${name}.`],
      state: {
        ...state,
        refs: { ...state.refs, branches: newBranches },
      },
    };
  }

  // Crear
  if (parsed.args.length > 0) {
    const name = parsed.args[0];
    if (state.refs.branches[name] !== undefined) {
      return {
        output: [],
        error: [`fatal: A branch named '${name}' already exists.`],
        state,
      };
    }
    const headTip = state.refs.branches[state.refs.HEAD] ?? "";
    return {
      output: [],
      state: {
        ...state,
        refs: {
          ...state.refs,
          branches: { ...state.refs.branches, [name]: headTip },
        },
      },
      effect: { kind: "branch-create", name },
    };
  }

  // Listar
  const names = Object.keys(state.refs.branches).sort();
  const lines = names.map((n) =>
    n === state.refs.HEAD ? `* ${n}` : `  ${n}`,
  );
  return { output: lines, state };
};
