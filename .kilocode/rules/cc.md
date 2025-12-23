# 项目上下文

基于 **NestJS + Vue 3** 的全栈模板，采用 **pnpm Monorepo** 架构。

## 项目结构

```
apps/backend/     # NestJS 后端（@my-app/backend）
apps/frontend/    # Vue 3 前端（@my-app/frontend）
packages/shared/  # 共享包（@my-app/shared）- Zod Schema、DTO、工具函数
```

## 技术栈

**前端**: Vue 3.5+ / Vite 6 / Pinia / Tailwind + shadcn-vue / TanStack Query + Axios / VeeValidate + Zod / Vue I18n
**跨端**: Capacitor 8 / Electron 36 / PWA
**后端**: NestJS 10.4+ / PostgreSQL 16 + Prisma 6 / Redis 7 + BullMQ / JWT + Passport / nestjs-zod / Socket.IO
**工具**: pnpm 9.15+ / Turbo 2.3+ / ESLint 9 + Prettier / Vitest / tsup

## 常用命令

```bash
pnpm dev                              # 同时启动前后端
pnpm --filter @my-app/backend dev     # 仅后端 (localhost:3000)
pnpm --filter @my-app/frontend dev    # 仅前端 (localhost:5173)
pnpm db:push                          # 推送 Schema 到数据库
pnpm lint && pnpm format              # 代码检查与格式化
pnpm --filter @my-app/shared build    # 构建共享包
docker compose up postgres redis -d   # 启动数据库服务
```

## 模块导入约定

```typescript
import { xxx } from '@my-app/shared'           // 共享包
import type { User } from '@my-app/shared'     // 共享类型
import { Button } from '@/components/ui/button' // UI 组件
import { cn } from '@/lib/utils'                // 工具函数
```

## Zod 类型共享

```
共享包定义 Schema → 前端表单验证 + 后端 DTO 验证 → 类型自动推断
```

**后端 DTO**: `createZodDto(LoginSchema)`
**前端表单**: `toTypedSchema(LoginSchema)`

## API 响应格式

```typescript
interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  timestamp: string
}

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
```

## 后端架构

### 模块系统

| 模块 | 职责 |
|------|------|
| **AuthModule** | JWT + Passport 认证、用户注册、密码重置 |
| **PrismaModule** | 数据库访问层（PostgreSQL）- 全局模块 |
| **RedisModule** | 缓存、会话管理、BullMQ 队列 |
| **UsersModule** | 用户管理业务逻辑 |
| **HealthModule** | 健康检查服务 |
| **MailModule** | 邮件发送服务 |
| **EventsModule** | WebSocket 实时通信 |
| **UploadModule** | 文件上传服务 |
| **ScheduledTasksModule** | BullMQ 定时任务处理 |

### 请求处理生命周期

```
HTTP 请求 → 全局中间件 → 路由匹配 → 全局守卫 → 控制器 → 服务层 → 数据访问层 → 全局拦截器 → 全局过滤器 → HTTP 响应
```

**执行顺序**: Helmet → CookieParser → Compression → CORS → CSRF → ThrottlerGuard → ZodValidationPipe → SanitizeInterceptor → TransformInterceptor → AllExceptionsFilter

### 安全特性

- **Helmet**: 安全头设置
- **CSRF 保护**: 双令牌机制（XSRF-TOKEN Cookie + X-XSRF-TOKEN Header）
- **速率限制**: 1s/3次、10s/20次、1min/100次（基于 Redis）
- **XSS 防护**: SanitizeInterceptor 自动清理，不允许任何 HTML 标签
- **JWT 认证**: accessToken + refreshToken 双令牌
- **输入验证**: 全局 ZodValidationPipe，结合共享包 Schema

### 三层架构

- **控制器层**: 处理 HTTP 请求/响应，仅负责参数解析和响应格式化
- **服务层**: 封装业务逻辑，处理数据验证、转换和业务规则
- **数据访问层**: PrismaService 直接与数据库交互，提供类型安全的数据库操作

### 全局模块

- **PrismaModule**: 使用 `@Global()` 装饰器，可在任何模块中直接注入 PrismaService
- **RedisModule**: 导出 RedisService 和 CacheModule，提供缓存和队列功能

## 前端架构

### 核心技术

