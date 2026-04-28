import type { CommandHandler, Commit, RemoteState } from "../types";

/**
 * `git push origin <branch>` o sin args usa la rama actual.
 * Copia los commits que falten al remote y actualiza remote.branches[branch].
 */
export const pushCmd: CommandHandler = (state, parsed) => {
  if (!state.remote) {
    return {
      output: [],
      error: [
        "fatal: No configured push destination.",
        "Pista: usa `git remote add origin <url>` antes de hacer push.",
      ],
      state,
    };
  }

  // git push [<remote>] [<branch>]
  // args[0] suele ser el nombre del remote ("origin"); args[1] la rama.
  const branch =
    (parsed.args[1] as string | undefined) ?? state.refs.HEAD;

  if (!state.refs.branches[branch]) {
    return {
      output: [],
      error: [`error: src refspec ${branch} does not match any.`],
      state,
    };
  }

  // Recorremos la cadena de commits desde el tip local hacia atrás
  // y nos quedamos con los que aún no están en remote.commits.
  const localBySha: Record<string, Commit> = {};
  for (const c of state.commits) localBySha[c.sha] = c;

  const remoteShas = new Set(state.remote.commits.map((c) => c.sha));
  const newCommits: Commit[] = [];
  let cursor: string | undefined = state.refs.branches[branch];
  const seen = new Set<string>();
  while (cursor && !remoteShas.has(cursor)) {
    if (seen.has(cursor)) break;
    seen.add(cursor);
    const c: Commit | undefined = localBySha[cursor];
    if (!c) break;
    newCommits.unshift(c); // mantener orden cronológico
    cursor = c.parents[0];
  }

  const newRemote: RemoteState = {
    ...state.remote,
    commits: [...state.remote.commits, ...newCommits],
    branches: {
      ...state.remote.branches,
      [branch]: state.refs.branches[branch],
    },
  };

  const newShas = newCommits.map((c) => c.sha);

  const output: string[] = [];
  output.push(
    `To ${state.remote.url}`,
    `   ${newShas.length === 0 ? "Everything up-to-date" : `[new] ${branch} -> ${branch}`}`,
  );

  return {
    output,
    state: { ...state, remote: newRemote },
    effect: { kind: "push", branch, commits: newShas },
  };
};
