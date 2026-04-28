import Link from "next/link";
import { lessons } from "@/lib/lessons";
import { ThemeToggle } from "@/components/Layout/ThemeToggle";

export default function HomePage() {
  const first = lessons[0];

  return (
    <main className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-bg/70 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 md:px-6">
          <div className="flex items-center gap-2 text-ink">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
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
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pt-16 pb-12">
        <div className="max-w-2xl space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-bg-card/70 px-3 py-1 text-xs text-ink-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulseGlow" />
            Aprende haciendo · 13 lecciones
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-ink">
            Aprende Git de verdad,
            <br />
            <span className="text-accent">paso a paso.</span>
          </h1>
          <p className="text-lg text-ink-soft leading-relaxed">
            Una app interactiva para aprender Git desde cero: desde tu primer{" "}
            <code className="font-mono text-accent-soft">commit</code> hasta
            entender qué es un{" "}
            <span className="font-semibold text-ink">Pull Request</span>. Con
            terminal simulada, grafo animado y un mini GitHub que vive en tu
            navegador.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href={`/lecciones/${first.slug}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent text-accent-ink h-11 px-5 text-sm font-semibold shadow-glow hover:bg-accent-soft transition-colors"
            >
              Empezar la lección 1 →
            </Link>
            <a
              href="#lecciones"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 text-ink-soft hover:text-ink h-11 px-5 text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Ver el temario
            </a>
          </div>
        </div>
      </section>

      {/* Lessons grid */}
      <section
        id="lecciones"
        className="mx-auto max-w-6xl px-4 md:px-6 pb-24 space-y-6"
      >
        <div className="flex items-end justify-between">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-ink">
            Las 13 lecciones
          </h2>
          <span className="text-sm text-ink-dim">
            Tres bloques: fundamentos · ramas · colaboración
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.map((lesson, i) => (
            <Link
              key={lesson.slug}
              href={`/lecciones/${lesson.slug}`}
              className="group relative flex flex-col gap-3 rounded-2xl border border-white/10 bg-bg-card/70 backdrop-blur p-5 hover:border-accent/40 hover:bg-bg-card transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-accent-soft text-xs font-mono">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-xs uppercase tracking-wider text-ink-dim">
                  {blockLabel(i)}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-ink group-hover:text-accent-soft transition-colors">
                {lesson.title}
              </h3>
              <p className="text-sm text-ink-soft line-clamp-3">
                {firstParagraph(lesson.intro)}
              </p>
              <div className="mt-auto pt-2 text-sm text-accent-soft opacity-0 group-hover:opacity-100 transition-opacity">
                Empezar lección →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 text-sm text-ink-dim flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
          <span>aprendegit · hecho con cariño para aprender Git.</span>
          <span className="font-mono">main · v0.1.0</span>
        </div>
      </footer>
    </main>
  );
}

function blockLabel(index: number) {
  if (index < 7) return "Fundamentos";
  if (index < 9) return "Ramas";
  return "Colaboración";
}

function firstParagraph(intro: string) {
  return intro.split(/\n\n+/)[0]?.trim() ?? "";
}