- **状态管理**: Pinia + pinia-plugin-persistedstate（持久化）
- **路由**: Vue Router（动态导入、代码分割）
- **数据获取**: TanStack Query（缓存、重试、去重）
- **表单验证**: VeeValidate + Zod Schema
- **国际化**: Vue I18n（自动检测浏览器语言）
- **UI 组件**: shadcn-vue (Reka UI) + Tailwind CSS

### 目录结构

```
src/
├── api/           # API 客户端封装
├── components/    # 组件（ui/ 基础组件、业务组件）
├── composables/   # 组合式函数（useRequest、useWindowSize）
├── i18n/          # 国际化配置
├── lib/           # 工具函数
├── router/        # 路由配置
├── stores/        # Pinia 状态管理
├── styles/        # 全局样式
└── views/         # 页面视图
```

### 应用初始化流程

```
main.ts → createApp(App) → createPinia() + persistedstate → createQueryClient() → app.use(Pinia) → app.use(Router) → app.use(I18n) → app.use(VueQuery) → app.mount('#app')
```

### API 客户端

- **请求拦截器**: 自动添加 `Authorization: Bearer <token>` 和 CSRF token
- **响应拦截器**: 自动处理 401 错误（清除 token）
- **超时时间**: 10 秒
- **类型安全**: 使用 `ApiResponse<T>` 接口

## 共享包设计

### 单一可信源原则

```
Zod Schema (shared) → 后端 DTO (nestjs-zod) → 前端表单 (VeeValidate) → TypeScript 类型 (z.infer)
```

### 目录结构

```
packages/shared/src/
├── schemas/       # Zod Schema 定义
├── dto/           # 通用 DTO
├── utils/         # 工具函数（formatUser、formatUsers）
└── index.ts       # 统一导出
```

### Schema 设计

定义可复用的基础字段规则（如 `emailSchema`、`passwordSchema`），组合成完整的对象 Schema（如 `LoginSchema`、`RegisterSchema`）。通过 `z.infer<typeof Schema>` 自动推断 TypeScript 类型。

## 环境配置

### 必需环境变量

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/myapp"
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""
REDIS_DB=0
JWT_SECRET="your-secret-key"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"
CORS_ORIGIN="http://localhost:5173"
```

### 可选环境变量

```bash
# 邮件配置
MAIL_HOST="smtp.example.com"
MAIL_PORT=587
MAIL_USER="noreply@example.com"
MAIL_PASSWORD="password"

