# AGENTS 指南（vue3-nest-template）

本文件用于约束 AI Agent 与开发者在本仓库内的协作方式，目标是减少跨包改动出错率，保证前后端契约一致。

## 1) 项目定位
- 全栈模板：NestJS + Vue 3
- Monorepo：pnpm workspace + Turbo
- 核心原则：`packages/shared` 作为前后端数据契约单一事实源（SSOT）

## 2) 目录与包
```text
apps/backend/     # NestJS 后端（@my-app/backend）
apps/frontend/    # Vue 3 前端（@my-app/frontend）
packages/shared/  # 共享包（@my-app/shared）：Zod Schema、类型、DTO、工具函数
```

## 3) 当前技术栈（以仓库 package.json 为准）
- Node: `>=20.19.0`
- pnpm: `>=9.15.0`
- Turbo: `2.7.x`
- 前端: Vue `3.5.x` / Vite `7.x` / Pinia `3.x` / TailwindCSS / shadcn-vue / TanStack Query / Axios / VeeValidate + Zod / Vue I18n
- 跨端: Capacitor `8.x` / Electron `39.x` / PWA
- 后端: NestJS `11.x` / PostgreSQL `16` / Prisma `7.x` / Redis `7` / BullMQ / JWT + Passport / nestjs-zod / Socket.IO
- 测试与规范: Vitest / ESLint `9` / Prettier / tsup

## 4) 快速启动（首次）
```bash
pnpm install
cp .env.example .env
docker compose up postgres redis -d
pnpm db:push
pnpm dev
```

本地默认访问：
- 前端: `http://localhost:5173`
- 后端: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`
- Health: `http://localhost:3000/api/health`

## 5) 常用命令
```bash
# 全仓
pnpm dev
pnpm build
pnpm lint
pnpm test

# 按包运行
pnpm --filter @my-app/backend dev
pnpm --filter @my-app/frontend dev
pnpm --filter @my-app/shared build

# 数据库
pnpm db:push
pnpm db:migrate
pnpm db:studio
```

## 6) 导入与依赖约定
```ts
import { xxx } from '@my-app/shared'
import type { User } from '@my-app/shared'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
```

硬性约束：
- 不在 `apps/frontend` 或 `apps/backend` 重复定义已存在于 `@my-app/shared` 的 Schema/类型。
- 跨包数据结构变更，必须先改 `packages/shared`，再改前后端消费代码。
- 前端必须显式保留 `zod` 依赖（避免 Docker 构建失败）。

## 7) Zod 类型共享链路（必须遵守）
```text
packages/shared 定义 Schema
-> 前端表单（vee-validate + zod）直接复用
-> 后端 DTO（nestjs-zod）直接复用
-> TS 类型由 z.infer 自动推断
```

后端 DTO 示例：
```ts
import { createZodDto } from 'nestjs-zod'
import { LoginSchema } from '@my-app/shared'

export class LoginDto extends createZodDto(LoginSchema) {}
```

前端表单示例：
```ts
import { toTypedSchema } from '@vee-validate/zod'
import { LoginSchema } from '@my-app/shared'

const validationSchema = toTypedSchema(LoginSchema)
```

## 8) API 契约约定
成功响应（由全局拦截器统一包装）：
```ts
interface ApiResponse<T> {
  success: true
  data: T
  timestamp: string
  message?: string
}
```

错误响应（由全局异常过滤器统一包装）：
```ts
interface ApiErrorResponse {
  success: false
  data: null
  message: string
  statusCode: number
  timestamp: string
}
```

## 9) 认证、安全与网关规则
- 认证模型：`accessToken + refreshToken`
- 全局限流默认三档：`1s/3`、`10s/20`、`60s/100`
- 后端全局路由前缀：`/api`

## 10) 改动后最低校验要求
- 仅改前端：`pnpm --filter @my-app/frontend lint && pnpm --filter @my-app/frontend type-check && pnpm --filter @my-app/frontend test`
- 仅改后端：`pnpm --filter @my-app/backend lint && pnpm --filter @my-app/backend type-check && pnpm --filter @my-app/backend test`
- 改 shared：必须 `pnpm --filter @my-app/shared build`，并同时跑前后端两侧的 lint/test（不可只跑一侧）
- 涉及接口契约（Schema/DTO/响应字段）变更：前后端都要联调验证
- 覆盖率门禁：后端最低 `lines/statements 50%`、`functions 45%`、`branches 45%`；前端最低 `lines/statements 38%`、`functions 50%`、`branches 12%`

## 11) shadcn-vue 使用
```bash
# 在 apps/frontend 目录执行
npx shadcn-vue@latest add <component-name>
```
