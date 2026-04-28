import type { CommandHandler } from "../types";

/**
 * Indica si un path está ignorado por la lista de patrones de .gitignore.
 * Soporta:
 *  - nombre exacto: "secret.env"
 *  - prefijo de carpeta: "node_modules/" o "node_modules"
 *  - glob simple final: "*.log"
 */
export function isIgnored(path: string, patterns: string[]): boolean {
  for (const raw of patterns) {
    const pat = raw.trim();
    if (!pat || pat.startsWith("#")) continue;

    // Glob simple "*.ext"
    if (pat.startsWith("*.")) {
      const ext = pat.slice(1); // ".ext"
      if (path.endsWith(ext)) return true;
      continue;
    }
    // Glob simple "prefix*"
    if (pat.endsWith("*") && !pat.startsWith("*")) {
      const prefix = pat.slice(0, -1);
      if (path.startsWith(prefix)) return true;
      continue;
    }
    // Carpeta con barra final
    if (pat.endsWith("/")) {
      if (path.startsWith(pat)) return true;
      continue;
    }
    // Coincidencia exacta o prefijo de carpeta
    if (path === pat) return true;
    if (path.startsWith(pat + "/")) return true;
  }
  return false;
}

/**
 * `git add <pathspec>` o `git add .`
 * Mueve archivos del workingDir al staging respetando .gitignore.
 */
export const addCmd: CommandHandler = (state, parsed) => {
  if (parsed.args.length === 0) {
    return {
      output: [],
      error: ["Nothing specified, nothing added."],
      state,
    };
  }

  const newStaging = { ...state.staging };
  const stagedPaths: string[] = [];
  const ignoredPaths: string[] = [];

  // Detecta el archivo .gitignore si existe en el workingDir y úsalo además
  // de la lista declarada en state.gitignore.
  const declaredPatterns = [...state.gitignore];
  if (typeof state.workingDir[".gitignore"] === "string") {
    for (const line of state.workingDir[".gitignore"].split("\n")) {
      declaredPatterns.push(line);
    }
  }

  // Resuelve qué paths candidatos vamos a añadir.
  let candidatePaths: string[] = [];
  for (const arg of parsed.args) {
    if (arg === "." || arg === "*") {
      candidatePaths.push(...Object.keys(state.workingDir));
    } else {
      // Si el arg coincide con un archivo concreto, agrégalo.
      if (state.workingDir[arg] !== undefined) {
        candidatePaths.push(arg);
      } else {
        // Si el arg termina con / o es prefijo de varios, expande.
        const prefix = arg.endsWith("/") ? arg : arg + "/";
        const matches = Object.keys(state.workingDir).filter((p) =>
          p.startsWith(prefix),
        );
        if (matches.length > 0) {
          candidatePaths.push(...matches);
        } else {
          return {
            output: [],
            error: [
              `fatal: pathspec '${arg}' did not match any files`,
            ],
            state,
          };
        }
      }
    }
  }

  // Deduplica.
  candidatePaths = Array.from(new Set(candidatePaths));

  for (const path of candidatePaths) {
    if (isIgnored(path, declaredPatterns)) {
      ignoredPaths.push(path);
      continue;
    }
    newStaging[path] = state.workingDir[path];
    stagedPaths.push(path);
  }

  const output: string[] = [];
  if (ignoredPaths.length > 0) {
    output.push(
      `Los siguientes archivos están en .gitignore y no se añadieron:`,
      ...ignoredPaths.map((p) => `  ${p}`),
    );
  }
  if (stagedPaths.length === 0 && ignoredPaths.length === 0) {
    output.push("No hay cambios nuevos para añadir.");
  }

  return {
    output,
    state: {
      ...state,
      staging: newStaging,
    },
    effect:
      stagedPaths.length > 0
        ? { kind: "stage", paths: stagedPaths }
        : undefined,
  };
};
