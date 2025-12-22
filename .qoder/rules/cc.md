---
trigger: always_on
---
# 项目上下文

你正在协助开发一个基于 **NestJS + Vue 3** 的全栈应用模板项目，采用 **pnpm Monorepo** 架构。

## 项目结构

```
nest-vue-template/
├── apps/
│   ├── backend/    # NestJS 后端（@my-app/backend）
│   │   ├── prisma/           # Prisma 数据库配置
│   │   │   └── schema.prisma # 数据模型定义
│   │   └── src/              # 源代码目录
│   └── frontend/   # Vue 3 前端（@my-app/frontend）
│       ├── electron/         # Electron 主进程
│       ├── android/          # Android 原生项目
│       └── ios/              # iOS 原生项目
├── packages/
│   └── shared/     # 共享包（@my-app/shared）- Zod Schema、DTO、工具函数
├── .env.example    # 环境变量模板
└── docker-compose.yml  # 容器编排（PostgreSQL、Redis、后端、前端）
```

## 技术栈

### 前端 (Vue 3.5+)
- **构建**: Vite 6
- **路由**: Vue Router 4
- **状态**: Pinia + pinia-plugin-persistedstate
- **UI**: Tailwind CSS 3 + shadcn-vue (Reka UI)
- **请求**: TanStack Vue Query 5 + Axios
- **表单**: VeeValidate 4 + @vee-validate/zod + Zod
- **国际化**: Vue I18n 11
- **图表**: ECharts 6 + vue-echarts 8
- **图标**: lucide-vue-next
- **工具**: VueUse 14

### 跨端能力
- **移动端**: Capacitor 8（iOS / Android）
- **桌面端**: Electron 36（Windows / macOS / Linux）
- **PWA**: vite-plugin-pwa（自动更新、离线缓存）

### 后端 (NestJS 10.4+)
- **运行时**: Node.js 18+
- **数据库**: PostgreSQL 16 + Prisma 6 ORM
- **缓存/队列**: Redis 7 + BullMQ 5 + cache-manager
- **认证**: JWT + Passport（accessToken + refreshToken 双令牌机制）
- **验证**: Zod + nestjs-zod（自动生成 Swagger 文档）
- **日志**: nestjs-pino + pino-pretty
- **API 文档**: @nestjs/swagger
- **WebSocket**: @nestjs/websockets + Socket.IO
- **速率限制**: @nestjs/throttler（三级限流策略）
- **事件驱动**: @nestjs/event-emitter
- **安全**: helmet + sanitize-html + xss
- **文件上传**: multer + AWS S3 SDK（支持 S3/OSS/MinIO）
- **邮件**: @nestjs-modules/mailer + nodemailer

### 开发工具
- **包管理**: pnpm 9.15+ (workspace)
- **构建编排**: Turbo 2.3+
- **代码规范**: ESLint 9 + Prettier 3
- **测试**: Vitest 4
- **Git Hooks**: Husky 9 + lint-staged
- **共享包构建**: tsup（ESM + CJS 双格式输出）

## 常用命令

```bash
# 开发
pnpm dev                    # 同时启动前后端（Turbo 并行）
pnpm --filter @my-app/backend dev   # 仅后端 (localhost:3000)
pnpm --filter @my-app/frontend dev  # 仅前端 (localhost:5173)

# 数据库
pnpm db:generate            # 生成 Prisma Client
pnpm db:push                # 推送 Schema 到数据库（开发用）
pnpm db:migrate             # 运行数据库迁移（生产用）
pnpm db:studio              # 打开 Prisma Studio 可视化工具

# 质量检查
pnpm lint                   # ESLint 检查
pnpm lint:fix               # ESLint 自动修复
pnpm format                 # Prettier 格式化
pnpm format:check           # 检查格式（不修改）
pnpm test                   # 运行测试
pnpm test:watch             # 测试监听模式
pnpm test:coverage          # 生成覆盖率报告

# 构建
pnpm build                  # 构建所有包（Turbo 依赖顺序）
pnpm clean                  # 清理所有 dist 目录
pnpm --filter @my-app/shared build  # 单独构建共享包

# 跨端开发（在 frontend 目录下执行）
pnpm cap:sync               # 同步 Web 资源到原生项目
pnpm cap:build              # 构建并同步（build + sync）
pnpm cap:open:ios           # 打开 Xcode
pnpm cap:open:android       # 打开 Android Studio
pnpm cap:run:ios            # 运行 iOS 应用
pnpm cap:run:android        # 运行 Android 应用
pnpm electron:dev           # 启动 Electron 开发模式
pnpm electron:build         # 构建所有平台桌面应用
pnpm electron:build:mac     # 构建 macOS 应用
pnpm electron:build:win     # 构建 Windows 应用
pnpm electron:build:linux   # 构建 Linux 应用

# Docker
docker compose up postgres redis -d  # 启动数据库服务
docker compose up -d                 # 启动所有服务
pnpm docker:build           # 构建 Docker 镜像
pnpm docker:up              # 启动所有容器
pnpm docker:down            # 停止所有容器
pnpm docker:logs            # 查看容器日志
pnpm docker:clean           # 停止并清理所有容器和数据卷
```

