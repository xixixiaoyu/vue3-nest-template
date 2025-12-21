# NestJS + Vue 全栈应用模板

这是一个基于 NestJS 后端和 Vue 3 前端的全栈应用模板，采用 Monorepo 架构，集成了现代 Web 开发的最佳实践和工具链。

## 🏗️ 项目架构

```
nest-vue-template/
├── apps/
│   ├── backend/          # NestJS 后端应用
│   └── frontend/         # Vue 3 前端应用
├── packages/
│   └── shared/           # 共享类型和工具
├── docker-compose.yml    # Docker 容器编排
└── pnpm-workspace.yaml   # PNPM 工作空间配置
```

## 🛠️ 技术栈

### 后端 (NestJS)
- **框架**: NestJS 10
- **数据库**: PostgreSQL + Prisma ORM
- **缓存**: Redis
- **认证**: JWT + Passport
- **验证**: Zod
- **队列**: BullMQ
- **文件存储**: AWS S3 兼容
- **邮件**: Nodemailer
- **WebSocket**: Socket.IO
- **日志**: Pino
- **API 文档**: Swagger

### 前端 (Vue 3)
- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **路由**: Vue Router 4
- **状态管理**: Pinia + 持久化
- **UI 框架**: Tailwind CSS + Reka UI
- **数据获取**: TanStack Query
- **表单验证**: VeeValidate + Zod
- **图表**: ECharts
- **国际化**: Vue I18n
- **工具**: VueUse

### 开发工具
- **包管理**: PNPM
- **构建**: Turbo
- **代码规范**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged
- **容器化**: Docker + Docker Compose

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- PNPM >= 9
- PostgreSQL >= 14
- Redis >= 6

### 本地开发

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd nest-vue-template
   ```

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，配置数据库和其他服务
   ```

4. **启动数据库服务**
   ```bash
   # 使用 Docker 启动 PostgreSQL 和 Redis
   docker compose up postgres redis -d
   ```

5. **初始化数据库**
   ```bash
   pnpm db:push
   pnpm db:generate
   ```

6. **启动开发服务器**
   ```bash
   # 同时启动前后端
   pnpm dev
   
   # 或分别启动
   pnpm --filter @my-app/backend dev  # 后端: http://localhost:3000
   pnpm --filter @my-app/frontend dev # 前端: http://localhost:5173
   ```

### Docker 部署

1. **构建并启动所有服务**
   ```bash
   docker compose up -d
   ```

2. **查看服务状态**
   ```bash
   docker compose ps
   ```

3. **查看日志**
   ```bash
   docker compose logs -f
   ```

## 📁 项目结构

### 后端结构

```
apps/backend/src/
├── auth/              # 认证模块
├── common/            # 公共模块（过滤器、拦截器等）
├── events/            # WebSocket 事件
├── health/            # 健康检查
├── mail/              # 邮件服务
├── prisma/            # 数据库服务
├── redis/             # Redis 缓存
├── scheduled-tasks/   # 定时任务
├── upload/            # 文件上传
├── users/             # 用户管理
├── app.module.ts      # 根模块
└── main.ts            # 应用入口
```

### 前端结构

```
apps/frontend/src/
├── api/               # API 请求
├── components/        # 组件
│   └── ui/           # UI 基础组件
├── composables/       # 组合式函数
├── i18n/             # 国际化
├── lib/              # 工具库
├── router/           # 路由配置
├── stores/           # 状态管理
├── styles/           # 样式文件
├── views/            # 页面组件
├── App.vue           # 根组件
└── main.ts           # 应用入口
```

## 🔧 开发指南

### 数据库操作

```bash
# 生成 Prisma 客户端
pnpm db:generate

# 推送数据库 schema 变更
pnpm db:push

# 运行数据库迁移
pnpm db:migrate

# 打开 Prisma Studio
pnpm db:studio
```

### 代码规范

```bash
# 代码检查
pnpm lint

# 自动修复
pnpm lint:fix

# 代码格式化
pnpm format

# 格式检查
pnpm format:check
```

### 测试

```bash
# 运行所有测试
pnpm test

# 监听模式
pnpm test:watch

# 测试覆盖率
pnpm test:coverage
```

### 构建

```bash
# 构建所有应用
pnpm build

# 构建特定应用
pnpm --filter @my-app/backend build
pnpm --filter @my-app/frontend build
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

### 生产部署

1. **构建 Docker 镜像**
   ```bash
   docker compose build
   ```

2. **启动生产服务**
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 常见问题

### Q: 如何添加新的 API 端点？
A: 在 `apps/backend/src` 下创建新模块，使用 Nest CLI: `nest generate module module-name`

### Q: 如何添加新的前端页面？
A: 在 `apps/frontend/src/views` 下创建新组件，并在 `apps/frontend/src/router/index.ts` 中添加路由

### Q: 如何共享类型定义？
A: 在 `packages/shared/src` 中添加类型定义，然后在前后端中导入使用

### Q: 如何自定义主题？
A: 修改 `apps/frontend/tailwind.config.js` 和相关 CSS 变量

---

如有其他问题，请提交 Issue 或联系项目维护者。