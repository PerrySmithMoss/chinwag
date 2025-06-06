#!/bin/sh

# Exit on any failure
set -e

if [ -f "/run/secrets/chinwag_database_url" ]; then
  export DATABASE_URL=$(cat /run/secrets/chinwag_database_url)
fi

echo "DATABASE_URL: $DATABASE_URL"

echo "Running prisma migrate deploy..."
npx prisma migrate deploy

echo "Starting server..."
exec node dist/server.js
