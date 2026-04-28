"use client";

import { cn } from "@/lib/cn";

export interface QuickCommand {
  label: string;
  /** Texto que se inserta en el input. */
  text: string;
  /** Posición opcional del caret tras la inserción (índice dentro de `text`). */
  caret?: number;
}

export interface QuickCommandsProps {
  /**
   * Inserta texto sin posicionamiento de caret. Recibe el texto literal del chip.
   */
  onInsert: (text: string) => void;
  /**
   * Inserta texto y posiciona el caret en `caretPos`. Si no se provee, se usa
   * `onInsert`.
   */
  onInsertWithCaret?: (text: string, caretPos: number) => void;
  /**
   * Override de la lista por defecto.
   */
  commands?: QuickCommand[];
  /**
   * Por defecto solo es visible en pantallas < md (móvil). Si `alwaysVisible`
   * es true, se muestra siempre.
   */
  alwaysVisible?: boolean;
  className?: string;
}

export const DEFAULT_QUICK_COMMANDS: QuickCommand[] = [
  { label: "status", text: "git status" },
  { label: "add .", text: "git add ." },
  // El caret cae entre las comillas: `git commit -m "` <-- aquí
  { label: 'commit -m ""', text: 'git commit -m ""', caret: 'git commit -m "'.length },
  { label: "log --oneline", text: "git log --oneline" },
  { label: "branch", text: "git branch" },
  { label: "switch -c", text: "git switch -c feature/", caret: "git switch -c feature/".length },
  { label: "push origin", text: "git push origin " , caret: "git push origin ".length },
  { label: "pull origin", text: "git pull origin ", caret: "git pull origin ".length },
];

export function QuickCommands({
  onInsert,
  onInsertWithCaret,
  commands = DEFAULT_QUICK_COMMANDS,
  alwaysVisible = false,
  className,
}: QuickCommandsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 px-4 py-3 border-t border-white/10",
        alwaysVisible ? "" : "md:hidden",
        className,
      )}
      role="toolbar"
      aria-label="Comandos rápidos"
    >
      {commands.map((c) => (
        <button
          key={c.text}
          type="button"
          onClick={() => {
            if (typeof c.caret === "number" && onInsertWithCaret) {
              onInsertWithCaret(c.text, c.caret);
            } else {
              onInsert(c.text);
            }
          }}
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-xs font-mono",
            "bg-bg-soft text-ink-soft border border-white/10",
            "hover:bg-bg-card hover:text-ink hover:border-accent/40",
            "active:scale-[0.97] transition",
          )}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
