"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import { cn } from "@/lib/cn";

export interface PromptHandle {
  /** Inserta texto en el input y enfoca; opcionalmente posiciona el caret. */
  insert: (text: string, caretPos?: number) => void;
  focus: () => void;
}

export interface PromptProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  /** Llamado con +1 / -1 cuando el usuario pulsa flecha arriba/abajo. */
  onHistoryStep: (direction: -1 | 1) => void;
  placeholder?: string;
  className?: string;
}

export const Prompt = forwardRef<PromptHandle, PromptProps>(function Prompt(
  { value, onChange, onSubmit, onHistoryStep, placeholder, className },
  ref,
) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useImperativeHandle(ref, () => ({
    insert(text, caretPos) {
      onChange(text);
      // Esperamos al próximo tick para que React aplique el value
      requestAnimationFrame(() => {
        const el = inputRef.current;
        if (!el) return;
        el.focus();
        const pos = typeof caretPos === "number" ? caretPos : text.length;
        try {
          el.setSelectionRange(pos, pos);
        } catch {
          /* algunos tipos de input no soportan selectionRange */
        }
      });
    },
    focus() {
      inputRef.current?.focus();
    },
  }));

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = value.trim();
      if (trimmed.length === 0) return;
      onSubmit(trimmed);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      onHistoryStep(-1);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      onHistoryStep(1);
      return;
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value);
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-3 border-t border-white/10",
        "font-mono text-sm",
        className,
      )}
    >
      <span
        className="text-success select-none shrink-0"
        aria-hidden
      >
        tu-amigo $
      </span>
      <input
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        type="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        placeholder={placeholder ?? "git status"}
        aria-label="Comando de terminal"
        className={cn(
          "flex-1 bg-transparent outline-none border-0",
          "text-ink placeholder:text-ink-dim caret-accent",
        )}
      />
    </div>
  );
});
