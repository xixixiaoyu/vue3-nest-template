# ============================================
# Stage 1: Build dependencies (monorepo base)
# ============================================
FROM node:20-alpine AS base

# npm 镜像源配置 (淘宝镜像)
ENV COREPACK_NPM_REGISTRY=https://registry.npmmirror.com
ENV PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma

# 启用 corepack 并安装 pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# 先复制依赖配置文件，利用 Docker 层缓存
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/

# 安装依赖
RUN pnpm install --frozen-lockfile

# ============================================
# Stage 2: Build application
# ============================================
FROM base AS builder

WORKDIR /app

# 复制源代码
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend
COPY tsconfig.base.json ./

# 生成 Prisma Client
RUN pnpm --filter @my-app/backend prisma:generate

# 构建共享包和后端应用
RUN pnpm --filter @my-app/shared build 2>/dev/null || true
RUN pnpm --filter @my-app/backend build

# ============================================
# Stage 3: Production image
# ============================================
FROM node:20-alpine AS production

# npm 镜像源配置 (淘宝镜像)
ENV COREPACK_NPM_REGISTRY=https://registry.npmmirror.com
ENV PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma

# 安装构建原生模块所需工具 (bcrypt 等)，完成后清理缓存
RUN apk add --no-cache --virtual .build-deps python3 make g++ && \
    corepack enable && corepack prepare pnpm@9.15.0 --activate

# 创建非 root 用户以增强安全性
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

WORKDIR /app

# 复制依赖配置文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/

# 复制 Prisma schema
COPY apps/backend/prisma ./apps/backend/prisma

# 安装生产依赖并生成 Prisma Client，然后清理构建工具
RUN pnpm install --frozen-lockfile --prod --ignore-scripts && \
    pnpm --filter @my-app/backend exec prisma generate && \
    apk del .build-deps && \
    rm -rf /root/.cache /tmp/*

# 从构建阶段复制编译产物
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/packages/shared ./packages/shared

# 更改文件所有权
RUN chown -R nestjs:nodejs /app

# 切换到非 root 用户
USER nestjs

WORKDIR /app/apps/backend

# 暴露端口
EXPOSE 3000

# 设置生产环境变量
ENV NODE_ENV=production

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# 启动应用
CMD ["node", "dist/main"]
