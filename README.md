# vue3-nest-template

一个基于 `Vue 3 + NestJS` 的全栈模板，放在 `pnpm workspace + Turbo` 的 monorepo 里。

它的目标不是“万能脚手架”，而是给你一个能继续长出来的起点。

## 先说清楚

这不是完美模板。

它已经把前后端联调、共享类型、认证、数据库、Redis、跨端能力这些基础骨架搭起来了，但你在真实项目里大概率还是会遇到一些问题，比如：

- 某些细节还需要按业务场景继续收口
- 部分功能虽然有结构，但不一定已经打磨到生产级别
- 跨端、Docker、构建链路这种地方，天然就比纯 Web 更容易踩坑

如果你想找的是“拉下来就 100% 无脑开工”的模板，这个仓库可能不会完全符合预期。
如果你想找的是“方向基本对，剩下可以自己接着改”的模板，它会更合适。

## 这个仓库里有什么

- `apps/frontend`: Vue 3 前端，基于 Vite
- `apps/backend`: NestJS 后端
- `packages/shared`: 前后端共享的 Zod Schema、类型、DTO 和工具函数

这个项目最重要的约束只有一个：

`packages/shared` 是前后端契约的单一事实源（SSOT）。

也就是说，跨包的数据结构不要各写各的。先改 shared，再让前后端一起消费。

## 技术栈

- 前端: Vue 3, Vite, Pinia, TailwindCSS, shadcn-vue, TanStack Query, VeeValidate, Vue I18n
- 后端: NestJS, Prisma, PostgreSQL, Redis, BullMQ, JWT, Socket.IO
- 共享契约: Zod, nestjs-zod
- 工程化: pnpm workspace, Turbo, ESLint, Prettier, Vitest
- 跨端: Capacitor, Electron, PWA

## 快速开始

要求：

- Node `>=20.19.0`
- pnpm `>=9.15.0`
- Docker（如果你准备本地起 PostgreSQL / Redis）

安装和启动：

```bash
pnpm install
cp .env.example .env
docker compose up postgres redis -d
pnpm db:push
pnpm dev
```

默认地址：

- 前端: [http://localhost:5173](http://localhost:5173)
- 后端: [http://localhost:3000/api](http://localhost:3000/api)
- Swagger: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- Health: [http://localhost:3000/api/health](http://localhost:3000/api/health)

## 常用命令

```bash
# 全仓
pnpm dev
pnpm build
pnpm lint
pnpm type-check
pnpm test

# 按包运行
pnpm --filter @my-app/frontend dev
pnpm --filter @my-app/backend dev
pnpm --filter @my-app/shared build

# 数据库
pnpm db:push
pnpm db:migrate
pnpm db:studio
```

## 开发时建议你记住的几件事

### 1. shared 不是可选项

前端表单、后端 DTO、TypeScript 类型推导，最好都直接复用 `@my-app/shared`。

例如：

```ts
import { LoginSchema } from '@my-app/shared'
```

不要在前端和后端各自再复制一份“差不多一样”的类型定义。那样后面一定会漂移。

### 2. 前端保留 `zod` 依赖

即使你觉得某些地方是通过 shared 间接使用，前端也请显式保留 `zod` 依赖。
这个约束主要是为了避免某些 Docker 构建场景出问题。

### 3. 接口返回有统一格式

成功响应：

```ts
interface ApiResponse<T> {
  success: true
  data: T
  timestamp: string
  message?: string
}
```

错误响应：

```ts
interface ApiErrorResponse {
  success: false
  data: null
  message: string
  statusCode: number
  timestamp: string
}
```

## 本地校验

改动后，至少跑对应范围的检查：

```bash
# 只改前端
pnpm --filter @my-app/frontend lint
pnpm --filter @my-app/frontend type-check
pnpm --filter @my-app/frontend test

# 只改后端
pnpm --filter @my-app/backend lint
pnpm --filter @my-app/backend type-check
pnpm --filter @my-app/backend test

# 改 shared
pnpm --filter @my-app/shared build
pnpm --filter @my-app/frontend lint
pnpm --filter @my-app/frontend test
pnpm --filter @my-app/backend lint
pnpm --filter @my-app/backend test
```

如果你改的是 Schema、DTO 或响应字段，别只看类型过没过，前后端要实际联调一次。

## 适合谁

- 想快速起一个 Vue + Nest 的全栈项目
- 希望前后端共享类型，而不是手写两份接口
- 能接受模板本身还需要继续修、继续补，而不是追求一步到位

## 最后

这个仓库更像一套“已经搭出主梁的半成品工程”，不是精装修样板间。

如果你准备用它开新项目，建议把它当成起点，不要当成标准答案。
