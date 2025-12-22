# ============================================
# Stage 1: Build dependencies (monorepo base)
# ============================================
FROM node:20-alpine AS base

# npm 镜像源配置 (淘宝镜像)
ENV COREPACK_NPM_REGISTRY=https://registry.npmmirror.com

# 启用 corepack 并安装 pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# 先复制依赖配置文件，利用 Docker 层缓存
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared/package.json ./packages/shared/

# 安装依赖，跳过 Electron 二进制下载 (构建 Web 版本无需)
ENV ELECTRON_SKIP_BINARY_DOWNLOAD=1
RUN pnpm install --frozen-lockfile

# ============================================
# Stage 2: Build application
# ============================================
FROM base AS builder

WORKDIR /app

# 复制源代码
COPY packages/shared ./packages/shared
COPY apps/frontend ./apps/frontend
COPY tsconfig.base.json ./

# 构建共享包和前端应用
RUN pnpm --filter @my-app/shared build
RUN pnpm --filter @my-app/frontend build

# ============================================
# Stage 3: Production image with Nginx
# ============================================
FROM nginx:alpine AS production

# 移除默认 nginx 配置
RUN rm /etc/nginx/conf.d/default.conf

# 复制自定义 nginx 配置
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建产物
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

# 创建非 root 用户并配置权限
RUN addgroup -g 1001 -S frontend && \
    adduser -S -D -H -u 1001 -s /sbin/nologin -G frontend frontend && \
    # 设置文件所有权
    chown -R frontend:frontend /usr/share/nginx/html && \
    chown -R frontend:frontend /var/cache/nginx && \
    # 创建并设置日志目录权限
    mkdir -p /var/log/nginx && \
    chown -R frontend:frontend /var/log/nginx && \
    # 设置 PID 文件权限
    touch /var/run/nginx.pid && \
    chown frontend:frontend /var/run/nginx.pid && \
    # 清理缓存减小镜像大小
    rm -rf /var/cache/apk/*

# 切换到非 root 用户
USER frontend

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
