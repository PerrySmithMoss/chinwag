# ------------------------------------------------
# Base stage: installs system deps and copies base files
# ------------------------------------------------
ARG NODE_IMAGE=node:22.23.4-trixie-slim@sha256:be1e2a3dc2c4fd68cdfadad2a696a280e0d2749098bee509230174d72fb768c6
FROM ${NODE_IMAGE} AS base

WORKDIR /app

# Install system dependencies once
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates openssl python3 make g++ && \
    ln -s /usr/bin/python3 /usr/bin/python && \
    npm install -g node-gyp && \
    rm -rf /var/lib/apt/lists/*

# Copy package files and Prisma schema + tsconfig for caching
COPY package.json yarn.lock ./
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
FROM ${NODE_IMAGE} AS production

# Install tini as init system for signal handling
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates openssl tini && \
    rm -rf /var/lib/apt/lists/*

# Runtime and Prisma migrations only need Node, not package installers.
RUN rm -rf /usr/local/lib/node_modules /opt/yarn-* \
    /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
    /usr/local/bin/yarn /usr/local/bin/yarnpkg

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
