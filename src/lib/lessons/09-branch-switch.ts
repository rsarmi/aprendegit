import type { Lesson } from "@/types/lesson";
import type { Commit, GitState } from "@/lib/git-engine/types";

const now = Date.now();

const c1: Commit = {
  sha: "11aa11a",
  parents: [],
  message: "inicio del proyecto",
  author: "Tu Amigo <amigo@ejemplo.com>",
  timestamp: now - 120_000,
  files: { "saludo.txt": "Hola\n" },
};

const c2: Commit = {
  sha: "22bb22b",
  parents: ["11aa11a"],
  message: "documenta el proyecto",
  author: "Tu Amigo <amigo@ejemplo.com>",
  timestamp: now - 60_000,
  files: {
    "saludo.txt": "Hola\n",
    "README.md": "# Proyecto\n",
  },
};

const initialState: GitState = {
  initialized: true,
  workingDir: {
    "saludo.txt": "Hola\n",
    "README.md": "# Proyecto\n",
  },
  staging: {},
  lastCommitted: {
    "saludo.txt": "Hola\n",
    "README.md": "# Proyecto\n",
  },
  commits: [c1, c2],
  refs: {
    HEAD: "main",
    branches: { main: "22bb22b" },
  },
  gitignore: [],
  config: { user: { name: "Tu Amigo", email: "amigo@ejemplo.com" } },
};

const lesson: Lesson = {
  slug: "branch-switch",
  title: "git branch y git switch",
  intro: [
    "Vamos a la práctica. En este repo hay dos commits en `main`. Tu misión es abrir una rama nueva, hacer un commit ahí y volver a `main` sin romper nada.",
    "Para crear y cambiarte a una rama de un solo movimiento existe `git switch -c <nombre>`. Es equivalente a `git branch <nombre>` (que la crea pero no se cambia) seguido de `git switch <nombre>` (que se cambia).",
    "Una vez en la rama nueva, cualquier commit que hagas se queda colgado de ella. La rama `main` no se mueve mientras estés fuera. Cuando vuelvas a `main` con `git switch main`, verás que los archivos del repo cambian para reflejar el último commit de `main`: la rama queda esperando, lista para que la traigas más tarde.",
  ].join("\n\n"),
  initialState,
  steps: [
    {
      title: "Crea y cámbiate",
      body: "Ejecuta `git switch -c feature/saludo`. Verás aparecer la nueva etiqueta en el grafo, sobre el mismo commit donde estaba `main`.",
    },
    {
      title: "Haz un cambio y commitea",
      body: "Modifica `saludo.txt` (por ejemplo, escribe `echo \"Hola, equipo\" > saludo.txt`), haz `git add .` y luego `git commit -m \"saludo más cálido\"`.",
    },
    {
      title: "Vuelve a main",
      body: "Ejecuta `git switch main`. La rama `feature/saludo` se queda con su commit, esperándote.",
    },
  ],
  challenge: {
    prompt: "Crea la rama `feature/saludo`, haz un commit en ella y vuelve a `main`.",
    successCondition: (state) =>
      state.refs.branches["feature/saludo"] !== undefined &&
      state.commits.length >= 3 &&
      state.refs.HEAD === "main",
    hint: 'git switch -c feature/saludo  →  edita un archivo  →  git add .  →  git commit -m "saludo más cálido"  →  git switch main',
  },
};

export default lesson;
