"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CommitGraph } from "@/components/Graph/CommitGraph";
import type { PullRequest, RemoteState } from "@/lib/git-engine/types";
import { cn } from "@/lib/cn";

export interface RemotePanelProps {
  remote: RemoteState | undefined;
  onOpenPR: (id: number) => void;
  activePRId?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

/**
 * RemotePanel — visualiza un repositorio remoto al estilo de un mini GitHub.
 *
 * Muestra el header con el nombre del repo, el grafo de commits del remoto y
 * la lista de Pull Requests existentes. Si el remoto no existe aún devuelve
 * un mensaje neutro que invita a configurarlo.
 */
export function RemotePanel({ remote, onOpenPR, activePRId }: RemotePanelProps) {
  const reduceMotion = useReducedMotion();

  if (!remote) {
    return (
      <section
        aria-label="Repositorio remoto"
        className={cn(
          "flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-bg-soft p-6 text-center",
        )}
      >
        <div className="text-3xl" aria-hidden>
          🐙
        </div>
        <h3 className="mt-3 text-base font-semibold text-ink">
          Aún no hay repo remoto
        </h3>
        <p className="mt-1 max-w-xs text-sm text-ink-soft">
          Cuando agregues un <span className="font-mono text-accent">remote</span>,
          aparecerá aquí como un mini GitHub.
        </p>
      </section>
    );
  }

  const repoName = remote.url.replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    || "tu-amigo/aprendegit";
  const refs = { HEAD: "main", branches: remote.branches };

  return (
    <motion.section
      aria-label="Repositorio remoto"
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-bg-card shadow-glow",
      )}
      variants={containerVariants}
      initial={reduceMotion ? "visible" : "hidden"}
      animate="visible"
    >
      {/* Header */}
      <motion.header
        variants={childVariants}
        className="flex items-center gap-3 border-b border-white/10 bg-bg-soft px-4 py-3"
      >
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-ink"
          aria-hidden
        >
          GH
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-sm text-ink">{repoName}</p>
          <p className="truncate text-xs text-ink-dim">{remote.url}</p>
        </div>
        <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-soft">
          remote
        </span>
      </motion.header>

      {/* Body — Commit graph */}
      <motion.div
        variants={childVariants}
        className="flex-1 overflow-auto px-3 py-3"
      >
        {remote.commits.length === 0 ? (
          <div className="flex h-full min-h-[160px] items-center justify-center rounded-xl border border-dashed border-white/10 bg-bg-soft px-4 py-6 text-center">
            <p className="text-sm text-ink-soft">
              Aquí no hay nada todavía.{" "}
              <span className="font-medium text-ink">
                Haz tu primer{" "}
                <span className="font-mono text-accent">push</span>.
              </span>
            </p>
          </div>
        ) : (
          <CommitGraph commits={remote.commits} refs={refs} />
        )}
      </motion.div>

      {/* PR list */}
      <motion.div
        variants={childVariants}
        className="border-t border-white/10 bg-bg-soft"
      >
        <div className="flex items-center justify-between px-4 py-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
            Pull requests
          </h4>
          <span className="text-[11px] text-ink-dim">
            {remote.pullRequests.length}{" "}
            {remote.pullRequests.length === 1 ? "abierto/cerrado" : "totales"}
          </span>
        </div>
        {remote.pullRequests.length === 0 ? (
          <p className="px-4 pb-3 text-xs italic text-ink-dim">
            Aún no hay pull requests.
          </p>
        ) : (
          <ul className="max-h-44 overflow-y-auto">
            {remote.pullRequests.map((pr) => (
              <PRRow
                key={pr.id}
                pr={pr}
                active={pr.id === activePRId}
                onOpen={() => onOpenPR(pr.id)}
              />
            ))}
          </ul>
        )}
      </motion.div>
    </motion.section>
  );
}

interface PRRowProps {
  pr: PullRequest;
  active: boolean;
  onOpen: () => void;
}

function PRRow({ pr, active, onOpen }: PRRowProps) {
  const isMerged = pr.state === "merged";
  const iconColor = isMerged
    ? "bg-accent/20 text-accent-soft"
    : pr.state === "open"
      ? "bg-success/20 text-success"
      : "bg-white/10 text-ink-dim";
  const stateLabel =
    pr.state === "open" ? "Open" : pr.state === "merged" ? "Merged" : "Closed";

  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "flex w-full items-center gap-3 border-t border-white/5 px-4 py-2 text-left transition-colors hover:bg-white/5",
          active && "bg-white/5",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "flex h-6 w-6 flex-none items-center justify-center rounded-full text-[11px] font-bold",
            iconColor,
          )}
        >
          {isMerged ? "⇄" : "●"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">
            {pr.title}
          </span>
          <span className="block truncate font-mono text-[11px] text-ink-dim">
            {pr.fromBranch} → {pr.toBranch}
          </span>
        </span>
        <span
          className={cn(
            "flex-none rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            pr.state === "open" && "bg-success/20 text-success",
            pr.state === "merged" && "bg-accent/20 text-accent-soft",
            pr.state === "closed" && "bg-white/10 text-ink-dim",
          )}
        >
          {stateLabel}
        </span>
      </button>
    </li>
  );
}

export default RemotePanel;
