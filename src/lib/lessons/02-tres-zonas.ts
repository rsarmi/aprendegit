import type { Lesson } from "@/types/lesson";
import { freshState } from "@/lib/git-engine/types";

const lesson: Lesson = {
  slug: "tres-zonas",
  title: "Las tres zonas",
  intro: [
    "Antes de que un archivo termine en el álbum, pasa por tres habitaciones. Vamos a darles nombres claros.",
    "La primera es el working directory: tu carpeta de trabajo. Aquí escribes, borras y experimentas. Git lo ve, pero no se mete.",
    "La segunda es el staging area, también llamada index. Es la mesa de revisión: pones aquí los archivos que quieres que aparezcan en la próxima foto. Si algo no quieres que salga en esa foto, no lo subes a la mesa.",
    "La tercera es el repositorio. Es el álbum en sí: la lista de fotos (commits) que ya guardaste para siempre.",
  ].join("\n\n"),
  initialState: freshState({ "saludo.txt": "Hola mundo\n" }),
  steps: [
    {
      title: "Working dir",
      body: "Tu archivo `saludo.txt` ya está creado en la carpeta de trabajo. Git lo nota, pero todavía no lo sigue: no le has dicho que le interese.",
    },
    {
      title: "Staging",
      body: "Cuando haces `git add`, mueves el archivo a la mesa de revisión. Es como decir: 'esto sí quiero que salga en la próxima foto'.",
    },
    {
      title: "Repositorio",
      body: "Cuando haces `git commit`, Git toma la foto de la mesa y la guarda en el álbum con un mensaje. A partir de ahí ya forma parte de la historia.",
    },
  ],
  challenge: {
    prompt: "Identifica dónde vive `saludo.txt` ahora mismo. Cuando lo tengas, marca la lección como entendida.",
    successCondition: () => false,
    hint: "Aún no está versionado: vive en working dir.",
  },
  mode: "manual",
  showAreas: true,
};

export default lesson;
