import type { CommandHandler } from "../types";
import { isIgnored } from "./add";

/**
 * `git status`
 * Compara workingDir, staging y lastCommitted y muestra el estado tipo git real.
 */
export const statusCmd: CommandHandler = (state) => {
  const branch = state.refs.HEAD;
  const lastCommitted = state.lastCommitted;
  const staging = state.staging;
  const workingDir = state.workingDir;

  // .gitignore declarado en estado + el del workingDir si existe.
  const patterns = [...state.gitignore];
  if (typeof workingDir[".gitignore"] === "string") {
    for (const line of workingDir[".gitignore"].split("\n")) {
      patterns.push(line);
    }
  }

  const stagedNew: string[] = [];
  const stagedModified: string[] = [];
  const stagedDeleted: string[] = [];
  for (const path of Object.keys(staging)) {
    if (lastCommitted[path] === undefined) {
      stagedNew.push(path);
    } else if (lastCommitted[path] !== staging[path]) {
      stagedModified.push(path);
    }
  }
  // Archivos borrados que estaban committeados y ya no están en staging
  // ni en workingDir tampoco; los reportamos como deleted-in-working.
  const modifiedNotStaged: string[] = [];
  const deletedNotStaged: string[] = [];
  for (const path of Object.keys(lastCommitted)) {
    if (workingDir[path] === undefined) {
      deletedNotStaged.push(path);
    } else if (workingDir[path] !== lastCommitted[path]) {
      // Solo lo marcamos como "no staged" si el staging no refleja ya el cambio.
      if (staging[path] !== workingDir[path]) {
        modifiedNotStaged.push(path);
      }
    }
  }

  const untracked: string[] = [];
  const ignored: string[] = [];
  for (const path of Object.keys(workingDir)) {
    if (lastCommitted[path] !== undefined) continue;
    if (staging[path] !== undefined) continue;
    if (isIgnored(path, patterns)) {
      ignored.push(path);
    } else {
      untracked.push(path);
    }
  }

  const output: string[] = [];
  output.push(`On branch ${branch}`);

  const hasStaged =
    stagedNew.length + stagedModified.length + stagedDeleted.length > 0;
  const hasUnstaged = modifiedNotStaged.length + deletedNotStaged.length > 0;
  const hasUntracked = untracked.length > 0;

  if (!hasStaged && !hasUnstaged && !hasUntracked) {
    output.push("nothing to commit, working tree clean");
    return { output, state };
  }

  if (hasStaged) {
    output.push("Changes to be committed:");
    output.push('  (use "git rm --cached <file>..." to unstage)');
    for (const p of stagedNew) output.push(`\tnew file:   ${p}`);
    for (const p of stagedModified) output.push(`\tmodified:   ${p}`);
    for (const p of stagedDeleted) output.push(`\tdeleted:    ${p}`);
    output.push("");
  }

  if (hasUnstaged) {
    output.push("Changes not staged for commit:");
    output.push('  (use "git add <file>..." to update what will be committed)');
    for (const p of modifiedNotStaged) output.push(`\tmodified:   ${p}`);
    for (const p of deletedNotStaged) output.push(`\tdeleted:    ${p}`);
    output.push("");
  }

  if (hasUntracked) {
    output.push("Untracked files:");
    output.push('  (use "git add <file>..." to include in what will be committed)');
    for (const p of untracked) output.push(`\t${p}`);
    output.push("");
  }

  if (ignored.length > 0) {
    output.push("Ignored files (.gitignore):");
    for (const p of ignored) output.push(`\t${p}`);
  }

  return { output, state };
};
