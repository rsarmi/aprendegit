"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { GitState } from "@/lib/git-engine/types";
import { cn } from "@/lib/cn";

export interface AreasPanelProps {
  git: GitState;
  className?: string;
}

type Zone = "working" | "staging" | "repo";

interface FileChip {
  path: string;
  zone: Zone;
  status: "untracked" | "modified" | "staged" | "committed" | "ignored";
}

function isIgnored(path: string, gitignore: string[]): boolean {
  for (const rule of gitignore) {
    const r = rule.trim();
    if (!r || r.startsWith("#")) continue;
    if (r.endsWith("/*") || r.endsWith("/")) {
      const prefix = r.replace(/\/(\*)?$/, "");
      if (path.startsWith(prefix + "/")) return true;
    }
    if (r.startsWith("*.")) {
      const ext = r.slice(1);
      if (path.endsWith(ext)) return true;
    }
    if (path === r || path.startsWith(r + "/")) return true;
  }
  return false;
}

/**
 * AreasPanel — visualiza las "tres zonas" de Git (working / staging / commits)
 * y los archivos que viven en cada una. Usa `layoutId` por archivo para que
 * Framer Motion anime las transiciones cuando un archivo se mueve entre zonas.
 */
export function AreasPanel({ git, className }: AreasPanelProps) {
  const reduce = useReducedMotion();

  // Construir la lista única de archivos clasificados por zona principal
  // (un archivo solo aparece en una zona; staging gana sobre working).
  const files = new Map<string, FileChip>();

  for (const path of Object.keys(git.lastCommitted)) {
    files.set(path, { path, zone: "repo", status: "committed" });
  }

  for (const path of Object.keys(git.workingDir)) {
    if (isIgnored(path, git.gitignore)) {
      files.set(path, { path, zone: "working", status: "ignored" });
      continue;
    }
    const inLast = git.lastCommitted[path];
    const isModified = inLast !== undefined && inLast !== git.workingDir[path];
    const isUntracked = inLast === undefined;
    if (isUntracked) {
      files.set(path, { path, zone: "working", status: "untracked" });
    } else if (isModified) {
      files.set(path, { path, zone: "working", status: "modified" });
    }
    // Si está en lastCommitted y no cambió, ya quedó como committed arriba.
  }

  for (const path of Object.keys(git.staging)) {
    files.set(path, { path, zone: "staging", status: "staged" });
  }

  const grouped: Record<Zone, FileChip[]> = {
    working: [],
    staging: [],
    repo: [],
  };
  for (const f of files.values()) grouped[f.zone].push(f);
  for (const z of ["working", "staging", "repo"] as const) {
    grouped[z].sort((a, b) => a.path.localeCompare(b.path));
  }

  return (
    <section
      aria-label="Áreas de trabajo"
      className={cn(
        "rounded-2xl border border-white/10 bg-bg-card/80 backdrop-blur p-4",
        className,
      )}
    >
      <header className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-ink">Áreas de trabajo</h3>
        <span className="text-xs text-ink-dim hidden sm:inline">
          working dir → staging → repo
        </span>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <ZoneColumn
          title="Working dir"
          subtitle="tu carpeta"
          tone="warn"
          files={grouped.working}
          reduce={!!reduce}
          empty="(vacío)"
        />
        <ZoneColumn
          title="Staging"
          subtitle="mesa de revisión"
          tone="accent"
          files={grouped.staging}
          reduce={!!reduce}
          empty="(nada subido)"
        />
        <ZoneColumn
          title="Repositorio"
          subtitle="último commit"
          tone="success"
          files={grouped.repo}
          reduce={!!reduce}
          empty={git.commits.length === 0 ? "(sin commits)" : "(igual a HEAD)"}
        />
      </div>
    </section>
  );
}

interface ZoneColumnProps {
  title: string;
  subtitle: string;
  tone: "warn" | "accent" | "success";
  files: FileChip[];
  empty: string;
  reduce: boolean;
}

function ZoneColumn({ title, subtitle, tone, files, empty, reduce }: ZoneColumnProps) {
  const toneClasses: Record<string, string> = {
    warn: "border-warn/30 bg-warn/5",
    accent: "border-accent/30 bg-accent/5",
    success: "border-success/30 bg-success/5",
  };
  const dotClasses: Record<string, string> = {
    warn: "bg-warn",
    accent: "bg-accent",
    success: "bg-success",
  };

  return (
    <div
      className={cn(
        "rounded-xl border min-h-[140px] p-3 flex flex-col gap-2",
        toneClasses[tone],
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn("h-2 w-2 rounded-full", dotClasses[tone])} aria-hidden />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-ink truncate">{title}</div>
          <div className="text-[10px] text-ink-dim truncate">{subtitle}</div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 mt-1 min-h-0">
        <AnimatePresence mode="popLayout">
          {files.length === 0 && (
            <motion.span
              key="empty"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[11px] text-ink-dim italic"
            >
              {empty}
            </motion.span>
          )}
          {files.map((f) => (
            <FileRow key={f.path} file={f} reduce={reduce} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FileRow({ file, reduce }: { file: FileChip; reduce: boolean }) {
  const statusLabel: Record<FileChip["status"], string> = {
    untracked: "nuevo",
    modified: "modificado",
    staged: "listo",
    committed: "guardado",
    ignored: "ignorado",
  };
  const statusColor: Record<FileChip["status"], string> = {
    untracked: "text-warn",
    modified: "text-accent-soft",
    staged: "text-accent",
    committed: "text-success",
    ignored: "text-ink-dim",
  };

  return (
    <motion.div
      layout
      layoutId={`file:${file.path}`}
      initial={reduce ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
      transition={
        reduce
          ? { duration: 0 }
          : { type: "spring", stiffness: 400, damping: 28 }
      }
      className="flex items-center justify-between gap-2 rounded-md bg-bg-soft/60 px-2 py-1.5 border border-white/5"
    >
      <span className="text-[11px] font-mono text-ink truncate min-w-0">
        {file.path}
      </span>
      <span className={cn("text-[10px] font-medium shrink-0", statusColor[file.status])}>
        {statusLabel[file.status]}
      </span>
    </motion.div>
  );
}

export default AreasPanel;
