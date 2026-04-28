import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen grid place-items-center px-6 text-center">
      <div className="space-y-4 max-w-md">
        <h1 className="text-6xl font-bold text-accent">404</h1>
        <p className="text-ink-soft">
          Esa lección no existe (todavía). Vuelve al inicio para ver el temario.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-accent text-accent-ink h-11 px-5 text-sm font-semibold shadow-glow hover:bg-accent-soft transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
