FROM node:24.14.1-alpine3.23

RUN apk --no-cache -U upgrade
RUN apk add --no-cache openssl python3 build-base curl

# Install Wasp CLI (for wasp build) and serve (for static client files)
RUN npm i -g @wasp.sh/wasp-cli serve

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

# Build the server bundle (follows Wasp's own Dockerfile pattern)
RUN cd .wasp/out/server && npm install
RUN cd .wasp/out/server && npx prisma generate --schema='../db/schema.prisma'
RUN cd .wasp/out/server && npm run bundle

# Install web-app dependencies (client is built at startup with correct API URL)
RUN cd .wasp/out/web-app && npm install

EXPOSE 3001 3000

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
