import type {
  CommandHandler,
  CommandResult,
  GitState,
  ParsedCommand,
} from "./types";
import { parseCommand } from "./parser";
import { commandMap } from "./commands";

/**
 * Genera un sha aleatorio de 7 caracteres hexadecimales.
 * Suficiente para que se vea como un sha corto de git real.
 */
export function genSha(): string {
  // Math.random().toString(16) produce un decimal hex; nos quedamos con 7 chars.
  let sha = Math.random().toString(16).slice(2, 9);
  // Garantía de longitud 7: si por casualidad sale corto, padea con 0.
  if (sha.length < 7) sha = sha.padEnd(7, "0");
  return sha;
}

/**
 * Comandos que requieren un repositorio inicializado para ejecutarse.
 * `init` y `config` no lo requieren; `clone` tampoco aplicaría aquí.
 */
const COMMANDS_REQUIRING_INIT = new Set<string>([
  "add",
  "commit",
  "status",
  "log",
  "diff",
  "rm",
  "branch",
  "switch",
  "checkout",
  "remote",
  "push",
  "pull",
  "merge",
]);

/**
 * Construye un resultado de error sin alterar el estado.
 */
function errorResult(state: GitState, lines: string[]): CommandResult {
  return {
    output: [],
    error: lines,
    state,
  };
}

/**
 * Punto de entrada del motor: parsea y despacha el comando al handler
 * correspondiente. Mantiene la inmutabilidad del estado: cada handler
 * devuelve un `GitState` nuevo (o el mismo si no hubo cambios).
 */
export function runCommand(state: GitState, raw: string): CommandResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { output: [], state };
  }

  const parsed: ParsedCommand | null = parseCommand(trimmed);
  if (!parsed) {
    return { output: [], state };
  }

  // Si el binario no es git, simulamos el shell.
  if (parsed.bin !== "git") {
    return errorResult(state, [`bash: ${parsed.bin}: command not found`]);
  }

  // git sin subcomando: mensaje de ayuda mínimo.
  if (!parsed.cmd) {
    return errorResult(state, [
      "usage: git <command> [<args>]",
      "Prueba con `git init`, `git status`, `git add .`, `git commit -m \"...\"`.",
    ]);
  }

  const handler: CommandHandler | undefined = commandMap[parsed.cmd];
  if (!handler) {
    return errorResult(state, [
      `git: '${parsed.cmd}' is not a git command. See 'git --help'.`,
    ]);
  }

  // Validación de repo inicializado.
  if (!state.initialized && COMMANDS_REQUIRING_INIT.has(parsed.cmd)) {
    return errorResult(state, [
      "fatal: not a git repository (or any of the parent directories): .git",
    ]);
  }

  return handler(state, parsed);
}
