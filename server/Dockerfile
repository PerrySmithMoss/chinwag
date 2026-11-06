# ------------------------------------------------
# Base stage: installs system deps and copies base files
# ------------------------------------------------
ARG NODE_IMAGE=node:24.20.0-alpine@sha256:e67514e5d0f6c46656005e1b693b2ec9d52e80b641307de684d4a015ba7a4eaf
FROM ${NODE_IMAGE} AS base

WORKDIR /app

# Install system dependencies once
RUN apk upgrade --no-cache && \
    apk add --no-cache ca-certificates openssl python3 make g++

# Copy package files and Prisma schema + tsconfig for caching
COPY package.json yarn.lock ./
COPY prisma.config.ts ./
COPY prisma ./prisma/
COPY tsconfig.json .
COPY tsconfig.build.json .

# ------------------------------------------------
# Development stage
# ------------------------------------------------
FROM base AS dev

# Install all dependencies (including dev)
RUN yarn install --frozen-lockfile

COPY src ./src
RUN mkdir -p src/generated/prisma && chown -R node:node src/generated

# Copy entrypoint with correct permissions in one step
COPY --chmod=755 scripts/development-entry.sh /development-entry.sh

EXPOSE 5560
USER node

CMD ["/development-entry.sh"]

# ------------------------------------------------
# Builder stage: build production artifacts
# ------------------------------------------------
FROM base AS builder

# Install all dependencies needed for build
RUN yarn install --frozen-lockfile

COPY src ./src

# Generate Prisma client and build TypeScript
RUN yarn build

# ------------------------------------------------
# Production dependencies stage: only prod deps
# ------------------------------------------------
FROM base AS deps

RUN yarn install --production --frozen-lockfile --prefer-offline

# ------------------------------------------------
# Final production image: minimal, no build tools
# ------------------------------------------------
FROM ${NODE_IMAGE} AS production

# Install tini as init system for signal handling
RUN apk upgrade --no-cache && \
    apk add --no-cache ca-certificates openssl tini

# Runtime and Prisma migrations only need Node, not package installers.
RUN rm -rf /usr/local/lib/node_modules /opt/yarn-* \
    /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
    /usr/local/bin/yarn /usr/local/bin/yarnpkg

WORKDIR /app

# Copy built artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts .

# Copy production node_modules only
COPY --from=deps /app/node_modules ./node_modules

# Copy production entrypoint script with exec permissions
COPY --chmod=755 scripts/production-entry.sh /production-entry.sh

USER node

ENTRYPOINT ["/sbin/tini", "--"]

EXPOSE 5560

CMD ["/production-entry.sh"]
