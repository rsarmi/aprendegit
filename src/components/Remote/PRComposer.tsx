"use client";

import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

export interface PRComposerSubmit {
  title: string;
  body: string;
  fromBranch: string;
  toBranch: string;
}

export interface PRComposerProps {
  /** Branches available as origin (head). Defaults to ["main"]. */
  fromBranches?: string[];
  /** Branches available as destination (base). Defaults to ["main"]. */
  toBranches?: string[];
  /** Default selected origin branch. */
  defaultFromBranch?: string;
  /** Default selected destination branch. */
  defaultToBranch?: string;
  /** Optional initial values to prefill the form. */
  initialTitle?: string;
  initialBody?: string;
  onSubmit: (values: PRComposerSubmit) => void;
  onCancel?: () => void;
}

/**
 * PRComposer — formulario simple para que el alumno redacte un Pull Request.
 * Validación mínima: el título no puede estar vacío.
 */
export function PRComposer({
  fromBranches = ["main"],
  toBranches = ["main"],
  defaultFromBranch,
  defaultToBranch = "main",
  initialTitle = "",
  initialBody = "",
  onSubmit,
  onCancel,
}: PRComposerProps) {
  const reduceMotion = useReducedMotion();
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [fromBranch, setFromBranch] = useState(
    defaultFromBranch ?? fromBranches[0] ?? "main",
  );
  const [toBranch, setToBranch] = useState(defaultToBranch);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("El título no puede estar vacío.");
      return;
    }
    setError(null);
    onSubmit({
      title: trimmed,
      body: body.trim(),
      fromBranch,
      toBranch,
    });
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-4 rounded-2xl border border-white/10 bg-bg-soft p-5 text-ink"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      aria-label="Crear pull request"
    >
      <header>
        <h3 className="text-base font-semibold text-ink">
          Abrir un pull request
        </h3>
        <p className="mt-1 text-xs text-ink-soft">
          Cuéntale a tu equipo qué cambios propones y por qué.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="De la rama" htmlFor="pr-from">
          <select
            id="pr-from"
            value={fromBranch}
            onChange={(e) => setFromBranch(e.target.value)}
            className={selectClasses}
          >
            {fromBranches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Hacia la rama" htmlFor="pr-to">
          <select
            id="pr-to"
            value={toBranch}
            onChange={(e) => setToBranch(e.target.value)}
            className={selectClasses}
          >
            {toBranches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Título" htmlFor="pr-title" required>
        <input
          id="pr-title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Añadir saludo en feature/saludo"
          className={inputClasses}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "pr-title-error" : undefined}
        />
        {error && (
          <p
            id="pr-title-error"
            role="alert"
            className="mt-1 text-xs text-danger"
          >
            {error}
          </p>
        )}
      </Field>

      <Field label="Descripción" htmlFor="pr-body">
        <textarea
          id="pr-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          placeholder="Explica brevemente qué cambia este PR…"
          className={cn(inputClasses, "resize-y leading-relaxed")}
        />
      </Field>

      <footer className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-ink-soft hover:bg-white/5"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-xl bg-success px-4 py-2 text-sm font-semibold text-bg shadow-glow transition-colors hover:bg-success/90",
          )}
        >
          Crear pull request
        </button>
      </footer>
    </motion.form>
  );
}

const inputClasses = cn(
  "w-full rounded-lg border border-white/10 bg-bg px-3 py-2 text-sm text-ink",
  "placeholder:text-ink-dim focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30",
);

const selectClasses = cn(inputClasses, "pr-8 font-mono");

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <label
        htmlFor={htmlFor}
        className="mb-1 text-xs font-medium text-ink-soft"
      >
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      {children}
    </div>
  );
}

export default PRComposer;
