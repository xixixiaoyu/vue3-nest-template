# 项目上下文

## 1) 项目定位
基于 **NestJS + Vue 3** 的全栈模板，采用 **pnpm Monorepo**。

## 2) 目录与包
```text
apps/backend/     # NestJS 后端（@my-app/backend）
apps/frontend/    # Vue 3 前端（@my-app/frontend）
packages/shared/  # 共享包（@my-app/shared）：Zod Schema、DTO、工具函数、类型
```

## 3) 技术栈
前端：Vue 3.5+ / Vite 6 / Pinia / Tailwind + shadcn-vue / TanStack Query + Axios / VeeValidate + Zod / Vue I18n  
跨端：Capacitor 8（iOS/Android）/ Electron 36 / PWA  
后端：NestJS 10.4+ / PostgreSQL 16 + Prisma 6 / Redis 7 + BullMQ / JWT + Passport / nestjs-zod / Socket.IO  
工具链：pnpm 9.15+ / Turbo 2.3+ / ESLint 9 + Prettier / Vitest / tsup

## 4) 常用命令
```bash
pnpm dev
pnpm --filter @my-app/backend dev
pnpm --filter @my-app/frontend dev
pnpm db:push
pnpm db:studio
pnpm lint && pnpm format
pnpm --filter @my-app/shared build
docker compose up postgres redis -d
```

## 5) 导入约定
```ts
import { xxx } from '@my-app/shared'
import type { User } from '@my-app/shared'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
```

## 6) Zod 类型共享链路
```text
shared 定义 Schema
→ 前端用于表单验证
→ 后端用于 DTO 验证
→ TypeScript 类型自动推断
```

后端 DTO：
```ts
import { createZodDto } from 'nestjs-zod'
import { LoginSchema } from '@my-app/shared'
export class LoginDto extends createZodDto(LoginSchema) {}
```

前端表单：
```ts
import { toTypedSchema } from '@vee-validate/zod'
import { LoginSchema } from '@my-app/shared'
const validationSchema = toTypedSchema(LoginSchema)
```

## 7) API 响应约定
```ts
interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  timestamp: string
}
```

## 8) shadcn-vue
```bash
# 在 apps/frontend 目录执行
npx shadcn-vue@latest add <component-name>
```

## 9) 开发注意事项
- 修改 `@my-app/shared` 后，先执行：`pnpm --filter @my-app/shared build`
- 前端需显式安装 `zod`，避免 Docker 构建失败
- 开发前先启动基础服务：`docker compose up postgres redis -d`
- 首次运行数据库同步：`pnpm db:push`
- 认证采用 `accessToken + refreshToken`，非 GET 请求需携带 CSRF Token
- 限流策略：`1s/3次`、`10s/20次`、`1min/100次`
