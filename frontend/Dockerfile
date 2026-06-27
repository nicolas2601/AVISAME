# Frontend Next.js (PWA) - AvisameAccasoft
# Multi-stage build con pnpm

FROM node:22-alpine AS base

RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# --- Dependencias ---
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- Build ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN pnpm build

# --- Runtime ---
FROM node:22-alpine AS runner

ENV NODE_ENV=production \
    PORT=3000

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=builder /app .

USER nextjs
EXPOSE 3000

CMD ["pnpm", "start"]
