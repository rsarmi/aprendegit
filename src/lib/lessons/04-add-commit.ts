import type { Lesson } from "@/types/lesson";
import { freshState, type GitState } from "@/lib/git-engine/types";

const initialState: GitState = {
  ...freshState({
    "saludo.txt": "Hola mundo\n",
    "README.md": "# Mi proyecto\n",
  }),
  initialized: true,
  config: { user: { name: "Tu Amigo", email: "amigo@ejemplo.com" } },
};

const lesson: Lesson = {
  slug: "add-commit",
  title: "git add y git commit",
  intro: [
    "Ya tienes un repositorio inicializado y dos archivos en la carpeta de trabajo. Toca dar el siguiente paso: tomar la primera foto.",
    "Hacerlo son dos movimientos. Primero `git add <archivo>` sube ese archivo a la mesa de revisión (staging). Luego `git commit -m \"mensaje\"` toma la foto de todo lo que esté en la mesa y lo guarda con un mensaje corto que describe el cambio.",
    "El mensaje del commit es importante: tu yo del futuro va a leerlo cuando quiera entender por qué hiciste algo. Sé concreto, en presente, en una sola línea: 'añade saludo inicial', 'arregla cálculo del total', 'limpia estilos del header'.",
  ].join("\n\n"),
  initialState,
  steps: [
    {
      title: "Sube a la mesa",
      body: "Usa `git add saludo.txt` para mover ese archivo al staging. Si quisieras subir todos los archivos a la vez podrías usar `git add .`, pero hoy practicamos uno por uno.",
    },
    {
      title: "Toma la foto",
      body: "Con `git commit -m \"primer commit\"` Git guarda la foto en el álbum. Verás aparecer el primer nodo en el grafo de la derecha.",
    },
  ],
  challenge: {
    prompt: "Haz tu primer commit incluyendo `saludo.txt`.",
    successCondition: (state) => state.commits.length >= 1,
    hint: 'git add saludo.txt && git commit -m "primer commit"',
  },
};

export default lesson;
