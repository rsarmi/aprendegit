import type { CommandHandler, RemoteState } from "../types";

/**
 * `git remote`              -> lista nombres
 * `git remote -v`           -> lista con URL
 * `git remote add <name> <url>` -> añade un remote (solo soportamos uno)
 */
export const remoteCmd: CommandHandler = (state, parsed) => {
  const sub = parsed.args[0];

  // git remote add origin <url>
  if (sub === "add") {
    const name = parsed.args[1];
    const url = parsed.args[2];
    if (!name || !url) {
      return {
        output: [],
        error: ["usage: git remote add <name> <url>"],
        state,
      };
    }
    if (state.remote && state.remote.name === name) {
      return {
        output: [],
        error: [`error: remote ${name} already exists.`],
        state,
      };
    }
    const remote: RemoteState = {
      name,
      url,
      commits: [],
      branches: {},
      pullRequests: [],
    };
    return {
      output: [],
      state: { ...state, remote },
      effect: { kind: "remote-add", name },
    };
  }

  // git remote remove <name>
  if (sub === "remove" || sub === "rm") {
    const name = parsed.args[1];
    if (!state.remote || state.remote.name !== name) {
      return {
        output: [],
        error: [`error: No such remote: '${name}'`],
        state,
      };
    }
    return {
      output: [],
      state: { ...state, remote: undefined },
    };
  }

  // git remote -v / git remote
  const verbose =
    parsed.flags.v === true || parsed.flags.verbose === true;

  if (!state.remote) {
    return { output: [], state };
  }

  if (verbose) {
    return {
      output: [
        `${state.remote.name}\t${state.remote.url} (fetch)`,
        `${state.remote.name}\t${state.remote.url} (push)`,
      ],
      state,
    };
  }

  return { output: [state.remote.name], state };
};
