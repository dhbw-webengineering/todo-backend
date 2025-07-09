# 1. Base: node + pnpm
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

# 2. Abhängigkeiten installieren
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 3. Quellcode kopieren, env und Prisma vorbereiten
COPY ./src ./src
COPY tsconfig.json ./
RUN pnpm prisma generate

# 4. Build
RUN pnpm exec tsc

# 5. Runtime-Image
FROM node:20-alpine
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/package.json ./

EXPOSE 3001
CMD ["node", "dist/app.js"]
