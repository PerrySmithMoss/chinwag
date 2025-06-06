# ------------------------------------------------
# Base stage: installs system deps and copies base files
# ------------------------------------------------
FROM node:22.14.0-bullseye-slim AS base

WORKDIR /app

# Install system dependencies once
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 make g++ && \
    ln -s /usr/bin/python3 /usr/bin/python && \
    npm install -g node-gyp && \
    rm -rf /var/lib/apt/lists/*

# Copy package files and Prisma schema + tsconfig for caching
COPY package.json yarn.lock ./
COPY prisma ./prisma/
COPY tsconfig.json .

# ------------------------------------------------
# Development stage
# ------------------------------------------------
FROM base AS dev

# Install all dependencies (including dev)
RUN yarn install --frozen-lockfile

COPY src ./src

# Copy entrypoint with correct permissions in one step
COPY --chmod=755 scripts/development-entry.sh /development-entry.sh

EXPOSE 5560

CMD ["/development-entry.sh"]

# ------------------------------------------------
# Builder stage: build production artifacts
# ------------------------------------------------
FROM base AS builder

# Install all dependencies needed for build
RUN yarn install --frozen-lockfile

COPY src ./src

# Generate Prisma client and build TypeScript
RUN npx prisma generate && yarn build

# ------------------------------------------------
# Production dependencies stage: only prod deps
# ------------------------------------------------
FROM base AS deps

RUN yarn install --production --frozen-lockfile --prefer-offline

# ------------------------------------------------
# Final production image: minimal, no build tools
# ------------------------------------------------
FROM node:22.14.0-bullseye-slim AS production

# Install tini as init system for signal handling
RUN apt-get update && apt-get install -y --no-install-recommends tini && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Copy production node_modules only
COPY --from=deps /app/node_modules ./node_modules

# Copy Prisma client submodules (required for Prisma runtime)
COPY --from=builder /app/node_modules/@prisma /app/node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma

# Copy production entrypoint script with exec permissions
COPY --chmod=755 scripts/production-entry.sh /production-entry.sh

# Set permissions and drop root
RUN chown -R node:node /app
USER node

ENTRYPOINT ["/usr/bin/tini", "--"]

EXPOSE 5560

CMD ["/production-entry.sh"]
