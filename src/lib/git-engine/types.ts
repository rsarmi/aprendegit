/**
 * Core types for the simulated git engine. These are the contract that the
 * engine, the components and the lessons all share. Keep them stable.
 */

export type Sha = string;

export interface FileBlob {
  path: string;
  content: string;
}

export interface Commit {
  sha: Sha;
  parents: Sha[];
  message: string;
  author: string;
  timestamp: number;
  files: Record<string, string>; // snapshot path -> content
}

export interface PullRequest {
  id: number;
  title: string;
  body: string;
  fromBranch: string;
  toBranch: string;
  state: "open" | "merged" | "closed";
  createdAt: number;
}

export interface RemoteState {
  name: string; // "origin"
  url: string; // ficticio: github.com/tu-amigo/aprendegit
  commits: Commit[];
  branches: Record<string, Sha>;
  pullRequests: PullRequest[];
}

export interface GitState {
  initialized: boolean;
  workingDir: Record<string, string>;
  staging: Record<string, string>;
  // Last committed snapshot for diff comparison
  lastCommitted: Record<string, string>;
  commits: Commit[];
  refs: {
    HEAD: string; // "main" o sha si está en detached
    branches: Record<string, Sha>;
  };
  gitignore: string[];
  config: { user?: { name: string; email: string } };
  remote?: RemoteState;
}

export interface ParsedCommand {
  /** raw input as the user typed it */
  raw: string;
  /** primary command, e.g. "git" */
  bin: string;
  /** subcommand, e.g. "commit" */
  cmd: string;
  /** positional args (after subcommand, after stripping flags) */
  args: string[];
  /** boolean and value flags. e.g. -m "msg" -> { m: "msg" }; -a -> { a: true } */
  flags: Record<string, string | boolean>;
}

export interface CommandResult {
  /** stdout-style lines for the terminal history */
  output: string[];
  /** stderr-style lines (rendered red) */
  error?: string[];
  /** updated state. Use the SAME state if nothing changed. */
  state: GitState;
  /** optional UI hint emitted by the command (e.g. "push", "merge") so the
   * components can play a one-shot animation in addition to the state diff */
  effect?: GitEffect;
}

export type GitEffect =
  | { kind: "init" }
  | { kind: "stage"; paths: string[] }
  | { kind: "unstage"; paths: string[] }
  | { kind: "commit"; sha: Sha; branch: string }
  | { kind: "branch-create"; name: string }
  | { kind: "switch-branch"; name: string }
  | { kind: "remote-add"; name: string }
  | { kind: "push"; branch: string; commits: Sha[] }
  | { kind: "pull"; branch: string; commits: Sha[] }
  | { kind: "pr-open"; prId: number }
  | { kind: "pr-merge"; prId: number };

export type CommandHandler = (
  state: GitState,
  parsed: ParsedCommand,
) => CommandResult;

/** A canonical empty state (before `git init`) */
export const emptyState: GitState = {
  initialized: false,
  workingDir: {},
  staging: {},
  lastCommitted: {},
  commits: [],
  refs: { HEAD: "main", branches: {} },
  gitignore: [],
  config: {},
};

export function freshState(seedFiles: Record<string, string> = {}): GitState {
  return {
    ...emptyState,
    workingDir: { ...seedFiles },
  };
}
