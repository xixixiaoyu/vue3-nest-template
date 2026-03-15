# vue3-nest-template

一个基于 `Vue 3 + NestJS` 的全栈模板，放在 `pnpm workspace + Turbo` 的 monorepo 里。

它不是“完美脚手架”，更像一个已经把主梁搭好的起点。

这个模板已经包含前后端分包、共享类型、认证、数据库、Redis 和跨端能力，但它依然可能有坑，也不保证适合所有业务场景。

如果你想找的是“拉下来就完全不用改”的模板，这个仓库不一定合适。
如果你想找的是“方向基本对，可以继续长”的起点，它会更接近这个目标。

## 这个仓库里有什么

- `apps/frontend`: Vue 3 前端，基于 Vite
- `apps/backend`: NestJS 后端
- `packages/shared`: 前后端共享的 Zod Schema、类型、DTO 和工具函数

这个项目最重要的约束只有一个：

`packages/shared` 是前后端契约的单一事实源（SSOT）。

也就是说，跨包的数据结构不要各写各的。先改 shared，再让前后端一起消费。

## 技术栈

- 前端: Vue 3, Vite, Pinia, TailwindCSS
- 后端: NestJS, Prisma, PostgreSQL, Redis
- 契约共享: Zod, nestjs-zod
- 工程化: pnpm workspace, Turbo, Docker, Docker Compose, ESLint, Vitest
- 跨端: Capacitor, Electron, PWA

## 快速开始

- Node `>=20.19.0`
- pnpm `>=9.15.0`
- Docker

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
pnpm dev
pnpm build
pnpm lint
pnpm type-check
pnpm test

pnpm --filter @my-app/frontend dev
pnpm --filter @my-app/backend dev
pnpm --filter @my-app/shared build
```

## 约定

- 不要在前后端重复定义已经存在于 `@my-app/shared` 的 Schema / 类型
- 变更跨端数据结构时，先改 `packages/shared`
- 前端请显式保留 `zod` 依赖，避免某些构建场景出问题

## 最后

这个仓库不是标准答案，也不是无坑模板。

如果你准备用它开新项目，建议把它当成起点，而不是终点。
