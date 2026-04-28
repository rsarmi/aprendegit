import type { ParsedCommand } from "./types";

/**
 * Tokeniza una línea como `git commit -m "mi mensaje"` respetando comillas.
 */
export function tokenize(input: string): string[] {
  const out: string[] = [];
  let buf = "";
  let quote: '"' | "'" | null = null;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quote) {
      if (ch === quote) {
        quote = null;
      } else {
        buf += ch;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === " " || ch === "\t") {
      if (buf.length) {
        out.push(buf);
        buf = "";
      }
      continue;
    }
    buf += ch;
  }
  if (buf.length) out.push(buf);
  return out;
}

/**
 * Parsea una entrada de terminal a `ParsedCommand`.
 * Soporta:
 *  - `git <cmd> [args] [flags]`
 *  - flags cortas con valor (`-m "msg"`) y largas con `=` (`--message=msg`).
 *  - flags booleanas (`-a`, `--all`).
 */
export function parseCommand(raw: string): ParsedCommand | null {
  const tokens = tokenize(raw.trim());
  if (tokens.length === 0) return null;
  const bin = tokens[0];
  const cmd = tokens[1] ?? "";
  const rest = tokens.slice(2);

  const args: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (let i = 0; i < rest.length; i++) {
    const t = rest[i];
    if (t.startsWith("--")) {
      const eq = t.indexOf("=");
      if (eq !== -1) {
        flags[t.slice(2, eq)] = t.slice(eq + 1);
      } else {
        const next = rest[i + 1];
        if (next && !next.startsWith("-")) {
          flags[t.slice(2)] = next;
          i++;
        } else {
          flags[t.slice(2)] = true;
        }
      }
    } else if (t.startsWith("-") && t.length > 1) {
      const key = t.slice(1);
      // multi-char short flags like -am are split: { a: true, m: nextValue? }
      if (key.length > 1) {
        for (let k = 0; k < key.length; k++) flags[key[k]] = true;
        // last short flag may consume next token as value
        const lastKey = key[key.length - 1];
        const next = rest[i + 1];
        if (next && !next.startsWith("-")) {
          flags[lastKey] = next;
          i++;
        }
      } else {
        const next = rest[i + 1];
        if (next && !next.startsWith("-")) {
          flags[key] = next;
          i++;
        } else {
          flags[key] = true;
        }
      }
    } else {
      args.push(t);
    }
  }

  return { raw, bin, cmd, args, flags };
}
