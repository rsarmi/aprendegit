import type { Lesson } from "@/types/lesson";
import type { Commit, GitState } from "@/lib/git-engine/types";

const now = Date.now();

const c1: Commit = {
  sha: "111aaaa",
  parents: [],
  message: "inicio del proyecto",
  author: "Tu Amigo <amigo@ejemplo.com>",
  timestamp: now - 180_000,
  files: { "app.js": "console.log('v1');\n" },
};

const c2: Commit = {
  sha: "222bbbb",
  parents: ["111aaaa"],
  message: "mejora el saludo",
  author: "Tu Amigo <amigo@ejemplo.com>",
  timestamp: now - 120_000,
  files: { "app.js": "console.log('v2');\n" },
};

const c3: Commit = {
  sha: "333cccc",
  parents: ["222bbbb"],
  message: "añade README",
  author: "Tu Amigo <amigo@ejemplo.com>",
  timestamp: now - 60_000,
  files: {
    "app.js": "console.log('v2');\n",
    "README.md": "# Proyecto\n",
  },
};

const initialState: GitState = {
  initialized: true,
  workingDir: {
    "app.js": "console.log('v2');\n",
    "README.md": "# Proyecto\n",
  },
  staging: {},
  lastCommitted: {
    "app.js": "console.log('v2');\n",
    "README.md": "# Proyecto\n",
  },
  commits: [c1, c2, c3],
  refs: {
    HEAD: "main",
    branches: { main: "333cccc" },
  },
  gitignore: [],
  config: { user: { name: "Tu Amigo", email: "amigo@ejemplo.com" } },
};

const lesson: Lesson = {
  slug: "que-es-rama",
  title: "¿Qué es una rama?",
  intro: [
    "Hasta ahora todos tus commits viven en una línea recta llamada `main`. Es la rama por defecto: el camino oficial del proyecto.",
    "Una rama, en realidad, es algo mucho más simple de lo que su nombre sugiere. No es una copia del proyecto. Es solo un puntero móvil que apunta al último commit de un camino. Cuando haces un commit nuevo, Git mueve el puntero al commit recién creado.",
    "También existe `HEAD`, otro puntero, que indica en qué rama estás trabajando ahora mismo. Si `HEAD` apunta a `main`, los commits que hagas mueven `main`. Si lo cambias a otra rama, los commits mueven esa otra.",
    "La gracia es que puedes tener varios punteros a la vez. Eso te permite probar una idea en una rama nueva sin tocar la principal. Si la idea funciona, la traes a `main`. Si no funciona, borras la rama y `main` ni se entera.",
  ].join("\n\n"),
  initialState,
  steps: [
    {
      title: "Solo un puntero",
      body: "Mira el grafo de la derecha: la etiqueta `main` está pegada al último commit. Es literalmente eso: un nombre adherido a un sha.",
    },
    {
      title: "HEAD también es un puntero",
      body: "`HEAD` apunta a la rama activa. Por eso, cuando haces commit, Git sabe a qué rama mover.",
    },
  ],
  challenge: {
    prompt: "Lee la idea: una rama es un puntero móvil. Cuando lo tengas claro, avanza para crearlas tú.",
    successCondition: () => true,
    hint: "Una rama es solo un puntero móvil sobre la cadena de commits.",
  },
};

export default lesson;
