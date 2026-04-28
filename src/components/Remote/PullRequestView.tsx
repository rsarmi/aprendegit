"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Commit, PullRequest } from "@/lib/git-engine/types";
import { MergeButton } from "@/components/Remote/MergeButton";
import { cn } from "@/lib/cn";

export type DiffLine = {
  type: "+" | "-" | " ";
  text: string;
  file?: string;
};

export interface PullRequestViewProps {
  pr: PullRequest;
  commits: Commit[];
  diffLines?: DiffLine[];
  onMerge?: () => void;
  onClose?: () => void;
}

type Tab = "conversation" | "files" | "commits";

const TABS: { id: Tab; label: string }[] = [
  { id: "conversation", label: "Conversation" },
  { id: "files", label: "Files changed" },
  { id: "commits", label: "Commits" },
];

const fadeIn = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
};

/**
 * PullRequestView — vista detallada de un Pull Request al estilo GitHub.
 * Incluye tabs (Conversation, Files changed, Commits), diff simulado y un
 * sidebar a la derecha con reviewers, labels y el botón de merge.
 */
export function PullRequestView({
  pr,
  commits,
  diffLines = [],
  onMerge,
  onClose,
}: PullRequestViewProps) {
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<Tab>("conversation");
  const isOpen = pr.state === "open";

  return (
    <motion.section
      aria-label={`Pull request #${pr.id}`}
      className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-bg-soft text-ink"
      initial={reduceMotion ? "visible" : "hidden"}
      animate="visible"
      variants={fadeIn}
    >
      {/* Header */}
      <header className="border-b border-white/10 bg-bg-card px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-xl font-semibold text-ink">
                {pr.title}
                <span className="ml-2 font-normal text-ink-dim">#{pr.id}</span>
              </h2>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <StateBadge state={pr.state} />
              <span className="font-mono text-xs text-ink-soft">
                <span className="rounded bg-white/5 px-1.5 py-0.5">
                  {pr.fromBranch}
                </span>{" "}
                <span aria-hidden>→</span>{" "}
                <span className="rounded bg-white/5 px-1.5 py-0.5">
                  {pr.toBranch}
                </span>
              </span>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-white/10 bg-bg px-2.5 py-1 text-xs text-ink-soft hover:bg-white/5"
            >
              Cerrar
            </button>
          )}
        </div>

        {/* Tabs */}
        <nav
          className="mt-4 flex gap-1 border-b border-white/10"
          role="tablist"
          aria-label="Pestañas del PR"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink",
                  isActive && "text-ink",
                )}
              >
                {tab.label}
                {isActive && (
                  <motion.span
                    layoutId="pr-tab-underline"
                    className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Body — content + sidebar */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        <main className="flex-1 overflow-y-auto px-5 py-5">
          {activeTab === "conversation" && <ConversationTab pr={pr} />}
          {activeTab === "files" && <FilesTab diffLines={diffLines} />}
          {activeTab === "commits" && <CommitsTab commits={commits} />}
        </main>

        <aside
          className={cn(
            "shrink-0 border-white/10 bg-bg px-5 py-5",
            "border-t lg:w-72 lg:border-l lg:border-t-0",
          )}
          aria-label="Información lateral del PR"
        >
          <SidebarSection title="Reviewers">
            <ReviewerRow name="Tu mentor" />
          </SidebarSection>
          <SidebarSection title="Labels">
            <div className="flex flex-wrap gap-1.5">
              <Label color="accent">enseñanza</Label>
              <Label color="success">good first issue</Label>
            </div>
          </SidebarSection>

          <div className="mt-6">
            {isOpen ? (
              <MergeButton onClick={() => onMerge?.()} disabled={!onMerge} />
            ) : (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm font-semibold text-accent-soft">
                <span aria-hidden>⇄</span>
                <span>
                  {pr.state === "merged" ? "Merged" : "Pull request cerrado"}
                </span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </motion.section>
  );
}

function StateBadge({ state }: { state: PullRequest["state"] }) {
  const styles: Record<PullRequest["state"], string> = {
    open: "bg-success/20 text-success border-success/30",
    merged: "bg-accent/20 text-accent-soft border-accent/40",
    closed: "bg-white/10 text-ink-dim border-white/10",
  };
  const labels: Record<PullRequest["state"], string> = {
    open: "Open",
    merged: "Merged",
    closed: "Closed",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        styles[state],
      )}
    >
      <span aria-hidden>{state === "merged" ? "⇄" : "●"}</span>
      {labels[state]}
    </span>
  );
}

