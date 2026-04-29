"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/Layout/Header";
import { LessonShell } from "@/components/Lesson/LessonShell";
import { Terminal } from "@/components/Terminal/Terminal";
import { CommitGraph } from "@/components/Graph/CommitGraph";
import { AreasPanel } from "@/components/Areas/AreasPanel";
import { RemotePanel } from "@/components/Remote/RemotePanel";
import { PullRequestView } from "@/components/Remote/PullRequestView";
import { PRComposer } from "@/components/Remote/PRComposer";
import { PushAnimation } from "@/components/Remote/PushAnimation";
import { useGitStore } from "@/store/useGitStore";
import { getLesson, getLessonSlugs } from "@/lib/lessons";
import type { PullRequest } from "@/lib/git-engine/types";
import { cn } from "@/lib/cn";

export function LessonClient({ slug }: { slug: string }) {
  const lesson = getLesson(slug)!;

  // Reset synchronously on first render of this slug, BEFORE any child reads
  // the store. This avoids `LessonShell` reading the previous lesson's state
  // and child components like `PRComposer` initializing with stale defaults.
  const seededSlugRef = useRef<string | null>(null);
  if (seededSlugRef.current !== slug) {
    useGitStore.getState().resetTo(lesson.initialState);
    seededSlugRef.current = slug;
  }

  const git = useGitStore((s) => s.git);
  const pendingEffect = useGitStore((s) => s.pendingEffect);
  const consumeEffect = useGitStore((s) => s.consumeEffect);

  const [activePRId, setActivePRId] = useState<number | null>(null);
  const [pushDir, setPushDir] = useState<"push" | "pull" | null>(null);

  useEffect(() => {
    if (!pendingEffect) return;
    if (pendingEffect.kind === "push") setPushDir("push");
    if (pendingEffect.kind === "pull") setPushDir("pull");
    if (pendingEffect.kind === "pr-merge") {
      // se maneja desde el botón Merge; nada más que hacer aquí
    }
    consumeEffect();
  }, [pendingEffect, consumeEffect]);

  function handleCreatePR(values: {
    title: string;
    body: string;
    fromBranch: string;
    toBranch: string;
  }) {
    useGitStore.setState((s) => {
      if (!s.git.remote) return s;
      const lastId = s.git.remote.pullRequests.at(-1)?.id ?? 0;
      const newPR: PullRequest = {
        id: lastId + 1,
        title: values.title,
        body: values.body,
        fromBranch: values.fromBranch,
        toBranch: values.toBranch,
        state: "open",
        createdAt: Date.now(),
      };
      return {
        ...s,
        git: {
          ...s.git,
          remote: {
            ...s.git.remote,
            pullRequests: [...s.git.remote.pullRequests, newPR],
          },
        },
      };
    });
  }

  function handleMergePR(prId: number) {
    useGitStore.setState((s) => {
      if (!s.git.remote) return s;
      const remote = s.git.remote;
      const target = remote.pullRequests.find((p) => p.id === prId);
      if (!target || target.state !== "open") return s;
      const sourceTip = remote.branches[target.fromBranch];
      const updatedPRs = remote.pullRequests.map((p) =>
        p.id === prId ? { ...p, state: "merged" as const } : p,
      );
      const updatedBranches = sourceTip
        ? { ...remote.branches, [target.toBranch]: sourceTip }
        : remote.branches;
      return {
        ...s,
        git: {
          ...s.git,
          remote: {
            ...remote,
            pullRequests: updatedPRs,
            branches: updatedBranches,
          },
        },
      };
    });
  }

  const showRemote = !!lesson.showRemote;
  const allPRs = git.remote?.pullRequests ?? [];
  const fallbackPR = allPRs[allPRs.length - 1];
  const activePR =
    allPRs.find((p) => p.id === activePRId) ?? fallbackPR ?? null;

  const showPRComposer = slug === "pull-request" && allPRs.length === 0;
  const showPRView = (slug === "merge" || (slug === "pull-request" && allPRs.length > 0)) && activePR;

  const localBranches = Object.keys(git.refs.branches);
  const remoteBranches = Object.keys(git.remote?.branches ?? {});
  const fromBranchOptions = localBranches.length > 0 ? localBranches : ["main"];
  const toBranchOptions = remoteBranches.length > 0 ? remoteBranches : ["main"];
  const defaultFrom =
    git.refs.HEAD && localBranches.includes(git.refs.HEAD)
      ? git.refs.HEAD
      : fromBranchOptions[0];
  const defaultTo = toBranchOptions.includes("main") ? "main" : toBranchOptions[0];

  return (
    <>
      <Header currentSlug={slug} slugs={getLessonSlugs()} />
      <main className="mx-auto w-full max-w-7xl px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
          <div>
            <LessonShell lesson={lesson} />
          </div>

          <div className="flex flex-col gap-5">
            {lesson.showAreas && <AreasPanel git={git} />}

            <div
              className={cn(
                "grid gap-4",
                showRemote ? "lg:grid-cols-2" : "grid-cols-1",
              )}
            >
              <div className="rounded-2xl border border-white/10 bg-bg-card/80 backdrop-blur p-4 min-h-[260px]">
                <h3 className="text-sm font-semibold text-ink mb-3">
                  Tu repo (local)
                </h3>
                <CommitGraph
                  commits={git.commits}
                  refs={git.refs}
                  emptyHint={
                    git.initialized
                      ? "Aún no hay commits. Haz tu primer commit."
                      : "Aún no has inicializado el repo. Prueba con git init."
                  }
                />
              </div>
              {showRemote && (
                <RemotePanel
                  remote={git.remote}
                  onOpenPR={(id) => setActivePRId(id)}
                  activePRId={activePR?.id}
                />
              )}
            </div>

            {showPRComposer && (
              <PRComposer
                key={`${slug}:${defaultFrom}:${defaultTo}`}
                fromBranches={fromBranchOptions}
                toBranches={toBranchOptions}
                defaultFromBranch={defaultFrom}
                defaultToBranch={defaultTo}
                initialTitle={defaultPRTitle(defaultFrom)}
                initialBody={defaultPRBody()}
                onSubmit={handleCreatePR}
              />
            )}

            {showPRView && activePR && (
              <PullRequestView
                pr={activePR}
                commits={git.remote?.commits ?? []}
                diffLines={mockDiffFor(activePR)}
                onMerge={() => handleMergePR(activePR.id)}
              />
            )}

            <Terminal />
          </div>
        </div>
      </main>

      <PushAnimation direction={pushDir} onDone={() => setPushDir(null)} />
    </>
  );
}

function defaultPRTitle(fromBranch: string) {
  if (fromBranch.startsWith("feature/")) {
    const name = fromBranch.replace("feature/", "");
    return `Añade ${name}`;
  }
  return "";
}

function defaultPRBody() {
  return "";
}

function mockDiffFor(pr: PullRequest) {
  return [
    { file: "saludo.txt", type: "-" as const, text: "Hola" },
    { file: "saludo.txt", type: "+" as const, text: `Hola desde ${pr.fromBranch}` },
    { file: "saludo.txt", type: "+" as const, text: "¡Aprender Git mola!" },
  ];
}
