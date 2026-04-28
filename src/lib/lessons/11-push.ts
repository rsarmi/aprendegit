import type { Lesson } from "@/types/lesson";
import type { Commit, GitState } from "@/lib/git-engine/types";

const now = Date.now();

const c1: Commit = {
  sha: "aa11aa1",
  parents: [],
  message: "inicio del proyecto",
  author: "Tu Amigo <amigo@ejemplo.com>",
  timestamp: now - 180_000,
  files: { "saludo.txt": "Hola\n" },
};

const c2: Commit = {
  sha: "bb22bb2",
  parents: ["aa11aa1"],
  message: "documenta el proyecto",
  author: "Tu Amigo <amigo@ejemplo.com>",
  timestamp: now - 120_000,
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
  timestamp: now - 60_000,
  files: {
    "saludo.txt": "Hola, equipo\n",
    "README.md": "# Proyecto\n",
  },
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
    HEAD: "feature/saludo",
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
    commits: [c1, c2],
    branches: { main: "bb22bb2" },
    pullRequests: [],
  },
};

const lesson: Lesson = {
  slug: "push",
  title: "git push",
  intro: [
    "Tu repo local ya tiene un remoto, pero la rama `feature/saludo` solo existe en tu máquina. Si te atropella un autobús, ese commit cálido se va contigo. Vamos a subirlo.",
    "El comando es `git push origin feature/saludo`. Le estás diciendo a Git: 'envía mi rama `feature/saludo` al remoto llamado `origin`'. Si la rama no existía allí, se crea; si ya existía y va por detrás de la tuya, se actualiza.",
    "Mira la animación: vas a ver cómo el commit viaja de tu grafo local al panel del remoto. A partir de ese momento, cualquier persona con acceso al remoto puede ver tu trabajo.",
  ].join("\n\n"),
  initialState,
  showRemote: true,
  steps: [
    {
      title: "Sube tu rama",
      body: "Ejecuta `git push origin feature/saludo`. El commit se replicará en el panel del remoto.",
    },
    {
      title: "Lo tuyo ya no es solo tuyo",
      body: "A partir de ahora, otra persona puede clonar el repo y traerse tu rama. Es el primer paso para colaborar.",
    },
  ],
  challenge: {
    prompt: "Sube la rama `feature/saludo` al remoto.",
    successCondition: (state) =>
      state.remote?.branches["feature/saludo"] !== undefined,
    hint: "git push origin feature/saludo",
  },
};

export default lesson;
