# NestJS + Vue 全栈应用模板

[![CI](https://github.com/{owner}/vue3-nest-template/actions/workflows/ci.yml/badge.svg)](https://github.com/{owner}/vue3-nest-template/actions/workflows/ci.yml)
[![Deploy](https://github.com/{owner}/vue3-nest-template/actions/workflows/deploy.yml/badge.svg)](https://github.com/{owner}/vue3-nest-template/actions/workflows/deploy.yml)

基于 **NestJS + Vue 3** 的全栈应用模板，采用 **pnpm Monorepo** 架构，集成现代 Web 开发的最佳实践和工具链。

## 🏗️ 项目架构

```
nest-vue-template/
├── apps/
│   ├── backend/          # NestJS 后端（@my-app/backend）
│   └── frontend/         # Vue 3 前端（@my-app/frontend）
├── packages/
│   └── shared/           # 共享包（@my-app/shared）- DTO、Schema、工具函数
├── docker-compose.yml    # 容器编排（PostgreSQL、Redis、后端、前端）
└── pnpm-workspace.yaml   # pnpm 工作空间配置
```

## 🛠️ 技术栈

### 后端 (NestJS 10)

| 类别 | 技术 |
|------|------|
| 运行时 | Node.js 18+ |
| 数据库 | PostgreSQL 16 + Prisma ORM |
| 缓存/队列 | Redis 7 + BullMQ |
| 认证 | JWT + Passport |
| 验证 | Zod + nestjs-zod |
| 文件存储 | AWS S3 兼容 |
| 邮件 | Nodemailer |
| WebSocket | Socket.IO |
| 日志 | nestjs-pino |
| API 文档 | Swagger |

### 前端 (Vue 3)

| 类别 | 技术 |
|------|------|
| 构建 | Vite |
| 路由 | Vue Router 4 |
| 状态 | Pinia + 持久化 |
| UI | Tailwind CSS + shadcn-vue (Reka UI) |
| 请求 | TanStack Query + Axios |
| 表单 | VeeValidate + Zod |
| 图表 | ECharts + vue-echarts |
| 国际化 | Vue I18n |
| 图标 | Lucide Vue |
| 工具 | VueUse |

### 跨端能力

| 平台 | 技术 | 说明 |
|------|------|------|
| iOS / Android | Capacitor 8 | 原生移动应用，支持设备 API 访问 |
| Windows / macOS / Linux | Electron 36 | 跨平台桌面应用 |
| PWA | vite-plugin-pwa | 渐进式 Web 应用，支持离线访问 |

### 开发工具

| 类别 | 技术 |
|------|------|
| 包管理 | pnpm 9+ (workspace) |
| 构建编排 | Turbo |
| 代码规范 | ESLint 9 + Prettier |
| 测试 | Vitest |
| Git Hooks | Husky + lint-staged |
| 容器化 | Docker + Docker Compose |

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 9
- PostgreSQL >= 16
- Redis >= 7

### 本地开发

```bash
# 1. 克隆项目
git clone <repository-url>
cd nest-vue-template

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库和其他服务

# 4. 启动数据库服务
docker compose up postgres redis -d

# 5. 初始化数据库
pnpm db:push
pnpm db:generate

# 6. 启动开发服务器
pnpm dev  # 同时启动前后端
```

### 常用命令

```bash
# 开发
pnpm dev                            # 同时启动前后端
pnpm --filter @my-app/backend dev   # 仅后端 (localhost:3000)
pnpm --filter @my-app/frontend dev  # 仅前端 (localhost:5173)

# 数据库
pnpm db:generate                    # 生成 Prisma Client
pnpm db:push                        # 推送 Schema 到数据库
pnpm db:migrate                     # 运行迁移
pnpm db:studio                      # 打开 Prisma Studio

# 质量检查
pnpm lint                           # ESLint 检查
pnpm lint:fix                       # 自动修复
pnpm format                         # Prettier 格式化
pnpm format:check                   # 格式检查

# 测试
pnpm test                           # 运行所有测试
pnpm test:watch                     # 监听模式
pnpm test:coverage                  # 测试覆盖率

# 构建
pnpm build                          # 构建所有应用
pnpm --filter @my-app/backend build # 构建后端
pnpm --filter @my-app/frontend build # 构建前端

# 跨端开发（在 frontend 目录下执行）
pnpm cap:sync                       # 同步 Web 资源到原生项目
pnpm cap:open:ios                   # 打开 Xcode
pnpm cap:open:android               # 打开 Android Studio
pnpm cap:run:ios                    # 运行 iOS 应用
pnpm cap:run:android                # 运行 Android 应用
pnpm electron:dev                   # 启动 Electron 开发模式
pnpm electron:build                 # 构建所有平台桌面应用
pnpm electron:build:mac             # 构建 macOS 应用
pnpm electron:build:win             # 构建 Windows 应用
pnpm electron:build:linux           # 构建 Linux 应用

# Docker
docker compose up postgres redis -d # 启动数据库服务
docker compose up -d                # 启动所有服务
docker compose logs -f              # 查看日志
```

## 📁 项目结构

### 后端关键目录

```
apps/backend/src/
├── auth/              # JWT 认证、守卫、装饰器
├── common/            # 过滤器、拦截器、中间件
├── events/            # WebSocket 事件
├── health/            # 健康检查
├── mail/              # 邮件服务
├── prisma/            # 数据库服务
├── redis/             # 缓存服务、装饰器
├── scheduled-tasks/   # 定时任务
├── upload/            # 文件上传
├── users/             # 用户管理
├── app.module.ts      # 根模块
└── main.ts            # 应用入口
```

### 前端关键目录

```
apps/frontend/
├── src/
│   ├── api/               # API 请求封装
│   ├── components/        # 组件
│   │   └── ui/            # shadcn-vue UI 基础组件
│   ├── composables/       # 组合式函数
│   ├── i18n/              # 国际化配置
│   ├── lib/               # 工具库（cn() 等）
│   ├── router/            # 路由配置
│   ├── stores/            # Pinia 状态管理
│   ├── styles/            # 样式文件
│   ├── views/             # 页面组件
│   ├── App.vue            # 根组件
│   └── main.ts            # 应用入口
├── electron/              # Electron 桌面端入口
│   ├── main.ts            # 主进程
│   └── preload.ts         # 预加载脚本
├── android/               # Android 原生项目（Capacitor 生成）
├── ios/                   # iOS 原生项目（Capacitor 生成）
└── capacitor.config.ts    # Capacitor 配置
```

## 📐 代码规范

### 基本规则

- **缩进**: 2 空格
- **引号**: 单引号
- **分号**: 无
- **语法**: 优先使用 ES6+ 和 TypeScript
- **类型**: 严禁使用 `any`
- **排版**: 中文与英文/数字之间保持一个空格
- **注释**: 使用中文
- **类型定义**: 优先使用 `interface`

### 模块导入约定

```typescript
// 后端模块间引用
import { XxxModule } from './xxx'
import { YyyService } from '../yyy/yyy.service'

// 共享包
import { SomeDto, someUtil } from '@my-app/shared'

// 前端组件
import { Button } from '@/components/ui/button'
import HomeView from '@/views/HomeView.vue'
```

## 🎨 shadcn-vue 组件开发

### 配置概览

项目使用 [shadcn-vue](https://www.shadcn-vue.com/) 作为 UI 组件库，配置文件位于 `apps/frontend/components.json`：

- **风格**: new-york
- **基础色**: zinc
- **CSS 变量**: 启用
- **图标库**: lucide

### 添加新组件

```bash
# 在 frontend 目录下执行
cd apps/frontend
npx shadcn-vue@latest add <component-name>

# 示例：添加 dialog 组件
npx shadcn-vue@latest add dialog
```

### cn() 工具函数

用于合并 Tailwind 类名，自动处理冲突：

```vue
<script setup lang="ts">
import { cn } from '@/lib/utils'
</script>

<template>
  <div :class="cn('px-4 py-2', props.class, { 'bg-red-500': isError })" />
</template>
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

## 🔐 安全特性

- **Helmet**: 安全头设置
- **CORS**: 跨域资源共享配置
- **CSRF**: 跨站请求伪造防护
- **XSS**: 跨站脚本攻击防护
- **速率限制**: 防止暴力破解
- **输入验证**: Zod schema 验证
- **密码加密**: bcrypt 哈希

## 📚 API 文档

启动后端服务后，访问 Swagger 文档：

- 本地: http://localhost:3000/api/docs
- 生产环境: http://your-domain/api/docs

## 🌍 国际化

前端支持多语言，目前包含：

- 简体中文 (zh-CN)
- English (en-US)

语言文件位于 `apps/frontend/src/i18n/locales/` 目录。

## 📦 部署

### 环境变量

生产环境需要配置以下关键环境变量：

```env
# 数据库
DATABASE_URL="postgresql://user:password@host:port/database"

# Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_ACCESS_EXPIRES_IN=900
JWT_REFRESH_EXPIRES_IN=7d

# 邮件
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your-email
MAIL_PASSWORD=your-password

# 文件存储
S3_BUCKET=your-bucket
S3_REGION=your-region
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
```

### Docker 部署

```bash
# 构建并启动所有服务
docker compose up -d

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f

# 生产部署
docker compose build
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## ⚠️ 注意事项

- 提交代码前须运行 `pnpm lint` 和 `pnpm format` 确保代码质量
- 共享包 (`@my-app/shared`) 须配置 `exports` 字段，否则 Node.js 无法解析
- 后端依赖 Redis，开发前须确保 Redis 服务已启动
- 前后端均使用 Zod 进行数据校验，Schema 可在共享包中复用

## 🆘 常见问题

### Q: 如何添加新的 API 端点？

在 `apps/backend/src` 下创建新模块：

```bash
cd apps/backend
nest generate module module-name
nest generate controller module-name
nest generate service module-name
```

### Q: 如何添加新的前端页面？

1. 在 `apps/frontend/src/views` 下创建新组件
2. 在 `apps/frontend/src/router/index.ts` 中添加路由

### Q: 如何共享类型定义？

在 `packages/shared/src` 中添加类型定义，然后在前后端中导入：

```typescript
import { SomeDto } from '@my-app/shared'
```

### Q: 如何添加新的 UI 组件？

```bash
cd apps/frontend
npx shadcn-vue@latest add <component-name>
```

### Q: 如何自定义主题？

修改 `apps/frontend/tailwind.config.js` 和 `apps/frontend/src/styles/main.css` 中的 CSS 变量。

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

如有其他问题，请提交 Issue 或联系项目维护者。