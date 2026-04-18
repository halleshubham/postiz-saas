FROM node:24.14.1-alpine3.23 AS base
RUN apk --no-cache -U upgrade
RUN apk add --no-cache openssl


FROM base AS builder
RUN apk add --no-cache python3 build-base curl
RUN npm i -g @wasp.sh/wasp-cli

WORKDIR /app

# Copy project files
COPY package.json package-lock.json ./
COPY main.wasp schema.prisma vite.config.ts tsconfig*.json .wasproot .waspignore ./
COPY src/ src/

# Install dependencies
RUN npm install

# Generate the Postiz Prisma client (second DB)
RUN npx prisma generate --schema=src/postiz-db/schema.prisma

# Generate Wasp output (.wasp/out/)
RUN wasp build

# Build the server (follows Wasp's own generated Dockerfile pattern)
RUN cd .wasp/out/server && npm install
RUN cd .wasp/out/server && npx prisma generate --schema='../db/schema.prisma'
RUN cd .wasp/out/server && npm run bundle


# ── Production image (lean) ──
FROM base AS production
RUN apk add --no-cache python3
ENV NODE_ENV=production
WORKDIR /app

# Top-level node_modules (Prisma CLI + Postiz Prisma client)
COPY --from=builder /app/node_modules ./node_modules
# Server node_modules (dotenv, express, etc.)
COPY --from=builder /app/.wasp/out/server/node_modules .wasp/out/server/node_modules
# Compiled server bundle
COPY --from=builder /app/.wasp/out/server/bundle .wasp/out/server/bundle
COPY --from=builder /app/.wasp/out/server/package*.json .wasp/out/server/
# DB schema (for prisma migrate deploy)
COPY --from=builder /app/.wasp/out/db/ .wasp/out/db/

WORKDIR /app/.wasp/out/server

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 3001
ENTRYPOINT ["/app/entrypoint.sh"]