## 模块导入约定

- 后端模块间引用: `import { XxxModule } from './xxx'` 或相对路径
- 共享包: `import { xxx } from '@my-app/shared'`
- 共享类型: `import type { User, LoginInput } from '@my-app/shared'`
- 前端组件: `@/components/xxx`, `@/views/xxx`
- UI 组件: `@/components/ui/xxx`
- 工具函数: `@/lib/utils`

## 关键目录

### 后端
- `src/auth/` - JWT 认证、守卫、装饰器、刷新令牌
- `src/prisma/` - Prisma 数据库服务
- `src/redis/` - Redis 缓存服务、缓存装饰器
- `src/common/` - 过滤器、拦截器、中间件（CSRF、响应转换、输入清理）
- `src/users/` - 用户 CRUD 模块
- `src/upload/` - 文件上传（S3/OSS/MinIO）
- `src/mail/` - 邮件发送服务
- `src/events/` - WebSocket 网关
- `src/scheduled-tasks/` - BullMQ 定时任务
- `src/health/` - 健康检查端点

### 前端
- `src/api/` - Axios HTTP 客户端、API 请求封装
- `src/components/` - Vue 组件
- `src/components/ui/` - shadcn-vue UI 组件
- `src/composables/` - 组合式函数
- `src/stores/` - Pinia 状态管理
- `src/i18n/` - Vue I18n 国际化配置
- `src/lib/` - 工具函数（cn、utils）
- `src/views/` - 页面视图组件
- `electron/` - Electron 主进程与预加载脚本
- `android/` - Android 原生项目（Capacitor 生成）
- `ios/` - iOS 原生项目（Capacitor 生成）

## 环境变量配置

开发前须复制 `.env.example` 为 `.env` 并配置：

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | - |
| `REDIS_HOST` | Redis 主机 | localhost |
| `REDIS_PORT` | Redis 端口 | 6379 |
| `JWT_SECRET` | JWT 签名密钥（生产环境必须修改） | - |
| `JWT_EXPIRES_IN` | 访问令牌过期时间 | 7d |
| `CORS_ORIGIN` | 允许的跨域来源 | http://localhost:5173 |
| `LOG_LEVEL` | 日志级别 | debug |
| `THROTTLE_*` | 速率限制配置 | 详见 .env.example |
| `MAIL_*` | SMTP 邮件配置 | 详见 .env.example |
| `S3_*` | 云存储配置（S3/OSS/MinIO） | 详见 .env.example |

## shadcn-vue 组件开发

