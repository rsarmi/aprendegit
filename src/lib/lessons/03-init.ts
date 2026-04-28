import type { Lesson } from "@/types/lesson";
import { freshState } from "@/lib/git-engine/types";

const lesson: Lesson = {
  slug: "init",
  title: "git init",
  intro: [
    "Para que Git empiece a observar tu carpeta tienes que decírselo explícitamente. Eso se hace con `git init`.",
    "Cuando ejecutas el comando, Git crea una carpeta oculta llamada `.git` dentro de tu proyecto. Ahí va a guardar todos los commits, las ramas y la configuración. Tú no necesitas tocar nada de esa carpeta: es asunto de Git.",
    "A partir de ese momento decimos que la carpeta es un repositorio. Acabas de abrir un álbum vacío, listo para recibir su primera foto.",
  ].join("\n\n"),
  initialState: freshState({ "saludo.txt": "Hola\n" }),
  steps: [
    {
      title: "Una sola vez",
      body: "`git init` se ejecuta una sola vez por proyecto. Si lo ejecutas de nuevo no rompe nada, simplemente Git te dice que ya estaba inicializado.",
    },
    {
      title: "Nada se mueve aún",
      body: "Después de `init`, tus archivos siguen donde estaban. Lo que cambia es que ahora Git tiene una libreta donde apuntar lo que pase con ellos.",
    },
  ],
  challenge: {
    prompt: "Inicializa el repositorio en esta carpeta.",
    successCondition: (state) => state.initialized === true,
    hint: "Escribe `git init`.",
  },
};

export default lesson;
