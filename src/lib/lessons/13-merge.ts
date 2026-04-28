import type { Lesson } from "@/types/lesson";
import type { Commit, GitState, PullRequest } from "@/lib/git-engine/types";

const now = Date.now();

const c1: Commit = {
  sha: "aa11aa1",
  parents: [],
  message: "inicio del proyecto",
  author: "Tu Amigo <amigo@ejemplo.com>",
  timestamp: now - 240_000,
  files: { "saludo.txt": "Hola\n" },
};

const c2: Commit = {
  sha: "bb22bb2",
  parents: ["aa11aa1"],
  message: "documenta el proyecto",
  author: "Tu Amigo <amigo@ejemplo.com>",
  timestamp: now - 180_000,
  files: {
    "saludo.txt": "Hola\n",
    "README.md": "# Proyecto\n",
  },
};

const c3: Commit = {
  sha: "cc33cc3",
  parents: ["bb22bb2"],
  message: "saludo más cálido",
  author: "Tu Amigo <amigo@ejemplo.com>",
  timestamp: now - 120_000,
  files: {
    "saludo.txt": "Hola, equipo\n",
    "README.md": "# Proyecto\n",
  },
};

const openPr: PullRequest = {
  id: 1,
  title: "Mejora el saludo del usuario",
  body: "Cambia el mensaje a un tono más cercano. Listo para revisión.",
  fromBranch: "feature/saludo",
  toBranch: "main",
  state: "open",
  createdAt: now - 60_000,
};

const initialState: GitState = {
  initialized: true,
  workingDir: {
    "saludo.txt": "Hola, equipo\n",
    "README.md": "# Proyecto\n",
  },
  staging: {},
  lastCommitted: {
    "saludo.txt": "Hola, equipo\n",
    "README.md": "# Proyecto\n",
  },
  commits: [c1, c2, c3],
  refs: {
    HEAD: "main",
    branches: {
      main: "bb22bb2",
      "feature/saludo": "cc33cc3",
    },
  },
  gitignore: [],
  config: { user: { name: "Tu Amigo", email: "amigo@ejemplo.com" } },
  remote: {
    name: "origin",
    url: "https://github.com/tu-amigo/aprendegit.git",
    commits: [c1, c2, c3],
    branches: {
      main: "bb22bb2",
      "feature/saludo": "cc33cc3",
    },
    pullRequests: [openPr],
  },
};

const lesson: Lesson = {
  slug: "merge",
  title: "Merge y git pull",
  intro: [
    "Última pieza del flujo. El Pull Request está abierto, alguien lo revisó (en este caso, tú mismo) y le dio luz verde. Ahora hay que mergearlo: unir `feature/saludo` en `main` dentro del remoto.",
    "Tras el merge, `main` en el remoto contiene los commits de tu rama. Pero tu `main` local sigue donde estaba, sin saber lo que pasó. Para enterarse usa `git pull origin main`: trae al local los commits que falten del remoto.",
    "Después del pull, tu `main` local queda al día con el remoto. Acabas de cerrar el ciclo completo: rama → commits → push → PR → review → merge → pull. Con este flujo ya puedes colaborar con cualquier persona en el mundo.",
  ].join("\n\n"),
  initialState,
  showRemote: true,
  steps: [
    {
      title: "Mergea el PR",
      body: "Pulsa el botón Merge en el panel del Pull Request. La rama `feature/saludo` se funde con `main` en el remoto.",
    },
    {
      title: "Trae los cambios",
      body: "Ahora ejecuta `git pull origin main` en la terminal. Verás cómo los commits viajan del remoto a tu grafo local.",
    },
  ],
  challenge: {
    prompt: "Mergea el Pull Request y trae los cambios a tu repositorio local.",
    successCondition: (state, history) =>
      state.remote?.pullRequests[0]?.state === "merged" &&
      history.some((h) => h.input.startsWith("git pull")),
    hint: "Click en Merge en el panel del PR  →  luego ejecuta `git pull origin main`.",
  },
};

export default lesson;
