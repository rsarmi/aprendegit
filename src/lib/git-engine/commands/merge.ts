import type { CommandHandler, Commit } from "../types";

/**
 * Determina si `ancestorSha` está en la cadena del primer parent de `tipSha`.
 * Es decir, si `currentBranch` puede hacer fast-forward hacia el target.
 */
function isAncestor(
  bySha: Record<string, Commit>,
  ancestorSha: string,
  tipSha: string,
): boolean {
  if (!ancestorSha) return true; // rama vacía siempre es ancestro
  let cursor: string | undefined = tipSha;
  const seen = new Set<string>();
  while (cursor) {
    if (seen.has(cursor)) break;
    seen.add(cursor);
    if (cursor === ancestorSha) return true;
    const c: Commit | undefined = bySha[cursor];
    if (!c) break;
    cursor = c.parents[0];
  }
  return false;
}

/**
 * `git merge <branch>` — solo soportamos fast-forward.
 * Si la rama actual es ancestro del target, avanzamos su tip al target.
 * Si no, mostramos un mensaje pedagógico y dejamos el estado intacto.
 */
export const mergeCmd: CommandHandler = (state, parsed) => {
  const target = parsed.args[0];
  if (!target) {
    return {
      output: [],
      error: ["fatal: No commit specified. Usa: git merge <rama>"],
      state,
    };
  }

  if (state.refs.branches[target] === undefined) {
    return {
      output: [],
      error: [`merge: ${target} - not something we can merge`],
      state,
    };
  }

  const currentBranch = state.refs.HEAD;
  const currentTip = state.refs.branches[currentBranch] ?? "";
  const targetTip = state.refs.branches[target];

  if (currentTip === targetTip) {
    return {
      output: ["Already up to date."],
      state,
    };
  }

  const bySha: Record<string, Commit> = {};
  for (const c of state.commits) bySha[c.sha] = c;

  // Fast-forward solo si currentTip es ancestro de targetTip.
  if (isAncestor(bySha, currentTip, targetTip)) {
    // Recolocar workingDir y lastCommitted al snapshot del target.
    const tipCommit = bySha[targetTip];
    const snapshotFiles = tipCommit ? { ...tipCommit.files } : {};
    return {
      output: [
        `Updating ${currentTip ? currentTip.slice(0, 7) : "0000000"}..${targetTip.slice(0, 7)}`,
        `Fast-forward`,
      ],
      state: {
        ...state,
        refs: {
          ...state.refs,
          branches: { ...state.refs.branches, [currentBranch]: targetTip },
        },
        workingDir: snapshotFiles,
        lastCommitted: snapshotFiles,
      },
    };
  }

  // No es fast-forward: en esta versión simulada no hacemos merge real.
  return {
    output: [
      "non-fast-forward, quedaría como ejercicio futuro",
      "Pista: en este simulador solo se soporta fast-forward por ahora.",
    ],
    state,
  };
};
