import type { CommandHandler } from "../types";

/**
 * Diff "lite" entre dos snapshots de archivos.
 * Para cada archivo modificado, prefijamos las líneas viejas con `-` y las
 * nuevas con `+` en bloque. No es un LCS; es suficiente para enseñar.
 */
function diffSnapshots(
  before: Record<string, string>,
  after: Record<string, string>,
): string[] {
  const lines: string[] = [];
  const allPaths = new Set<string>([
    ...Object.keys(before),
    ...Object.keys(after),
  ]);

  for (const path of Array.from(allPaths).sort()) {
    const oldContent = before[path];
    const newContent = after[path];
    if (oldContent === newContent) continue;

    lines.push(`diff --git a/${path} b/${path}`);
    if (oldContent === undefined) {
      lines.push(`new file: ${path}`);
      lines.push(`--- /dev/null`);
      lines.push(`+++ b/${path}`);
      for (const ln of (newContent ?? "").split("\n")) {
        lines.push(`+ ${ln}`);
      }
    } else if (newContent === undefined) {
      lines.push(`deleted file: ${path}`);
      lines.push(`--- a/${path}`);
      lines.push(`+++ /dev/null`);
      for (const ln of oldContent.split("\n")) {
        lines.push(`- ${ln}`);
      }
    } else {
      lines.push(`--- a/${path}`);
      lines.push(`+++ b/${path}`);
      for (const ln of oldContent.split("\n")) {
        lines.push(`- ${ln}`);
      }
      for (const ln of newContent.split("\n")) {
        lines.push(`+ ${ln}`);
      }
    }
  }

  return lines;
}

/**
 * `git diff` o `git diff --staged`
 *  - sin flag: lastCommitted vs workingDir
 *  - --staged / --cached: lastCommitted vs staging
 */
export const diffCmd: CommandHandler = (state, parsed) => {
  const staged =
    parsed.flags.staged === true ||
    parsed.flags.staged === "true" ||
    parsed.flags.cached === true ||
    parsed.flags.cached === "true";

  const before = state.lastCommitted;
  const after = staged ? state.staging : state.workingDir;

  const lines = diffSnapshots(
    before,
    // Cuando es staged, "after" es el staging (que solo contiene lo añadido);
    // pero si hubo commits previos queremos ver el delta solo de lo staged.
    // Para no marcar como "deleted" archivos que simplemente no se añadieron,
    // mezclamos lastCommitted como base implícita.
    staged ? { ...before, ...after } : after,
  );

  if (lines.length === 0) {
    return { output: [], state };
  }
  return { output: lines, state };
};
