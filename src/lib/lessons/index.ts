import type { Lesson } from "@/types/lesson";

import queEsGit from "./01-que-es-git";
import tresZonas from "./02-tres-zonas";
import init from "./03-init";
import addCommit from "./04-add-commit";
import statusLog from "./05-status-log";
import gitignore from "./06-gitignore";
import diff from "./07-diff";
import queEsRama from "./08-que-es-rama";
import branchSwitch from "./09-branch-switch";
import remote from "./10-remote";
import push from "./11-push";
import pullRequest from "./12-pull-request";
import merge from "./13-merge";

/**
 * Ordered curriculum. Mutating the array also automatically wires `prev` and
 * `next` slugs at module-load time.
 */
const ordered: Lesson[] = [
  queEsGit,
  tresZonas,
  init,
  addCommit,
  statusLog,
  gitignore,
  diff,
  queEsRama,
  branchSwitch,
  remote,
  push,
  pullRequest,
  merge,
];

for (let i = 0; i < ordered.length; i++) {
  const current = ordered[i];
  current.prev = i > 0 ? ordered[i - 1].slug : undefined;
  current.next = i < ordered.length - 1 ? ordered[i + 1].slug : undefined;
}

export const lessons: Lesson[] = ordered;

export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((l) => l.slug === slug);
}

export function getLessonSlugs(): string[] {
  return lessons.map((l) => l.slug);
}

export type { Lesson } from "@/types/lesson";
