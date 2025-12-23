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

## 注意事项

- **共享包**: 修改后需 `pnpm --filter @my-app/shared build`
- **依赖**: 前端 `zod` 必须显式声明，否则 Docker 构建失败
- **服务**: 开发前启动 `docker compose up postgres redis -d`，首次运行 `pnpm db:push`
- **认证**: accessToken + refreshToken 双令牌，非 GET 请求携带 CSRF Token
- **限流**: 1s/3次、10s/20次、1min/100次
