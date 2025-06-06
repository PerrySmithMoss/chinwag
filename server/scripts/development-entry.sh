#!/bin/sh
set -e

echo "Running migrations..."
npx prisma migrate dev

echo "Starting dev server..."
exec yarn dev
