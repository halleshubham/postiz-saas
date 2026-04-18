#!/bin/sh
set -e

# ── Load server environment variables ──
echo "Loading environment from /app/env/server.env..."
set -a
. /app/env/server.env
set +a

# ── Build client with correct API URL (Vite bakes it into the bundle) ──
echo "Building client (REACT_APP_API_URL=${WASP_SERVER_URL})..."
cd /app/.wasp/out/web-app
REACT_APP_API_URL="${WASP_SERVER_URL}" npx vite build
echo "Client built."

# ── Run database migrations ──
echo "Running database migrations..."
cd /app/.wasp/out/server
npx prisma migrate deploy --schema='../db/schema.prisma'
echo "Migrations done."

# ── Start server (port 3001) ──
echo "Starting server on port ${PORT:-3001}..."
NODE_ENV=production node --enable-source-maps bundle/server.js &
SERVER_PID=$!

# ── Serve client static files (port 3000) ──
echo "Serving client on port 3000..."
serve -s /app/.wasp/out/web-app/build -l 3000 &
CLIENT_PID=$!

# Wait for either process to exit
wait $SERVER_PID $CLIENT_PID
