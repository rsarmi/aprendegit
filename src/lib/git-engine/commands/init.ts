import type { CommandHandler } from "../types";

/**
 * `git init`
 * Marca el repo como inicializado y crea la rama por defecto `main`
 * apuntando a "" (sin commits aún).
 */
export const initCmd: CommandHandler = (state) => {
  if (state.initialized) {
    return {
      output: [
        "Reinitialized existing Git repository in .git/",
      ],
      state,
    };
  }

  const newState = {
    ...state,
    initialized: true,
    refs: {
      HEAD: "main",
      branches: {
        ...state.refs.branches,
        main: state.refs.branches.main ?? "",
      },
    },
  };

  return {
    output: [
      "Initialized empty Git repository in .git/",
      "Rama por defecto: main",
    ],
    state: newState,
    effect: { kind: "init" },
  };
};
