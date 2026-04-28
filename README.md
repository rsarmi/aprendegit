# aprendegit

Aplicación interactiva para enseñar Git desde cero, con lecciones guiadas, animaciones y una terminal simulada en el navegador.

## Stack

- **Next.js 15** (App Router, output `standalone`)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (animaciones)
- **Zustand** (estado global)

## Cómo correr en local (con bun)

Requisitos: [Bun](https://bun.sh) 1.3 o superior.

```bash
bun install
bun run dev
```

La app queda disponible en `http://localhost:3000`.

Otros scripts:

```bash
bun run build   # build de producción
bun run start   # arranca el server compilado
bun run lint    # linter
```

## Cómo correr con Docker

Requiere Docker y Docker Compose.

```bash
docker compose up --build
```

Esto construye la imagen multi-stage (deps -> builder -> runner) y expone la app en `http://localhost:3000`. El contenedor corre con un usuario no-root (`nextjs:1001`) y trae un healthcheck contra `/api/health`.

Para detener:

```bash
docker compose down
```

## Cómo desplegar a Railway

Railway detecta el `Dockerfile` automáticamente y usa la config en `railway.json` (healthcheck en `/api/health`, reinicio `ON_FAILURE` con hasta 3 reintentos).

### Opción A: con la CLI

```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

### Opción B: desde GitHub

1. Push del repo a GitHub.
2. En Railway: **New Project -> Deploy from GitHub repo**.
3. Selecciona el repo. Railway detecta el `Dockerfile` y arranca el build.
4. Una vez deployado, Railway expone la URL pública.

No hace falta configurar variables de entorno por ahora (ver `.env.example`).

## Estructura del proyecto

```
aprendegit/
├── src/
│   ├── app/              # App Router (rutas, layouts, API)
│   ├── components/       # UI reutilizable
│   ├── lib/
│   │   ├── lessons/      # Definiciones de lecciones (agregar aqui)
│   │   ├── git-engine/   # Simulador de Git en el browser
│   │   └── store/        # Stores de Zustand
│   └── styles/
├── public/               # Assets estaticos
├── Dockerfile            # Build multi-stage para produccion
├── docker-compose.yml    # Run local con Docker
├── railway.json          # Config de despliegue Railway
├── next.config.ts        # output: "standalone"
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Cómo añadir una lección nueva

Las lecciones viven en `src/lib/lessons/`. Cada lección es un objeto tipado que describe pasos, comandos esperados, hints y estado inicial del repo simulado.

Pasos típicos:

1. Crea un archivo nuevo en `src/lib/lessons/` (por ejemplo `mi-leccion.ts`).
2. Exporta el objeto de lección siguiendo el contrato de `Lesson`.
3. Regístralo en el índice de lecciones (`src/lib/lessons/index.ts`).
4. Verifica en local con `bun run dev`.

## Roadmap

Funcionalidades **fuera de alcance** en la versión actual, planeadas para más adelante:

- Rebase interactivo y `cherry-pick`
- Resolución de conflictos de merge
- `git reset` y `git revert` con visualización completa de la historia
- Integración con la API real de GitHub (auth, push real a repos)
- Modo multi-usuario / colaboración en tiempo real
- Persistencia de progreso en backend (hoy es local)

Sugerencias y PRs son bienvenidos.
