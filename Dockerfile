# ---- 1. Base Image ----
FROM node:20-alpine AS base

WORKDIR /app

# ---- 2. pnpm installieren ----
RUN npm install -g pnpm

# ---- 3. package.json und Lockfile kopieren und deps installieren ----
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---- 4. Quellcode und env.template kopieren ----
COPY ./src ./src
COPY tsconfig.json ./
COPY .env.template ./

# ---- 5. .env.template in .env umbenennen ----
RUN cp .env.template .env

# ---- 6. Prisma Client generieren ----
RUN pnpm prisma generate

# ---- 7. TypeScript kompilieren ----
RUN pnpm exec tsc

# ---- 8. Produktions-Image ----
FROM node:20-alpine

WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/package.json ./
COPY --from=base /app/.env ./

EXPOSE 3001

CMD ["node", "dist/app.js"]
