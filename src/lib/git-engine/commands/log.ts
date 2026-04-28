import type { CommandHandler, Commit } from "../types";

/**
 * `git log [--oneline]`
 * Recorre la cadena de commits desde el tip de la rama actual hacia atrás
 * siguiendo el primer parent.
 */
export const logCmd: CommandHandler = (state, parsed) => {
  const branch = state.refs.HEAD;
  const tip = state.refs.branches[branch];
  const oneline =
    parsed.flags.oneline === true || parsed.flags.oneline === "true";

  if (!tip) {
    return {
      output: [],
      error: [
        `fatal: your current branch '${branch}' does not have any commits yet`,
      ],
      state,
    };
  }

  // Index de commits por sha para recorrido rápido.
  const bySha: Record<string, Commit> = {};
  for (const c of state.commits) bySha[c.sha] = c;

  const lines: string[] = [];
  let currentSha: string | undefined = tip;
  const visited = new Set<string>();

  while (currentSha) {
    if (visited.has(currentSha)) break;
    visited.add(currentSha);
    const commit: Commit | undefined = bySha[currentSha];
    if (!commit) break;

    if (oneline) {
      lines.push(`${commit.sha} ${commit.message}`);
    } else {
      lines.push(`commit ${commit.sha}`);
      lines.push(`Author: ${commit.author}`);
      lines.push(`Date:   ${new Date(commit.timestamp).toUTCString()}`);
      lines.push("");
      lines.push(`    ${commit.message}`);
      lines.push("");
    }
    // Sigue el primer padre.
    currentSha = commit.parents[0];
  }

  return { output: lines, state };
};
