#!/bin/sh
set -eu
image=${1:?Pass the built API image tag}
database_image=$(docker build --quiet "$(dirname "$0")/../../docker/postgres")
fixture="api-smoke-$$"
database="$fixture-db"
api="$fixture-server"
cleanup() {
  docker rm -f "$api" "$database" >/dev/null 2>&1 || true
  docker network rm "$fixture" >/dev/null 2>&1 || true
}
trap cleanup EXIT
docker network create "$fixture" >/dev/null
docker run -d --name "$database" --network "$fixture" \
  -e POSTGRES_USER=fixture -e POSTGRES_PASSWORD=fixture -e POSTGRES_DB=fixture \
  "$database_image" >/dev/null
for _ in $(seq 1 40); do
  if docker exec "$database" pg_isready -h 127.0.0.1 -U fixture -d fixture >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
docker exec "$database" pg_isready -h 127.0.0.1 -U fixture -d fixture >/dev/null
docker run -d --name "$api" --network "$fixture" -p 127.0.0.1::5560 \
  -e DATABASE_URL="postgresql://fixture:fixture@$database:5432/fixture" \
  -e JWT_SECRET=fixture-signing-key-for-smoke-tests \
  -e CLOUDINARY_CLOUD_NAME=fixture -e CLOUDINARY_API_KEY=fixture -e CLOUDINARY_API_SECRET=fixture \
  -e CLIENT_URL=http://localhost -e SERVER_URL=http://localhost -e SERVER_DOMAIN=localhost \
  -e NODE_ENV=production "$image" >/dev/null
origin="http://$(docker port "$api" 5560/tcp)"
for _ in $(seq 1 40); do
  if curl -sS --max-time 2 -o /dev/null "$origin" 2>/dev/null; then
    break
  fi
  sleep 1
done
export SMOKE_API_ORIGIN="$origin"
if ! node "$(dirname "$0")/smoke-api.mjs" ||
   ! node "$(dirname "$0")/test-account-management.mjs" ||
   ! node "$(dirname "$0")/test-chat-security.mjs"; then
  docker logs "$api" >&2
  exit 1
fi
