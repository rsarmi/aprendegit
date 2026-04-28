import type { CommandHandler, Commit } from "../types";

/**
 * `git pull origin <branch>` (o sin args usa branch actual).
 * Copia commits del remote al local que no estén ya y avanza la rama local
 * al tip remoto.
 */
export const pullCmd: CommandHandler = (state, parsed) => {
  if (!state.remote) {
    return {
      output: [],
      error: [
        "fatal: No remote configured. Usa `git remote add origin <url>` primero.",
      ],
      state,
    };
  }

  const branch =
    (parsed.args[1] as string | undefined) ?? state.refs.HEAD;

  const remoteTip = state.remote.branches[branch];
  if (!remoteTip) {
    return {
      output: [],
      error: [
        `Your configuration specifies to merge with the ref '${branch}' from the remote, but no such ref was fetched.`,
      ],
      state,
    };
  }

  const localShas = new Set(state.commits.map((c) => c.sha));
  const remoteBySha: Record<string, Commit> = {};
  for (const c of state.remote.commits) remoteBySha[c.sha] = c;

  // Recorremos la cadena en remote desde el tip hasta el primer commit que
  // ya tengamos local.
  const newCommits: Commit[] = [];
  let cursor: string | undefined = remoteTip;
  const seen = new Set<string>();
  while (cursor && !localShas.has(cursor)) {
    if (seen.has(cursor)) break;
    seen.add(cursor);
    const c: Commit | undefined = remoteBySha[cursor];
    if (!c) break;
    newCommits.unshift(c);
    cursor = c.parents[0];
  }

  if (newCommits.length === 0) {
    return {
      output: ["Already up to date."],
      state,
    };
  }

  const newCommitsList = [...state.commits, ...newCommits];
  // Actualizamos workingDir / lastCommitted al snapshot del nuevo tip
  // siempre que sea la rama actual.
  const isCurrent = state.refs.HEAD === branch;
  const tipCommit = newCommits[newCommits.length - 1];
  const newWorkingDir = isCurrent
    ? { ...tipCommit.files }
    : state.workingDir;
  const newLastCommitted = isCurrent
    ? { ...tipCommit.files }
    : state.lastCommitted;

  const newShas = newCommits.map((c) => c.sha);

  return {
    output: [
      `From ${state.remote.url}`,
      `   ${branch} -> origin/${branch}`,
      `Updating ${branch} (${newCommits.length} commit${newCommits.length === 1 ? "" : "s"})`,
    ],
    state: {
      ...state,
      commits: newCommitsList,
      refs: {
        ...state.refs,
        branches: { ...state.refs.branches, [branch]: remoteTip },
      },
      workingDir: newWorkingDir,
      lastCommitted: newLastCommitted,
    },
    effect: { kind: "pull", branch, commits: newShas },
  };
};
