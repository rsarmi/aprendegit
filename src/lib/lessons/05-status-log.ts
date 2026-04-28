import type { Lesson } from "@/types/lesson";
import type { Commit, GitState } from "@/lib/git-engine/types";

const now = Date.now();

const firstCommit: Commit = {
  sha: "abc1234",
  parents: [],
  message: "primer commit",
  author: "Tu Amigo <amigo@ejemplo.com>",
  timestamp: now - 60_000,
  files: { "saludo.txt": "Hola\n" },
};

const initialState: GitState = {
  initialized: true,
  workingDir: {
    "saludo.txt": "Hola\n",
    "nota.md": "WIP\n",
  },
  staging: {},
  lastCommitted: { "saludo.txt": "Hola\n" },
  commits: [firstCommit],
  refs: {
    HEAD: "main",
    branches: { main: "abc1234" },
  },
  gitignore: [],
  config: { user: { name: "Tu Amigo", email: "amigo@ejemplo.com" } },
};

const lesson: Lesson = {
  slug: "status-log",
  title: "git status y git log",
  intro: [
    "Cuando llevas varios cambios encima conviene parar y mirar dónde estás. Para eso tienes dos comandos amables que no modifican nada: solo te informan.",
    "`git status` te dice cómo están las tres zonas en este momento: qué archivos cambiaron en working dir, qué hay puesto en staging y si hay archivos nuevos que Git todavía no sigue.",
    "`git log` te muestra la historia de commits del álbum: el más reciente arriba, con su sha (un identificador corto), su autor, su fecha y su mensaje.",
    "En este repositorio ya hay un commit hecho y un archivo nuevo (`nota.md`) que Git aún no conoce. Vamos a echarle un ojo a la situación.",
  ].join("\n\n"),
  initialState,
  steps: [
    {
      title: "Mira el estado",
      body: "Ejecuta `git status` para ver qué archivos están sin seguir, modificados o listos para commitear.",
    },
    {
      title: "Mira la historia",
      body: "Ejecuta `git log` para ver los commits que ya forman parte del álbum.",
    },
  ],
  challenge: {
    prompt: "Muestra el estado actual del repositorio y, después, su historia de commits.",
    successCondition: (_state, history) =>
      history.some((h) => h.input.startsWith("git status")) &&
      history.some((h) => h.input.startsWith("git log")),
    hint: "Dos comandos: `git status` y `git log`.",
  },
};

export default lesson;
