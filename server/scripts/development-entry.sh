#!/bin/sh
set -e

echo "Running migrations and generating the Prisma client..."
yarn prisma migrate deploy
yarn prisma generate

echo "Starting dev server..."
exec yarn dev
