import type { Lesson } from "@/types/lesson";
import { freshState } from "@/lib/git-engine/types";

const lesson: Lesson = {
  slug: "que-es-git",
  title: "¿Qué es Git?",
  intro: [
    "Git es como un álbum de fotos de tu proyecto. Cada vez que terminas algo importante, le pides a Git que tome una foto de cómo están todos tus archivos en ese momento. A esa foto la llamamos commit.",
    "Lo bonito es que esas fotos no se borran nunca. Si mañana rompes algo o pruebas una idea que no funciona, puedes volver al álbum y rescatar la versión que sí funcionaba.",
    "En este curso vas a aprender Git desde cero, sin jerga innecesaria, paso a paso. Cada lección termina con un pequeño reto en una terminal simulada para que practiques lo que acabas de leer.",
    "No necesitas instalar nada todavía. Cuando estés listo, pulsa el botón para avanzar.",
  ].join("\n\n"),
  initialState: freshState({}),
  steps: [
    {
      title: "Snapshots, no diferencias",
      body: "A diferencia de otras herramientas, Git no guarda solo lo que cambió: guarda el estado completo del proyecto en cada commit. Eso lo hace súper rápido para volver atrás.",
    },
    {
      title: "Tu historia, en orden",
      body: "Los commits forman una cadena: cada uno apunta al anterior. Pronto vas a ver esa cadena dibujada como un grafo a la derecha de la pantalla.",
    },
  ],
  challenge: {
    prompt: "Lee la introducción y, cuando lo tengas claro, marca la lección como entendida para avanzar.",
    successCondition: () => true,
    hint: "No hay comandos en esta lección. Solo confirma que entiendes la idea de los snapshots.",
  },
};

export default lesson;
