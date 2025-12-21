# 项目上下文

你正在协助开发一个基于 **NestJS + Vue 3** 的全栈应用模板项目，采用 **pnpm Monorepo** 架构。

## 项目结构

```
nest-vue-template/
├── apps/
│   ├── backend/    # NestJS 后端（@my-app/backend）
│   └── frontend/   # Vue 3 前端（@my-app/frontend）
├── packages/
│   └── shared/     # 共享包（@my-app/shared）- DTO、Schema、工具函数
└── docker-compose.yml  # 容器编排（PostgreSQL、Redis、后端、前端）
```

## 技术栈

### 前端 (Vue 3)
- **构建**: Vite
- **路由**: Vue Router 4
- **状态**: Pinia + 持久化
- **UI**: Tailwind CSS + shadcn-vue (Reka UI)
- **请求**: TanStack Query + Axios
- **表单**: VeeValidate + Zod
- **国际化**: Vue I18n
- **图表**: ECharts + vue-echarts
- **图标**: Lucide Vue
- **工具**: VueUse

### 跨端能力
- **移动端**: Capacitor 8（iOS / Android）
- **桌面端**: Electron 36（Windows / macOS / Linux）
- **PWA**: vite-plugin-pwa（渐进式 Web 应用）

### 后端 (NestJS 10)
- **运行时**: Node.js 18+
- **数据库**: PostgreSQL 16 + Prisma ORM
- **缓存/队列**: Redis 7 + BullMQ
- **认证**: JWT + Passport
- **验证**: Zod + nestjs-zod
- **日志**: nestjs-pino
- **API 文档**: Swagger
- **WebSocket**: Socket.IO

### 开发工具
- **包管理**: pnpm 9+ (workspace)
- **构建编排**: Turbo
- **代码规范**: ESLint 9 + Prettier
- **测试**: Vitest
- **Git Hooks**: Husky + lint-staged

## 常用命令

```bash
# 开发
pnpm dev                    # 同时启动前后端
pnpm --filter @my-app/backend dev   # 仅后端 (localhost:3000)
pnpm --filter @my-app/frontend dev  # 仅前端 (localhost:5173)

# 数据库
pnpm db:generate            # 生成 Prisma Client
pnpm db:push                # 推送 Schema 到数据库
pnpm db:migrate             # 运行迁移
pnpm db:studio              # 打开 Prisma Studio

# 质量检查
pnpm lint                   # ESLint 检查
pnpm format                 # Prettier 格式化
pnpm test                   # 运行测试

# 跨端开发（在 frontend 目录下执行）
pnpm cap:sync               # 同步 Web 资源到原生项目
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
```

## 模块导入约定

- 后端模块间引用: `import { XxxModule } from './xxx'` 或相对路径
- 共享包: `import { xxx } from '@my-app/shared'`
- 前端组件: `components/xxx`, `@/views/xxx`

## 关键目录

### 后端
- `src/auth/` - JWT 认证、守卫、装饰器
- `src/prisma/` - 数据库服务
- `src/redis/` - 缓存服务、装饰器
- `src/common/` - 过滤器、拦截器、中间件

### 前端
- `src/api/` - API 请求封装
- `src/composables/` - 组合式函数
- `src/stores/` - Pinia 状态管理
- `src/i18n/` - 国际化配置
- `electron/` - Electron 主进程与预加载脚本
- `android/` - Android 原生项目（Capacitor 生成）
- `ios/` - iOS 原生项目（Capacitor 生成）
- `capacitor.config.ts` - Capacitor 配置

## shadcn-vue 组件开发

### 配置概览
项目使用 [shadcn-vue](https://www.shadcn-vue.com/) 作为 UI 组件库，配置文件位于 `apps/frontend/components.json`：
- **风格**: new-york
- **基础色**: zinc
- **CSS 变量**: 启用
- **图标库**: lucide

### 添加新组件
```bash
# 在 frontend 目录下执行
npx shadcn-vue@latest add <component-name>

# 示例：添加 dialog 组件
npx shadcn-vue@latest add dialog
```

### 组件路径别名
```typescript
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
```

### cn() 工具函数
用于合并 Tailwind 类名，自动处理冲突：
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
  .email('请输入有效的邮箱地址')
  .toLowerCase()
  .trim()

export const passwordSchema = z
  .string({ required_error: '密码不能为空' })
  .min(6, '密码至少需要 6 个字符')

// 组合成完整 Schema
export const LoginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

// 从 Schema 推断 TypeScript 类型（无需手动定义 interface）
export type LoginInput = z.infer<typeof LoginSchema>
```

### 2. 后端使用 nestjs-zod 包装 DTO

```typescript
// apps/backend/src/auth/auth.dto.ts
import { createZodDto } from 'nestjs-zod'
import { LoginSchema } from '@my-app/shared'

// 自动支持 Swagger 文档生成 + 验证管道
export class LoginDto extends createZodDto(LoginSchema) {}
```

### 3. 前端使用 @vee-validate/zod 表单验证

```typescript
// apps/frontend/src/components/LoginForm.vue
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { LoginSchema } from '@my-app/shared'

const validationSchema = toTypedSchema(LoginSchema)
const { handleSubmit, errors } = useForm({ validationSchema })
```

### 4. 直接使用推断类型

```typescript
// 任意前端/后端文件
import type { LoginInput, User } from '@my-app/shared'

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
export * from './dto/common.dto'       // 通用响应接口
export * from './utils/user.utils'     // 工具函数
```

## 注意事项

- 提交代码前须运行 `pnpm lint` 和 `pnpm format` 确保代码质量
- 共享包 (@my-app/shared) 须配置 exports 字段，否则 Node.js 无法解析
- 后端依赖 Redis，开发前须确保 Redis 服务已启动
- 修改共享包后需重新构建：`pnpm --filter @my-app/shared build`
- Zod 依赖仅在共享包中声明，前后端通过 workspace 引用自动获取
- 代码注释使用中文，类型定义优先使用 interface（纯接口场景）或 z.infer（Schema 场景）