function ConversationTab({ pr }: { pr: PullRequest }) {
  return (
    <article className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-bg-card p-4">
        <header className="mb-2 flex items-center gap-2 text-xs text-ink-dim">
          <span className="font-medium text-ink">tú</span>
          <span>abrió este PR</span>
        </header>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
          {pr.body || "Sin descripción adicional."}
        </p>
      </div>
      <p className="text-xs italic text-ink-dim">
        Aquí aparecerán los comentarios de tus revisores.
      </p>
    </article>
  );
}

function FilesTab({ diffLines }: { diffLines: DiffLine[] }) {
  if (diffLines.length === 0) {
    return (
      <p className="text-sm italic text-ink-dim">
        No hay cambios para mostrar.
      </p>
    );
  }

  // Group lines by file (first occurrence of `file` field starts a block).
  type DiffGroup = { file: string; lines: DiffLine[] };
  const groups: DiffGroup[] = [];
  let current: DiffGroup | null = null;
  for (const line of diffLines) {
    const file: string = line.file ?? current?.file ?? "diff";
    if (!current || current.file !== file) {
      current = { file, lines: [] };
      groups.push(current);
    }
    current.lines.push(line);
  }

  return (
    <div className="space-y-4">
      {groups.map((group, gIdx) => (
        <div
          key={`${group.file}-${gIdx}`}
          className="overflow-hidden rounded-xl border border-white/10 bg-bg-card"
        >
          <header className="border-b border-white/10 bg-bg-soft px-3 py-2 font-mono text-xs text-ink-soft">
            {group.file}
          </header>
          <pre className="overflow-x-auto px-0 py-2 font-mono text-[12.5px] leading-relaxed">
            {group.lines.map((line, idx) => (
              <DiffRow key={idx} line={line} />
            ))}
          </pre>
        </div>
      ))}
    </div>
  );
}

function DiffRow({ line }: { line: DiffLine }) {
  const styles =
    line.type === "+"
      ? "bg-success/10 text-success"
      : line.type === "-"
        ? "bg-danger/10 text-danger"
        : "text-ink-soft";
  const sign = line.type === " " ? " " : line.type;
  return (
    <span className={cn("block px-3", styles)}>
      <span className="mr-3 select-none text-ink-dim">{sign}</span>
      {line.text}
    </span>
  );
}

function CommitsTab({ commits }: { commits: Commit[] }) {
  if (commits.length === 0) {
    return (
      <p className="text-sm italic text-ink-dim">
        Aún no hay commits en este PR.
      </p>
    );
  }
  return (
    <ol className="space-y-2">
      {commits.map((commit) => (
        <li
          key={commit.sha}
          className="flex items-start gap-3 rounded-xl border border-white/10 bg-bg-card px-3 py-2"
        >
          <span className="mt-0.5 rounded bg-white/5 px-2 py-0.5 font-mono text-[11px] text-accent-soft">
            {commit.sha.slice(0, 7)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-ink">{commit.message}</p>
            <p className="truncate text-[11px] text-ink-dim">
              {commit.author}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-5">
      <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-dim">
        {title}
      </h4>
      {children}
    </section>
  );
}

function ReviewerRow({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden
        className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/30 text-[11px] font-semibold text-accent-soft"
      >
        {initials}
      </span>
      <span className="text-sm text-ink">{name}</span>
    </div>
  );
}

function Label({
  color,
  children,
}: {
  color: "accent" | "success";
  children: React.ReactNode;
}) {
  const styles =
    color === "accent"
      ? "bg-accent/20 text-accent-soft border-accent/30"
      : "bg-success/15 text-success border-success/30";
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[11px] font-medium",
        styles,
      )}
    >
      {children}
    </span>
  );
}

export default PullRequestView;
