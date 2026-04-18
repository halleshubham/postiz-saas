#!/bin/sh
set -e

# Load server environment variables
set -a
. /app/env/server.env
set +a

# Run migrations and start the server (Wasp 0.23 SSR serves everything)
exec npm run start-production
