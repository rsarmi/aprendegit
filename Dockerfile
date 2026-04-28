# syntax=docker/dockerfile:1.7

# ---------- Stage 1: deps ----------
FROM oven/bun:1-alpine AS deps
WORKDIR /app

# Copia los lockfiles que existan; el resto se ignora silenciosamente.
COPY package.json bun.lock* package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# Si hay bun.lock, usa instalación reproducible. Si no, fallback a install normal.
RUN if [ -f bun.lock ]; then \
      bun install --frozen-lockfile; \
    else \
      bun install; \
    fi

# ---------- Stage 2: builder ----------
FROM oven/bun:1-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build

# ---------- Stage 3: runner ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crea usuario y grupo no-root para correr la app.
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copia los assets públicos.
COPY --from=builder /app/public ./public

# Copia el output standalone de Next.js (incluye server.js y node_modules mínimos).
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Healthcheck opcional: requiere endpoint /api/health en la app.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
