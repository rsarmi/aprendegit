import type { Lesson } from "@/types/lesson";
import type { Commit, GitState } from "@/lib/git-engine/types";

const now = Date.now();

const firstCommit: Commit = {
  sha: "def5678",
  parents: [],
  message: "primer commit",
  author: "Tu Amigo <amigo@ejemplo.com>",
  timestamp: now - 60_000,
  files: { "app.js": "console.log('hola');\n" },
};

const initialState: GitState = {
  initialized: true,
  workingDir: {
    "app.js": "console.log('hola');\n",
    "node_modules/foo.js": "// dependencia descargada\n",
  },
  staging: {},
  lastCommitted: { "app.js": "console.log('hola');\n" },
  commits: [firstCommit],
  refs: {
    HEAD: "main",
    branches: { main: "def5678" },
  },
  gitignore: [],
  config: { user: { name: "Tu Amigo", email: "amigo@ejemplo.com" } },
};

const lesson: Lesson = {
  slug: "gitignore",
  title: ".gitignore",
  intro: [
    "Hay archivos que nunca queremos en el álbum. Carpetas de dependencias, archivos generados, configuraciones personales, claves de acceso. Si los commiteas, ensucian la historia y, peor, pueden filtrar secretos.",
    "Para eso existe un archivo de texto llamado `.gitignore`. Cada línea es un patrón: una carpeta, un nombre, una extensión. Git lee ese archivo y simplemente hace como que esos archivos no existen.",
    "En este repo tienes un `app.js` que sí queremos versionar y una carpeta `node_modules/` que claramente no. Vamos a enseñarle a Git a ignorarla.",
  ].join("\n\n"),
  initialState,
  steps: [
    {
      title: "Añade la regla",
      body: "Añade `node_modules` al archivo `.gitignore`. En la terminal puedes hacerlo escribiendo `echo \"node_modules\" >> .gitignore`.",
    },
    {
      title: "Comprueba el efecto",
      body: "Después ejecuta `git status` para ver que la carpeta `node_modules/` ya no aparece como archivo sin seguir.",
    },
  ],
  challenge: {
    prompt: "Ignora `node_modules` con un `.gitignore` y verifica el estado del repositorio.",
    successCondition: (state, history) =>
      state.gitignore.includes("node_modules") &&
      history.some((h) => h.input.startsWith("git status")),
    hint: 'echo "node_modules" >> .gitignore  →  luego  git status',
  },
  showAreas: true,
};

export default lesson;
