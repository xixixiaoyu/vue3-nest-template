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

### 后端 (NestJS 10)
- **运行时**: Node.js 18+
- **数据库**: PostgreSQL 16 + Prisma ORM
- **缓存/队列**: Redis 7 + BullMQ
- **认证**: JWT + Passport
- **验证**: Zod + nestjs-zod
- **日志**: nestjs-pino
- **API 文档**: Swagger
- **WebSocket**: Socket.IO

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

### 开发工具
- **包管理**: pnpm 9+ (workspace)
- **构建编排**: Turbo
- **代码规范**: ESLint 9 + Prettier
- **测试**: Vitest
- **Git Hooks**: Husky + lint-staged

## 代码规范

- 缩进: 2 空格
- 引号: 单引号
- 分号: 无
- 优先使用 ES6+ 语法和 TypeScript 类型安全
- 严禁使用 `any` 类型
- 中文与英文/数字之间保持一个空格

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

## 注意事项

- 提交代码前须运行 `pnpm lint` 和 `pnpm format` 确保代码质量
- 共享包 (@my-app/shared) 须配置 exports 字段，否则 Node.js 无法解析
- 后端依赖 Redis，开发前须确保 Redis 服务已启动
- 前后端均使用 Zod 进行数据校验，Schema 可在共享包中复用
- 代码注释使用中文，类型定义优先使用 interface