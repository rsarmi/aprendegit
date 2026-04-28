"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Commit, GitState, Sha } from "@/lib/git-engine/types";
import { cn } from "@/lib/cn";
import { CommitNode } from "./CommitNode";
import { Edge } from "./Edge";
import { BranchLabel } from "./BranchLabel";
import { HeadIndicator } from "./HeadIndicator";

export interface CommitGraphProps {
  commits: Commit[];
  refs: GitState["refs"];
  title?: string;
  emptyHint?: string;
  /** Optional accent for the "current" branch (defaults to brand purple). */
  accent?: string;
  className?: string;
}

interface LaidCommit {
  commit: Commit;
  branch: string;
  column: number;
  row: number;
  cx: number;
  cy: number;
}

const COL_WIDTH = 96;
const ROW_HEIGHT = 80;
const PADDING_X = 64;
const PADDING_TOP = 48;
const PADDING_BOTTOM = 56;

const FALLBACK_BRANCH_COLORS = [
  "#7c5cff", // accent / branch.main
  "#3ddc97", // success / branch.feature
  "#ffb454", // warn
  "#ff6b6b", // danger
  "#a48cff", // accent.soft
];

/**
 * Compute which branch a commit "belongs" to. We walk every branch tip back
 * through `parents[0]` and assign the first branch that claims a commit.
 * Newer branches (created later) thus win the columns near the tip while
 * older history stays on `main`.
 */
function assignCommitsToBranches(
  commits: Commit[],
  branches: Record<string, Sha>,
): { byBranch: Map<string, Commit[]>; commitBranch: Map<Sha, string> } {
  const bySha = new Map(commits.map((c) => [c.sha, c]));
  const commitBranch = new Map<Sha, string>();

  // Order branches: "main" first if present, then by name for stability.
  const orderedBranches = Object.keys(branches).sort((a, b) => {
    if (a === "main") return -1;
    if (b === "main") return 1;
    if (a === "master") return -1;
    if (b === "master") return 1;
    return a.localeCompare(b);
  });

  for (const branch of orderedBranches) {
    let cursor: Sha | undefined = branches[branch];
    while (cursor && !commitBranch.has(cursor)) {
      commitBranch.set(cursor, branch);
      const c = bySha.get(cursor);
      cursor = c?.parents[0];
    }
  }

  const byBranch = new Map<string, Commit[]>();
  for (const branch of orderedBranches) byBranch.set(branch, []);
  for (const c of commits) {
    const b = commitBranch.get(c.sha);
    if (!b) continue;
    byBranch.get(b)!.push(c);
  }

  return { byBranch, commitBranch };
}

/**
 * Decide column for each branch. With ≤ 5 commits and a single branch we
 * center the column; otherwise main on the left and the rest to the right.
 */
function computeBranchColumns(
  branchNames: string[],
  totalCommits: number,
): Map<string, number> {
  const columns = new Map<string, number>();
  if (branchNames.length <= 1) {
    columns.set(branchNames[0] ?? "main", 0);
    return columns;
  }
  // Put main/master at column 0, then everything else to the right.
  const sorted = [...branchNames].sort((a, b) => {
    if (a === "main" || a === "master") return -1;
    if (b === "main" || b === "master") return 1;
    return a.localeCompare(b);
  });
  sorted.forEach((b, i) => columns.set(b, i));
  // Avoid lint warning when totalCommits goes unused on small graphs.
  void totalCommits;
  return columns;
}

function colorForBranch(
  branch: string,
  index: number,
  accent: string,
  current: string | null,
): string {
  if (branch === current) return accent;
  if (branch === "main" || branch === "master") return "#7c5cff";
  if (index === 1) return "#3ddc97";
  return FALLBACK_BRANCH_COLORS[index % FALLBACK_BRANCH_COLORS.length];
}

