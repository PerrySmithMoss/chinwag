#!/bin/sh

# Exit on any failure
set -e

if [ -f "/run/secrets/chinwag_database_url" ]; then
  DATABASE_URL=$(cat /run/secrets/chinwag_database_url)
  export DATABASE_URL
fi

echo "Running prisma migrate deploy..."
./node_modules/.bin/prisma migrate deploy

echo "Starting server..."
exec node dist/server.js
