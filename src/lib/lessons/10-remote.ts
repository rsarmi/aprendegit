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
};

const lesson: Lesson = {
  slug: "remote",
  title: "Remote y origin",
  intro: [
    "Hasta ahora tu álbum vive solo en tu máquina. Bonito, pero frágil: si se te rompe el portátil, adiós historia. Y, sobre todo, no puedes colaborar con otra persona.",
    "Aquí entra el remoto: una copia de tu repositorio alojada en un servidor (GitHub, GitLab, etc.). Tú trabajas en local, y de vez en cuando sincronizas con el remoto: subes lo tuyo y bajas lo de los demás.",
    "Por convención, el remoto principal se llama `origin`. Es solo un alias para no tener que escribir la URL completa cada vez. Conectar tu repo local con `origin` se hace con `git remote add origin <url>`.",
    "En este reto vas a enlazar tu repositorio con un remoto ficticio. A la derecha verás aparecer el panel del remoto, todavía vacío.",
  ].join("\n\n"),
  initialState,
  showRemote: true,
  steps: [
    {
      title: "Añade el remoto",
      body: "Ejecuta `git remote add origin https://github.com/tu-amigo/aprendegit.git`. No pasa nada visible en tus archivos: solo se guarda la dirección.",
    },
    {
      title: "El remoto está vacío todavía",
      body: "Conectar el remoto no sube nada. Es como guardar el teléfono de un amigo en la agenda: aún no le has llamado.",
    },
  ],
  challenge: {
    prompt: "Conecta tu repositorio local con un remoto llamado `origin`.",
    successCondition: (state) => state.remote?.name === "origin",
    hint: "git remote add origin https://github.com/tu-amigo/aprendegit.git",
  },
};

export default lesson;
