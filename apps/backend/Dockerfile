# ============================================
# Stage 1: Build dependencies (monorepo base)
# ============================================
FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# ============================================
# Stage 2: Build application
# ============================================
FROM base AS builder

WORKDIR /app

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend
COPY tsconfig.base.json ./

# Generate Prisma client
RUN pnpm --filter @my-app/backend prisma:generate

# Build shared package and backend
RUN pnpm --filter @my-app/shared build 2>/dev/null || true
RUN pnpm --filter @my-app/backend build

# ============================================
# Stage 3: Production image
# ============================================
FROM node:20-alpine AS production

# Install build tools for native modules (bcrypt etc.)
RUN apk add --no-cache python3 make g++

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

WORKDIR /app

# Copy package files for production install
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/

# Install production dependencies only (ignore scripts to skip husky etc.)
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy Prisma schema for runtime reference
COPY apps/backend/prisma ./apps/backend/prisma

# Copy built application and generated Prisma Client from builder
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /app

USER nestjs

WORKDIR /app/apps/backend

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start application
CMD ["node", "dist/main"]
