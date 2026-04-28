"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useGitStore } from "@/store/useGitStore";
import { cn } from "@/lib/cn";
import { History, type HistoryEntry } from "./History";
import { Prompt, type PromptHandle } from "./Prompt";
import { QuickCommands } from "./QuickCommands";

export interface TerminalProps {
  className?: string;
  /** Forzar `QuickCommands` visible en todos los tamaños. */
  alwaysShowQuickCommands?: boolean;
}

export function Terminal({
  className,
  alwaysShowQuickCommands = false,
}: TerminalProps) {
  const history = useGitStore((s) => s.history) as HistoryEntry[];
  const runCommand = useGitStore((s) => s.runCommand);

  const [draft, setDraft] = useState("");
  // -1 indica "draft actual" (no estamos navegando historial)
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const draftBeforeHistoryRef = useRef<string>("");

  const promptRef = useRef<PromptHandle | null>(null);
  const historyContainerRef = useRef<HTMLDivElement | null>(null);

  // Lista de comandos previos del usuario para navegar con ↑/↓
  const inputs = useMemo(() => history.map((h) => h.input), [history]);

  // Auto-scroll al final cuando se añaden entradas
  useEffect(() => {
    const el = historyContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [history.length]);

  function handleSubmit(value: string) {
    runCommand(value);
    setDraft("");
    setHistoryIndex(-1);
    draftBeforeHistoryRef.current = "";
  }

  function handleHistoryStep(direction: -1 | 1) {
    if (inputs.length === 0) return;

    // -1 = ir a comando anterior (más viejo); +1 = ir hacia el actual
    if (historyIndex === -1) {
      // Empezamos a navegar hacia atrás
      if (direction === -1) {
        draftBeforeHistoryRef.current = draft;
        const next = inputs.length - 1;
        setHistoryIndex(next);
        setDraft(inputs[next] ?? "");
      }
      return;
    }

    let next = historyIndex + direction;
    if (next < 0) next = 0;
    if (next >= inputs.length) {
      // Hemos vuelto al draft del usuario
      setHistoryIndex(-1);
      setDraft(draftBeforeHistoryRef.current);
      return;
    }
    setHistoryIndex(next);
    setDraft(inputs[next] ?? "");
  }

  function handleInsert(text: string) {
    promptRef.current?.insert(text);
  }

  function handleInsertWithCaret(text: string, caretPos: number) {
    promptRef.current?.insert(text, caretPos);
  }

  return (
    <section
      className={cn(
        "flex flex-col w-full max-w-3xl mx-auto",
        "bg-bg-card/80 backdrop-blur",
        "border border-white/10 rounded-2xl shadow-glow",
        "overflow-hidden",
        // altura razonable; el padre puede sobrescribir
        "h-[28rem] md:h-[32rem]",
        className,
      )}
      aria-label="Terminal simulada"
    >
      {/* Header estilo macOS */}
      <header className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-bg-soft/60">
        <span
          className="h-3 w-3 rounded-full bg-danger"
          aria-hidden
        />
        <span
          className="h-3 w-3 rounded-full bg-warn"
          aria-hidden
        />
        <span
          className="h-3 w-3 rounded-full bg-success"
          aria-hidden
        />
        <span className="ml-3 text-xs font-mono text-ink-dim select-none">
          tu-amigo@aprendegit:~/proyecto
        </span>
      </header>

      {/* Historial scrollable */}
      <div
        ref={historyContainerRef}
        className="flex-1 min-h-0 overflow-y-auto"
        onClick={() => promptRef.current?.focus()}
      >
        <History entries={history} className="h-full" />
      </div>

      {/* Prompt */}
      <Prompt
        ref={promptRef}
        value={draft}
        onChange={setDraft}
        onSubmit={handleSubmit}
        onHistoryStep={handleHistoryStep}
      />

      {/* Quick commands (móvil por defecto) */}
      <QuickCommands
        onInsert={handleInsert}
        onInsertWithCaret={handleInsertWithCaret}
        alwaysVisible={alwaysShowQuickCommands}
      />
    </section>
  );
}