export function CommitGraph({
  commits,
  refs,
  title,
  emptyHint = "Aún no hay commits. Ejecuta `git commit` para empezar el historial.",
  accent = "#7c5cff",
  className,
}: CommitGraphProps) {
  const reduceMotion = useReducedMotion();

  const layout = useMemo(() => {
    if (commits.length === 0) return null;

    // Sort by timestamp ascending. Older commits at the bottom (row 0), newer
    // at the top — this reads naturally as a "pila" creciente hacia arriba.
    const sorted = [...commits].sort((a, b) => a.timestamp - b.timestamp);
    const rowBySha = new Map<Sha, number>();
    sorted.forEach((c, i) => rowBySha.set(c.sha, i));

    const { commitBranch } = assignCommitsToBranches(sorted, refs.branches);
    const branchNames = Object.keys(refs.branches);
    const branchCols = computeBranchColumns(branchNames, sorted.length);

    const totalRows = sorted.length;
    const totalCols = Math.max(1, branchCols.size);

    const isCenteredSmall = totalCols === 1;
    const width =
      PADDING_X * 2 + Math.max(0, totalCols - 1) * COL_WIDTH + (isCenteredSmall ? 0 : 0);
    // height: room for rows + branch labels above + commit-sha text below
    const height = PADDING_TOP + (totalRows - 1) * ROW_HEIGHT + PADDING_BOTTOM;

    const placed: LaidCommit[] = sorted.map((c) => {
      const branch = commitBranch.get(c.sha) ?? branchNames[0] ?? "main";
      const column = branchCols.get(branch) ?? 0;
      const row = rowBySha.get(c.sha) ?? 0;
      // Newer commits go *up* — invert row index for cy.
      const yIdxFromTop = totalRows - 1 - row;
      const cx = isCenteredSmall
        ? width / 2
        : PADDING_X + column * COL_WIDTH;
      const cy = PADDING_TOP + yIdxFromTop * ROW_HEIGHT;
      return { commit: c, branch, column, row, cx, cy };
    });

    const placedBySha = new Map(placed.map((p) => [p.commit.sha, p]));

    // Branch tips → for label positioning.
    const branchTips: Array<{
      name: string;
      sha: Sha;
      x: number;
      y: number;
      color: string;
    }> = [];
    const orderedBranchNames = Array.from(branchCols.keys());
    orderedBranchNames.forEach((name, idx) => {
      const tipSha = refs.branches[name];
      const tip = placedBySha.get(tipSha);
      if (!tip) return;
      const currentBranch = refs.HEAD;
      const color = colorForBranch(
        name,
        idx,
        accent,
        currentBranch === name ? currentBranch : null,
      );
      branchTips.push({
        name,
        sha: tipSha,
        x: tip.cx,
        y: tip.cy - 32, // float above the node
        color,
      });
    });

    return {
      placed,
      placedBySha,
      branchTips,
      width: Math.max(width, 240),
      height: Math.max(height, 200),
      branchCols,
      orderedBranchNames,
    };
  }, [commits, refs, accent]);

  // ---- Empty state ----
  if (!layout) {
    return (
      <section
        className={cn(
          "rounded-2xl border border-bg-soft bg-bg-card p-6",
          className,
        )}
      >
        {title && (
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-soft">
            {title}
          </h3>
        )}
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <svg
            width={64}
            height={64}
            viewBox="0 0 64 64"
            aria-hidden="true"
            className="text-ink-dim"
          >
            <circle
              cx={32}
              cy={32}
              r={20}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeDasharray="4 6"
              opacity={0.6}
            />
          </svg>
          <p className="max-w-xs text-sm text-ink-dim">{emptyHint}</p>
        </div>
      </section>
    );
  }

  const headBranch = refs.HEAD;
  const isDetached =
    typeof headBranch === "string" &&
    !Object.prototype.hasOwnProperty.call(refs.branches, headBranch);

  // Detached HEAD: find commit in `placed` matching the SHA.
  const detachedTarget = isDetached
    ? layout.placedBySha.get(headBranch)
    : undefined;

  return (
    <section
      className={cn(
        "rounded-2xl border border-bg-soft bg-bg-card p-4",
        className,
      )}
    >
      {title && (
        <header className="mb-2 flex items-center justify-between px-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
            {title}
          </h3>
          <span className="font-mono text-[11px] text-ink-dim">
            {commits.length} commit{commits.length === 1 ? "" : "s"}
          </span>
        </header>
      )}

      {/* On mobile we allow horizontal scroll with snap when the SVG overflows. */}
      <div
        className={cn(
          "relative w-full overflow-x-auto snap-x",
          // Smoother scrollbar on webkit
          "[scrollbar-width:thin]",
        )}
      >
        <motion.svg
          role="img"
          aria-label={title ?? "Grafo de commits"}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          width="100%"
          height={layout.height}
          preserveAspectRatio="xMidYMin meet"
          className="block min-w-[280px] snap-center"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          {/* Edges — drawn first so nodes layer on top. */}
          <g>
            {layout.placed.map((p) => {
              return p.commit.parents.map((parentSha) => {
                const parent = layout.placedBySha.get(parentSha);
                if (!parent) return null;
                // Color edge by the child's branch.
                const childIdx = layout.orderedBranchNames.indexOf(p.branch);
                const color = colorForBranch(
                  p.branch,
                  childIdx,
                  accent,
                  refs.HEAD === p.branch ? p.branch : null,
                );
                return (
                  <Edge
                    key={`${p.commit.sha}->${parentSha}`}
                    from={{ x: p.cx, y: p.cy }}
                    to={{ x: parent.cx, y: parent.cy }}
                    color={color}
                  />
                );
              });
            })}
          </g>

          {/* Commit nodes. */}
          <g>
            {layout.placed.map((p) => {
              const idx = layout.orderedBranchNames.indexOf(p.branch);
              const color = colorForBranch(
                p.branch,
                idx,
                accent,
                refs.HEAD === p.branch ? p.branch : null,
              );
              const isCurrentTip =
                refs.HEAD === p.branch &&
                refs.branches[p.branch] === p.commit.sha;
              return (
                <CommitNode
                  key={p.commit.sha}
                  sha={p.commit.sha}
                  cx={p.cx}
                  cy={p.cy}
                  color={color}
                  message={p.commit.message}
                  isHead={isCurrentTip}
                />
              );
            })}
          </g>

          {/* Branch labels (and HEAD badge inside the active one). */}
          <g>
            {layout.branchTips.map((tip) => (
              <BranchLabel
                key={tip.name}
                name={tip.name}
                sha={tip.sha}
                color={tip.color}
                x={tip.x}
                y={tip.y}
                isHead={refs.HEAD === tip.name}
              />
            ))}
          </g>

          {/* Detached HEAD floating triangle. */}
          {isDetached && detachedTarget && (
            <HeadIndicator
              x={detachedTarget.cx}
              y={detachedTarget.cy}
              detached
              color="#ffb454"
            />
          )}
        </motion.svg>
      </div>
    </section>
  );
}

export default CommitGraph;
