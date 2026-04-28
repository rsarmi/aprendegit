import type { CommandHandler } from "../types";

/**
 * `git config [--global] user.name "X"` o `user.email "x@y.com"`
 * Soporta también la lectura sin valor: `git config user.name`.
 * `--global` es ignorado (este es un repo simulado).
 */
export const configCmd: CommandHandler = (state, parsed) => {
  // Filtra el flag --global; el resto debe ser key + (opcional value).
  const args = [...parsed.args];
  if (args.length === 0) {
    return {
      output: [],
      error: ["usage: git config [--global] <key> [<value>]"],
      state,
    };
  }

  const key = args[0];
  const value = args[1];

  // Lectura
  if (value === undefined) {
    if (key === "user.name") {
      return {
        output: state.config.user ? [state.config.user.name] : [],
        state,
      };
    }
    if (key === "user.email") {
      return {
        output: state.config.user ? [state.config.user.email] : [],
        state,
      };
    }
    return { output: [], state };
  }

  // Escritura
  const currentUser = state.config.user ?? { name: "", email: "" };
  let newUser = { ...currentUser };
  if (key === "user.name") {
    newUser = { ...newUser, name: value };
  } else if (key === "user.email") {
    newUser = { ...newUser, email: value };
  } else {
    // Para otros keys los aceptamos silenciosamente (simulado).
    return { output: [], state };
  }

  return {
    output: [],
    state: {
      ...state,
      config: { ...state.config, user: newUser },
    },
  };
};
