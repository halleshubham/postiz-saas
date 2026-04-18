FROM node:24.14.1-alpine3.23

RUN apk --no-cache -U upgrade
RUN apk add --no-cache openssl python3 build-base curl

# Install Wasp CLI
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

# Build the Wasp project
RUN wasp build

# Expose server and client ports
EXPOSE 3001 3000

# wasp build start serves both server (3001) and client (3000).
# Server env vars are passed via --server-env-file.
# REACT_APP_API_URL tells the client where the API lives.
ENTRYPOINT ["sh", "-c", \
  "wasp build start \
    --server-env-file /app/env/server.env \
    --client-env REACT_APP_API_URL=${CLIENT_API_URL}"]