# 文件存储配置
S3_BUCKET="my-bucket"
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID="access-key"
S3_SECRET_ACCESS_KEY="secret-key"
```

## 部署

### Docker 部署

```bash
docker compose up -d                    # 构建并启动所有服务
docker compose up postgres redis -d     # 仅启动数据库服务
docker compose logs -f                  # 查看日志
docker compose down                     # 停止服务
```

### 跨端构建

```bash
pnpm --filter @my-app/frontend build         # PWA 构建
pnpm --filter @my-app/frontend build:electron # Electron 构建
pnpm --filter @my-app/frontend build:ios     # iOS 构建
pnpm --filter @my-app/frontend build:android # Android 构建
```

### Nginx 配置要点

- Gzip 压缩、安全头、健康检查端点
- Vue Router 历史模式回退至 `/index.html`
- `/api` 反向代理到后端 3000 端口
- WebSocket 支持（透传 Connection/Upgrade 头部）

## 注意事项

- **共享包**: 修改后需 `pnpm --filter @my-app/shared build`
- **依赖**: 前端 `zod` 必须显式声明，否则 Docker 构建失败
- **服务**: 开发前启动 `docker compose up postgres redis -d`，首次运行 `pnpm db:push`
- **认证**: accessToken + refreshToken 双令牌，非 GET 请求携带 CSRF Token
- **限流**: 1s/3次、10s/20次、1min/100次

## 代码规范

### TypeScript

- 2 空格缩进、单引号、无分号
- 优先使用 `const`，其次 `let`，避免 `var`
- 严格类型检查，禁止 `any`
- 使用 `interface` 定义对象类型，`type` 定义联合类型

### Vue 3

- 优先使用 `<script setup>` 语法
- 使用 Composition API 和组合式函数
- 组件命名采用 PascalCase
- Props 定义使用 TypeScript 类型

### NestJS

- 使用依赖注入模式
- 控制器仅处理 HTTP 请求/响应
- 业务逻辑放在 Service 层
- 使用 DTO 进行输入验证
- 全局模块使用 `@Global()` 装饰器

### 提交规范

- 提交前必须运行 `pnpm format` 和 `pnpm lint`
- Husky + lint-staged 自动执行质量检查

## 性能优化

### 后端

- **响应压缩**: gzip 压缩（大于 1KB 的响应）
- **日志**: 开发环境 pino-pretty，生产环境 JSON
- **缓存**: Redis 缓存高频数据，支持命名空间隔离
- **队列**: BullMQ 异步处理耗时任务，指数退避重试策略
- **健康检查**: Docker Compose 健康检查，@nestjs/terminus 集成

### 前端

- **代码分割**: 路由动态导入
- **数据缓存**: TanStack Query 智能缓存（staleTime 配置）
- **状态管理**: Pinia 单一数据源，持久化插件
- **PWA**: Service Worker 离线缓存

### 构建

- **Turbo**: 并行执行任务，缓存优化（dist/**、coverage/**）
- **pnpm Monorepo**: 高效依赖管理，workspace:* 协议

## 故障排除

| 问题 | 解决方案 |
|------|---------|
| 数据库连接失败 | 检查 `DATABASE_URL`，启动 `docker compose up postgres -d` |
| Redis 连接失败 | 检查 Redis 配置，启动 `docker compose up redis -d` |
| 共享包类型错误 | 运行 `pnpm --filter @my-app/shared build` |
| 401 未授权 | 检查 token 是否有效，确认 CSRF Token 正确 |
| 速率限制触发 | 等待时间窗口重置或调整限流配置 |
| Swagger 无法访问 | 确认后端已启动，检查 CORS 配置 |
| 页面空白/白屏 | 检查 `main.ts` 中 `app.mount('#app')` 选择器与 `index.html` 一致 |
| 路由无法跳转 | 确认 `router/index.ts` 路径配置正确，组件路径无误 |
| 状态未持久化 | 检查 `pinia-plugin-persistedstate` 是否正确安装和使用 |
| API 请求 401 错误 | 检查 `httpClient` 请求拦截器是否正确添加 `Authorization` 头 |
| 提交被拒绝（Husky） | 确认已安装依赖并初始化钩子，重新运行 `pnpm format` 与 `pnpm lint` |
| CSRF 验证失败 | 检查 XSRF-TOKEN Cookie 是否设置，X-XSRF-TOKEN Header 是否正确传递 |
| Docker 构建失败 | 检查前端 `zod` 依赖是否显式声明，确认共享包已构建 |

## API 文档

- **Swagger**: http://localhost:3000/api/docs
- **健康检查**: http://localhost:3000/api/health
- **WebSocket**: ws://localhost:3000

## 开发流程

1. 克隆仓库并进入项目目录
2. 安装依赖: `pnpm install`
3. 配置环境变量: 复制 `.env.example` 为 `.env` 并填写配置
4. 启动数据库服务: `docker compose up postgres redis -d`
5. 初始化数据库: `pnpm db:push`
6. 启动开发服务器: `pnpm dev`
7. 验证服务: 访问 Swagger 文档和前端页面

## 认证流程

1. **用户注册**: POST /api/auth/register → 创建用户并返回令牌
2. **用户登录**: POST /api/auth/login → 验证凭据并返回令牌
3. **获取当前用户**: GET /api/auth/me → 需要认证
4. **刷新令牌**: POST /api/auth/refresh → 使用 refreshToken 获取新的 accessToken
5. **忘记密码**: POST /api/auth/forgot-password → 发送重置邮件
6. **重置密码**: POST /api/auth/reset-password → 使用令牌重置密码

## 模块依赖关系

```
AppModule (根模块)
├── ConfigModule (配置)
├── LoggerModule (日志)
├── ThrottlerModule (限流)
├── PrismaModule (数据库 - 全局)
├── RedisModule (缓存 - 全局)
├── AuthModule (认证)
│   └── 依赖 PrismaModule
├── UsersModule (用户)
│   └── 依赖 AuthModule
├── HealthModule (健康检查)
│   └── 依赖 PrismaModule, RedisModule
├── MailModule (邮件)
├── EventsModule (WebSocket)
├── UploadModule (文件上传)
└── ScheduledTasksModule (定时任务)
    └── 依赖 BullModule
```

## 健康检查

- **综合健康检查**: GET /api/health
- **存活探针**: GET /api/health/liveness
- **就绪探针**: GET /api/health/readiness

检查内容: 数据库连接状态、Redis 连接状态、内存使用情况、磁盘使用情况