### 配置概览
项目使用 [shadcn-vue](https://www.shadcn-vue.com/) 作为 UI 组件库，配置文件位于 `apps/frontend/components.json`：
- **风格**: new-york
- **基础色**: zinc
- **CSS 变量**: 启用
- **图标库**: lucide
- **别名**: @/components, @/lib/utils, @/composables

### 添加新组件
```bash
# 在 frontend 目录下执行
npx shadcn-vue@latest add <component-name>

# 示例：添加 dialog 组件
npx shadcn-vue@latest add dialog

# 添加多个组件
npx shadcn-vue@latest add button card input
```

### 组件路径别名
```typescript
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
```

### cn() 工具函数
用于合并 Tailwind 类名，自动处理冲突（基于 clsx + tailwind-merge）：
```typescript
import { cn } from '@/lib/utils'

// 使用示例
<div :class="cn('px-4 py-2', props.class, { 'bg-red-500': isError })" />
```

### 组件开发规范
1. UI 组件放置于 `src/components/ui/` 目录
2. 每个组件独立文件夹，包含 `index.ts` 导出
3. 使用 `class-variance-authority` (cva) 定义变体
4. 基于 Reka UI 原语组件构建，确保无障碍支持
5. 业务组件放置于 `src/components/` 目录根级

## Zod 类型共享 (Single Source of Truth)

本项目采用 **Zod Schema 统一定义** 策略，确保前后端验证逻辑和类型完全一致。

### 核心理念
```
共享包定义 Schema → 前端表单验证 + 后端 DTO 验证 → 类型自动推断
```

### 1. 在共享包中定义 Schema

```typescript
// packages/shared/src/schemas/auth.schema.ts
import { z } from 'zod'

// 可复用的字段规则
export const emailSchema = z
  .string({ required_error: '邮箱不能为空' })
  .min(1, '邮箱不能为空')  // 注意：required_error 仅对 undefined 生效
  .email('请输入有效的邮箱地址')
  .toLowerCase()
  .trim()

export const passwordSchema = z
  .string({ required_error: '密码不能为空' })
  .min(6, '密码至少需要 6 个字符')
  .max(100, '密码不能超过 100 个字符')

// 组合成完整 Schema
export const LoginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

// 注册 Schema 可添加更严格的验证
export const RegisterSchema = z.object({
  email: emailSchema,
  name: z.string().min(2).max(50).trim(),
  password: passwordSchema
    .regex(/[A-Za-z]/, '密码必须包含至少一个字母')
    .regex(/[0-9]/, '密码必须包含至少一个数字'),
})

// 从 Schema 推断 TypeScript 类型（无需手动定义 interface）
export type LoginInput = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
```

### 2. 后端使用 nestjs-zod 包装 DTO

```typescript
// apps/backend/src/auth/auth.dto.ts
import { createZodDto } from 'nestjs-zod'
import { LoginSchema, RegisterSchema, RefreshTokenSchema } from '@my-app/shared'

// 自动支持 Swagger 文档生成 + 验证管道
export class LoginDto extends createZodDto(LoginSchema) {}
export class RegisterDto extends createZodDto(RegisterSchema) {}
export class RefreshTokenDto extends createZodDto(RefreshTokenSchema) {}
```

### 3. 前端使用 @vee-validate/zod 表单验证

```typescript
// apps/frontend/src/components/LoginForm.vue
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { LoginSchema } from '@my-app/shared'

const validationSchema = toTypedSchema(LoginSchema)
const { handleSubmit, errors, defineField } = useForm({ validationSchema })

// 定义表单字段
const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')
```

### 4. 直接使用推断类型

```typescript
// 任意前端/后端文件
import type { LoginInput, User, ApiResponse } from '@my-app/shared'

const loginData: LoginInput = { email: 'test@example.com', password: '123456' }
```

### Schema 设计规范

| 场景 | 命名约定 | 示例 |
|------|----------|------|
| 表单/请求体 | `XxxSchema` | `LoginSchema`, `CreateUserSchema` |
| 响应数据 | `XxxResponseSchema` | `AuthResponseSchema` |
| 可复用字段 | `xxxSchema` (小写) | `emailSchema`, `passwordSchema` |
| 推断类型 | `XxxInput` / `Xxx` | `LoginInput`, `User` |

### 共享包导出结构

```typescript
// packages/shared/src/index.ts
export * from './schemas/auth.schema'  // Zod Schemas + 推断类型
export * from './dto/common.dto'       // 通用响应接口（ApiResponse、PaginatedResponse）
export * from './utils/user.utils'     // 工具函数
```

## API 响应格式

所有 API 响应遵循统一格式：

```typescript
// 成功响应
interface ApiResponse<T> {
  success: boolean    // 是否成功
  data: T             // 响应数据
  message?: string    // 消息描述
  timestamp: string   // ISO 时间戳
}

// 分页响应
interface PaginatedResponse<T> {
  items: T[]          // 数据列表
  total: number       // 总数
  page: number        // 当前页码
  pageSize: number    // 每页数量
  totalPages: number  // 总页数
}
```

## 注意事项

### 开发规范
- 提交代码前须运行 `pnpm lint` 和 `pnpm format` 确保代码质量
- 代码注释使用中文，类型定义优先使用 interface（纯接口场景）或 z.infer（Schema 场景）
- JS/TS 规范：2 空格缩进、单引号、无分号

### 共享包
- 共享包 (@my-app/shared) 必须配置 `exports` 字段，否则 Node.js 无法解析
- 修改共享包后需重新构建：`pnpm --filter @my-app/shared build`
- 共享包使用 tsup 构建，输出 ESM + CJS 双格式

### 依赖管理
- **重要**：前端 `zod` 依赖必须在 `apps/frontend/package.json` 中显式声明，否则 Docker 构建会失败（pnpm 隔离 node_modules 策略）
- Zod Schema 在共享包中定义，前后端通过 workspace 引用
- 使用 `workspace:*` 引用 monorepo 内部包

### 服务依赖
- 后端依赖 Redis，开发前须启动：`docker compose up redis -d`
- 后端依赖 PostgreSQL，开发前须启动：`docker compose up postgres -d`
- 首次启动须执行 `pnpm db:push` 初始化数据库

### Docker 构建
- 前端 Dockerfile 使用多阶段构建（builder → nginx:alpine）
- 后端 Dockerfile 使用多阶段构建（builder → node:alpine）
- 构建时须确保所有依赖都已显式声明

### 认证机制
- 采用 accessToken + refreshToken 双令牌机制
- accessToken 存储于 localStorage，用于 API 请求认证
- 非 GET 请求自动携带 CSRF Token（从 Cookie 读取 `XSRF-TOKEN`）

### 速率限制
后端配置了三级速率限制（ThrottlerGuard）：
- **短期**：1 秒内最多 3 次请求（防暴力破解）
- **中期**：10 秒内最多 20 次请求
- **长期**：1 分钟内最多 100 次请求

### 开发服务器
- 后端：http://localhost:3000（Swagger 文档：/api）
- 前端：http://localhost:5173（自动代理 /api 到后端）
- Prisma Studio：http://localhost:5555（执行 pnpm db:studio）