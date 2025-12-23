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
**跨端**: Capacitor 8 (iOS/Android) / Electron 36 / PWA
**后端**: NestJS 10.4+ / PostgreSQL 16 + Prisma 6 / Redis 7 + BullMQ / JWT + Passport / nestjs-zod / Socket.IO
**工具**: pnpm 9.15+ / Turbo 2.3+ / ESLint 9 + Prettier / Vitest / tsup

## 常用命令

```bash
pnpm dev                              # 同时启动前后端
pnpm --filter @my-app/backend dev     # 仅后端 (localhost:3000)
pnpm --filter @my-app/frontend dev    # 仅前端 (localhost:5173)
pnpm db:push                          # 推送 Schema 到数据库
pnpm db:studio                        # Prisma Studio
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

**后端 DTO**:
```typescript
import { createZodDto } from 'nestjs-zod'
import { LoginSchema } from '@my-app/shared'
export class LoginDto extends createZodDto(LoginSchema) {}
```

**前端表单**:
```typescript
import { toTypedSchema } from '@vee-validate/zod'
import { LoginSchema } from '@my-app/shared'
const validationSchema = toTypedSchema(LoginSchema)
```

## API 响应格式

```typescript
interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  timestamp: string
}
```

## shadcn-vue

```bash
npx shadcn-vue@latest add <component-name>  # 在 frontend 目录下执行
```

## 后端架构

### 模块系统

后端采用 NestJS 模块化设计，核心模块包括：

| 模块 | 职责 |
|------|------|
| **AuthModule** | JWT + Passport 认证、用户注册、密码重置 |
| **PrismaModule** | 数据库访问层（PostgreSQL） |
| **RedisModule** | 缓存、会话管理、BullMQ 队列 |
| **UsersModule** | 用户管理业务逻辑 |
| **HealthModule** | 健康检查服务 |
| **MailModule** | 邮件发送服务 |
| **EventsModule** | WebSocket 实时通信 |
| **UploadModule** | 文件上传服务 |
| **ScheduledTasksModule** | BullMQ 定时任务处理 |

### 请求处理生命周期

```
HTTP 请求
  ↓
全局中间件 (Helmet / Cookie Parser / CSRF / Compression)
  ↓
路由匹配
  ↓
全局守卫 (ThrottlerGuard 速率限制)
  ↓
控制器 (Controller)
  ↓
服务层 (Service)
  ↓
数据访问层 (PrismaService)
  ↓
全局拦截器 (TransformInterceptor / SanitizeInterceptor)
  ↓
全局过滤器 (AllExceptionsFilter)
  ↓
HTTP 响应
```

### 安全特性

- **Helmet**: 安全头设置
- **CSRF 保护**: 双令牌机制（Cookie + Header）
- **速率限制**: 1s/3次、10s/20次、1min/100次
- **XSS 防护**: SanitizeInterceptor 自动清理
- **JWT 认证**: accessToken + refreshToken 双令牌

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

### 状态管理

```typescript
// auth.ts - 认证状态
export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!token.value)

  const login = async (credentials: LoginInput) => { /* ... */ }
  const logout = () => { /* ... */ }

  return { token, user, isAuthenticated, login, logout }
}, {
  persist: { paths: ['token'] }  // 仅持久化 token
})
```

## 共享包设计

### 单一可信源原则

共享包 `@my-app/shared` 是前后端共享类型和验证逻辑的唯一来源：

```
Zod Schema (shared)
    ↓
    ├─→ 后端 DTO (nestjs-zod)
    ├─→ 前端表单 (VeeValidate)
    └─→ TypeScript 类型 (z.infer)
```

### 目录结构

```
packages/shared/src/
├── schemas/       # Zod Schema 定义
│   └── auth.schema.ts
├── dto/           # 通用 DTO
│   └── common.dto.ts
├── utils/         # 工具函数
│   └── user.utils.ts
└── index.ts       # 统一导出
```

## 环境配置

### 必需环境变量

```bash
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/myapp"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""
REDIS_DB=0

# JWT
JWT_SECRET="your-secret-key"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# CORS
CORS_ORIGIN="http://localhost:5173"

# 邮件（可选）
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="user@example.com"
SMTP_PASSWORD="password"
```

## 部署

### Docker 部署

```bash
# 构建并启动所有服务
docker compose up -d

# 仅启动数据库服务
docker compose up postgres redis -d

# 查看日志
docker compose logs -f

# 停止服务
docker compose down
```

### 跨端构建

```bash
# PWA 构建
pnpm --filter @my-app/frontend build

# Electron 构建
pnpm --filter @my-app/frontend build:electron

# Capacitor 构建
pnpm --filter @my-app/frontend build:ios
pnpm --filter @my-app/frontend build:android
```

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

## 故障排除

| 问题 | 解决方案 |
|------|---------|
| 数据库连接失败 | 检查 `DATABASE_URL`，启动 `docker compose up postgres -d` |
| Redis 连接失败 | 检查 Redis 配置，启动 `docker compose up redis -d` |
| 共享包类型错误 | 运行 `pnpm --filter @my-app/shared build` |
| 401 未授权 | 检查 token 是否有效，确认 CSRF Token 正确 |
| 速率限制触发 | 等待时间窗口重置或调整限流配置 |
| Swagger 无法访问 | 确认后端已启动，检查 CORS 配置 |

## API 文档

- **Swagger**: http://localhost:3000/api/docs
- **健康检查**: http://localhost:3000/api/health
- **WebSocket**: ws://localhost:3000
