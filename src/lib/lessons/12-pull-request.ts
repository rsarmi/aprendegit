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
    commits: [c1, c2, c3],
    branches: {
      main: "bb22bb2",
      "feature/saludo": "cc33cc3",
    },
    pullRequests: [],
  },
};

const lesson: Lesson = {
  slug: "pull-request",
  title: "¿Qué es un Pull Request?",
  intro: [
    "Que tu rama esté en el remoto no quiere decir que esté aceptada. Sigue siendo una propuesta. El siguiente paso es pedir formalmente que se incorpore a `main`. A esa petición se le llama Pull Request (o Merge Request, según la plataforma).",
    "Un PR es una conversación alrededor de un cambio. Tú propones unir `feature/saludo` en `main`, escribes un título y una descripción de qué hiciste y por qué. Otra persona lo revisa, comenta, sugiere ajustes. Cuando hay luz verde, alguien pulsa Merge y la rama se funde con `main`.",
    "Un buen título es corto y describe el cambio en presente: 'Mejora el saludo del usuario'. La descripción explica el contexto: qué cambió, por qué, cómo probarlo. No es burocracia: es un favor enorme a quien va a revisar tu código.",
    "A la derecha tienes el panel del remoto con un formulario. Redacta tu PR y envíalo.",
  ].join("\n\n"),
  initialState,
  showRemote: true,
  steps: [
    {
      title: "Abre el formulario",
      body: "Mira el panel del remoto. Tienes un campo para el título y otro para la descripción del Pull Request.",
    },
    {
      title: "Escribe con claridad",
      body: "Título: una frase corta. Descripción: 2-3 líneas que cuenten qué cambió y por qué. Cuando estés a gusto, pulsa Crear PR.",
    },
  ],
  challenge: {
    prompt: "Redacta el título y la descripción del Pull Request y envíalo.",
    successCondition: (state) =>
      (state.remote?.pullRequests.length ?? 0) > 0,
    hint: "Usa el formulario de la derecha. El título debe describir el cambio en una frase.",
  },
};

export default lesson;
