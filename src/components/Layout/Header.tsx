"use client";

import Link from "next/link";
import { useGitStore } from "@/store/useGitStore";
import { ProgressBar } from "./ProgressBar";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/cn";

export interface HeaderProps {
  /** Slug of the lesson currently rendered. */
  currentSlug: string;
  /** Ordered list of lesson slugs to render in the progress bar. */
  slugs?: string[];
  className?: string;
}

const DEFAULT_SLUGS: string[] = [];

/**
 * Sticky top app chrome. Logo on the left, progress in the center on desktop,
 * theme toggle on the right.
 */
export function Header({
  currentSlug,
  slugs = DEFAULT_SLUGS,
  className,
}: HeaderProps) {
  const completed = useGitStore((s) => s.completed);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-white/5 bg-bg/80 backdrop-blur supports-[backdrop-filter]:bg-bg/60",
        className,
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-ink hover:text-accent-soft transition-colors"
          aria-label="aprendegit — inicio"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            {/* simple branch icon */}
            <circle cx="6" cy="6" r="2.4" fill="currentColor" />
            <circle cx="6" cy="18" r="2.4" fill="currentColor" />
            <circle
              cx="18"
              cy="12"
              r="2.4"
              fill="currentColor"
              className="text-accent"
            />
            <path
              d="M6 8.5v7"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M6 12c0-2.5 2-3.5 4-3.5h2.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <span className="font-semibold tracking-tight">aprendegit</span>
        </Link>

        <div className="hidden md:flex flex-1 items-center justify-center">
          {slugs.length > 0 && (
            <ProgressBar
              slugs={slugs}
              currentSlug={currentSlug}
              completed={completed}
            />
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile progress bar below the header */}
      {slugs.length > 0 && (
        <div className="md:hidden border-t border-white/5 px-4 py-2">
          <ProgressBar
            slugs={slugs}
            currentSlug={currentSlug}
            completed={completed}
          />
        </div>
      )}
    </header>
  );
}
