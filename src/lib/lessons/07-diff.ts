import type { Lesson } from "@/types/lesson";
import type { Commit, GitState } from "@/lib/git-engine/types";

const now = Date.now();

const firstCommit: Commit = {
  sha: "aaa1111",
  parents: [],
  message: "primer commit",
  author: "Tu Amigo <amigo@ejemplo.com>",
  timestamp: now - 60_000,
  files: { "app.js": "console.log('hola');\n" },
};

const initialState: GitState = {
  initialized: true,
  workingDir: {
    "app.js": "console.log('hola, mundo');\n",
  },
  staging: {},
  lastCommitted: { "app.js": "console.log('hola');\n" },
  commits: [firstCommit],
  refs: {
    HEAD: "main",
    branches: { main: "aaa1111" },
  },
  gitignore: [],
  config: { user: { name: "Tu Amigo", email: "amigo@ejemplo.com" } },
};

const lesson: Lesson = {
  slug: "diff",
  title: "git diff",
  intro: [
    "Antes de subir un archivo a la mesa de revisión, suele venir bien repasar exactamente qué cambió. Eso es lo que te muestra `git diff`.",
    "El comando compara lo que tienes en working dir con lo que había en el último commit. Las líneas que añadiste salen marcadas con un `+` (en verde), las que quitaste con un `-` (en rojo). Las que no cambiaron aparecen como contexto.",
    "En este repo el archivo `app.js` tiene una línea distinta a la que se commiteó. Vamos a leer el diff y entender qué pasó.",
  ].join("\n\n"),
  initialState,
  steps: [
    {
      title: "Lee los cambios",
      body: "Ejecuta `git diff` y observa el archivo `app.js`. Verás la línea original tachada y la nueva añadida justo debajo.",
    },
  ],
  challenge: {
    prompt: "Inspecciona los cambios pendientes con `git diff`.",
    successCondition: (_state, history) =>
      history.some((h) => h.input.startsWith("git diff")),
    hint: "git diff",
  },
};

export default lesson;
