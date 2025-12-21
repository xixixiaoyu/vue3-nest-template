# GitHub Actions CI/CD 集成设计

## 需求概述

为 nest-vue-template 项目集成 GitHub Actions 自动化工作流，实现以下功能：

1. **持续集成（CI）**：代码质量检查和构建验证，在 PR 提交和分支推送时自动执行 Lint、格式验证、单元测试和构建流程
2. **持续部署（CD）**：当代码推送到 main 分支时，自动将前端应用部署到 GitHub Pages

## 设计目标

1. **代码质量保障** - 自动执行 ESLint 和 Prettier 检查，拦截不符合规范的代码
2. **构建可靠性验证** - 确保前后端项目在合并前可成功构建
3. **测试覆盖率监控** - 自动运行 Vitest 单元测试，及早发现潜在问题
4. **自动化部署** - main 分支推送后自动部署前端到 GitHub Pages，实现零手动操作
5. **开发体验优化** - 快速反馈 CI 结果，减少等待时间
6. **资源成本控制** - 合理利用 GitHub Actions 免费额度，避免重复构建

## 工作流设计

### 工作流触发策略

| 触发事件 | 目标分支 | 执行策略 | 说明 |
|---------|---------|---------|------|
| Pull Request (open/synchronize) | main, develop | 完整 CI 流程 | PR 创建或更新时执行 |
| Push | main, develop | 完整 CI 流程 | 直接推送到主要分支时执行 |
| Pull Request (ready_for_review) | main, develop | 完整 CI 流程 | 草稿 PR 转为正式时执行 |

**并发控制策略**：同一 PR 的新提交会自动取消正在运行的旧构建，避免资源浪费。

### 主 CI 工作流 (ci.yml)

#### 工作流职责

执行完整的代码质量检查和构建验证流程，包含以下阶段：

1. **环境准备阶段** - 检出代码、配置 Node.js 和 pnpm
2. **依赖安装阶段** - 安装项目依赖并缓存
3. **代码质量检查阶段** - Lint 和格式化验证
4. **测试执行阶段** - 运行单元测试
5. **构建验证阶段** - 验证前后端可成功构建

#### 执行环境配置

| 配置项 | 值 | 说明 |
|--------|---|------|
| 运行环境 | ubuntu-latest | GitHub 托管的 Ubuntu 虚拟机 |
| Node.js 版本 | 18.x | 匹配项目生产环境要求 |
| pnpm 版本 | 9.15.0 | 与 package.json 中 packageManager 字段一致 |
| 并发策略 | group: ci-${{ github.ref }} | 按分支/PR 分组控制 |
| 取消策略 | cancel-in-progress: true | 新提交取消旧构建 |

#### Job 设计：代码质量检查 (lint-and-test)

**执行步骤**：

1. **检出代码**
   - 使用 actions/checkout@v4
   - 拉取完整历史记录（depth: 0）以支持增量分析

2. **设置 Node.js 环境**
   - 使用 actions/setup-node@v4
   - 配置 Node.js 18.x LTS 版本

3. **安装 pnpm**
   - 使用 pnpm/action-setup@v4
   - 版本固定为 9.15.0（与项目锁文件保持一致）

4. **配置依赖缓存**
   - 缓存路径：pnpm store 目录
   - 缓存键：基于 pnpm-lock.yaml 的哈希值
   - 回退键：操作系统 + pnpm 前缀

5. **安装项目依赖**
   - 执行 `pnpm install --frozen-lockfile`
   - 确保依赖版本与锁文件完全一致

6. **执行格式检查**
   - 运行 `pnpm format:check`
   - 验证代码是否符合 Prettier 规范
   - 失败时提示开发者运行 `pnpm format` 修复

7. **执行 Lint 检查**
   - 运行 `pnpm lint`
   - 通过 Turbo 并行检查所有 workspace
   - 验证 ESLint 规则合规性

8. **执行单元测试**
   - 运行 `pnpm test`
   - 执行所有 Vitest 测试套件
   - 失败时阻止 PR 合并

#### Job 设计：构建验证 (build)

**依赖关系**：依赖 lint-and-test Job 成功完成

**执行步骤**：

1. **检出代码**
   - 同 lint-and-test Job

2. **设置 Node.js 环境**
   - 同 lint-and-test Job

3. **安装 pnpm**
   - 同 lint-and-test Job

4. **配置依赖缓存**
   - 复用 lint-and-test Job 的缓存
   - 减少重复下载时间

5. **安装项目依赖**
   - 执行 `pnpm install --frozen-lockfile`

6. **生成 Prisma Client**
   - 运行 `pnpm db:generate`
   - 生成数据库访问层代码
   - 确保后端编译依赖完整

7. **构建共享包**
   - 运行 `pnpm --filter @my-app/shared build`
   - 先构建共享包，因为前后端都依赖它

8. **构建后端项目**
   - 运行 `pnpm --filter @my-app/backend build`
   - 验证 NestJS 项目可成功编译
   - 检查 TypeScript 类型安全

9. **构建前端项目**
   - 运行 `pnpm --filter @my-app/frontend build`
   - 验证 Vue 3 + Vite 项目可成功构建
   - 检查生产环境优化配置

#### 缓存策略

**依赖缓存**：
- 缓存键计算：`${{ runner.os }}-pnpm-${{ hashFiles('pnpm-lock.yaml') }}`
- 缓存内容：pnpm store 目录（~/.pnpm-store）
- 失效条件：pnpm-lock.yaml 文件变更
- 回退策略：使用 `${{ runner.os }}-pnpm-` 前缀的最新缓存

**构建缓存**（由 Turbo 自动管理）：
- Turbo 缓存目录：.turbo
- 缓存粒度：按任务和文件哈希缓存
- 缓存失效：源文件或依赖变更时自动失效

### 工作流文件存放位置

GitHub Actions 工作流文件需创建在项目根目录的 `.github/workflows/` 目录下：

```
.github/
└── workflows/
    ├── ci.yml
    └── deploy.yml
```

**文件说明**：
- **ci.yml**：代码质量检查和构建验证工作流
- **deploy.yml**：前端自动部署到 GitHub Pages 工作流

## 状态徽章集成

在项目 README.md 顶部添加 CI 和部署状态徽章，实时展示构建状态：

**CI 状态徽章**：
```markdown
[![CI](https://github.com/{owner}/vue3-nest-template/actions/workflows/ci.yml/badge.svg)](https://github.com/{owner}/vue3-nest-template/actions/workflows/ci.yml)
```

**部署状态徽章**：
```markdown
[![Deploy](https://github.com/{owner}/vue3-nest-template/actions/workflows/deploy.yml/badge.svg)](https://github.com/{owner}/vue3-nest-template/actions/workflows/deploy.yml)
```

**说明**：
- `{owner}` 替换为 GitHub 用户名或组织名
- 徽章颜色自动变化：绿色（通过）、红色（失败）、黄色（运行中）
- 可并排放置在 README 顶部展示项目状态

## 权限和安全配置

### GitHub Actions 权限

工作流使用默认的 `GITHUB_TOKEN`，具备以下权限：
- **contents: read** - 读取仓库代码
- **pull-requests: write** - 在 PR 中添加评论（可选，用于测试报告）
- **checks: write** - 创建检查运行状态

无需额外配置 Secret，使用 GitHub 自动提供的临时令牌。

### 安全最佳实践

1. **依赖锁定**：使用 `--frozen-lockfile` 防止依赖版本漂移
2. **并发限制**：同一 PR 只运行最新提交的构建
3. **权限最小化**：仅授予必要的读写权限
4. **环境隔离**：每次运行使用全新的虚拟机环境

## 失败处理策略

### CI 失败时的开发者流程

1. **查看失败日志**
   - 在 PR 页面点击 "Details" 查看详细日志
   - 定位到具体失败的步骤和错误信息

2. **本地修复验证**
   - Lint 失败：运行 `pnpm lint:fix` 自动修复
   - 格式失败：运行 `pnpm format` 格式化代码
   - 测试失败：运行 `pnpm test` 本地调试
   - 构建失败：运行 `pnpm build` 检查编译错误

3. **推送修复**
   - 提交修复后的代码
   - GitHub Actions 自动重新运行 CI 流程

### PR 合并保护规则

建议在 GitHub 仓库设置中配置分支保护规则（Settings → Branches → Branch protection rules）：

| 规则 | 配置 | 说明 |
|------|------|------|
| Require status checks to pass | 启用 | 必须 CI 通过才能合并 |
| Required checks | lint-and-test, build | 必须通过的 Job |
| Require branches to be up to date | 启用 | 合并前需与目标分支同步 |
| Require pull request reviews | 可选 | 需要代码审查（团队协作推荐） |

## 性能优化策略

### 执行时间优化

1. **并行执行**：通过 Turbo 并行运行 Lint、Test 和 Build 任务
2. **依赖缓存**：pnpm store 缓存减少 50%+ 依赖安装时间
3. **构建缓存**：Turbo 缓存避免重复构建未变更的包
4. **增量检查**：ESLint 仅检查变更的文件（通过 Turbo 实现）

### 成本控制

GitHub Actions 对公共仓库免费，私有仓库每月提供 2000 分钟免费额度。

**预估使用量**（单次完整 CI 运行）：
- 依赖安装（有缓存）：1-2 分钟
- Lint + 格式检查：1 分钟
- 单元测试：2-3 分钟
- 构建（三个包）：3-4 分钟
- **总计**：约 7-10 分钟

**优化建议**：
- 避免在草稿 PR 中频繁提交（可在本地验证后再推送）
- 使用并发取消策略避免重复运行
- 仅在必要分支上启用 CI（main、develop）

## 前端部署配置

### GitHub Pages 部署策略

#### 仓库信息

- **仓库名称**：vue3-nest-template
- **访问地址**：`https://{username}.github.io/vue3-nest-template/`
- **部署分支**：gh-pages（自动创建）
- **部署目录**：apps/frontend/dist

#### 路由配置要求

GitHub Pages 部署到子路径时，需要配置 Vite 的 base 选项和 Vue Router 的 base：

**Vite 配置调整**（apps/frontend/vite.config.ts）：
- 生产环境 base 设置为 `/vue3-nest-template/`
- 开发环境保持默认 `/`
- 通过环境变量 `process.env.NODE_ENV` 区分

**Vue Router 配置调整**（apps/frontend/src/router/index.ts）：
- createWebHistory 的 base 参数设置为 `import.meta.env.BASE_URL`
- Vite 会自动将 BASE_URL 替换为配置的 base 值

#### 404 处理方案

由于 GitHub Pages 是静态托管，SPA 路由刷新会导致 404 错误。解决方案：

**方案一：使用 Hash 路由**（推荐，无需额外配置）
- 将 createWebHistory 改为 createWebHashHistory
- URL 格式变为 `/#/path`，兼容性最好

**方案二：404 重定向**（保持 History 模式）
- 在构建产物中添加 404.html，内容与 index.html 相同
- GitHub Pages 会自动将 404 请求重定向到 404.html
- 需在构建脚本中复制 index.html 为 404.html

### 部署工作流设计 (deploy.yml)

#### 工作流职责

在 main 分支代码推送后，自动构建前端项目并部署到 GitHub Pages。

#### 触发条件

| 触发事件 | 分支过滤 | 说明 |
|---------|---------|------|
| Push | main | 仅 main 分支推送触发 |
| Workflow Dispatch | - | 支持手动触发部署 |

#### 执行环境配置

| 配置项 | 值 | 说明 |
|--------|---|------|
| 运行环境 | ubuntu-latest | GitHub 托管虚拟机 |
| Node.js 版本 | 18.x | 与项目一致 |
| pnpm 版本 | 9.15.0 | 与 package.json 一致 |
| 权限 | contents: write | 允许推送到 gh-pages 分支 |

#### Job 设计：构建和部署 (build-and-deploy)

**执行步骤**：

1. **检出代码**
   - 使用 actions/checkout@v4
   - 拉取完整代码库

2. **设置 Node.js 环境**
   - 使用 actions/setup-node@v4
   - 配置 Node.js 18.x

3. **安装 pnpm**
   - 使用 pnpm/action-setup@v4
   - 版本 9.15.0

4. **配置依赖缓存**
   - 缓存 pnpm store 目录
   - 缓存键基于 pnpm-lock.yaml 哈希值

5. **安装项目依赖**
   - 执行 `pnpm install --frozen-lockfile`

6. **构建共享包**
   - 运行 `pnpm --filter @my-app/shared build`
   - 前端构建依赖共享包

7. **构建前端项目**
   - 运行 `pnpm --filter @my-app/frontend build`
   - 设置环境变量 `NODE_ENV=production`
   - 构建产物输出到 apps/frontend/dist

8. **添加 .nojekyll 文件**
   - 在 dist 目录创建 .nojekyll 文件
   - 禁用 GitHub Pages 的 Jekyll 处理
   - 确保以 `_` 开头的文件（如 Vite 资源）可正常访问

9. **部署到 GitHub Pages**
   - 使用 peaceiris/actions-gh-pages@v4
   - 推送 apps/frontend/dist 到 gh-pages 分支
   - 使用 GITHUB_TOKEN 进行认证（自动提供）

#### 部署配置参数

| 参数 | 值 | 说明 |
|------|---|------|
| github_token | ${{ secrets.GITHUB_TOKEN }} | GitHub 自动提供的令牌 |
| publish_dir | ./apps/frontend/dist | 前端构建产物目录 |
| publish_branch | gh-pages | 部署目标分支 |
| force_orphan | true | 每次部署创建全新提交历史 |
| user_name | github-actions[bot] | 提交者名称 |
| user_email | github-actions[bot]@users.noreply.github.com | 提交者邮箱 |

### GitHub Pages 仓库设置

部署工作流运行成功后，需在 GitHub 仓库中手动配置 Pages 设置：

**配置路径**：仓库 Settings → Pages

**配置项**：
- **Source**：Deploy from a branch
- **Branch**：gh-pages / (root)
- **Custom domain**：可选，配置自定义域名

保存后，GitHub 会自动从 gh-pages 分支部署网站，通常 1-2 分钟后生效。

### 环境变量管理

#### 前端环境变量配置

**开发环境** (.env.development)：
```
VITE_API_BASE_URL=http://localhost:3000
```

**生产环境** (.env.production)：
```
VITE_API_BASE_URL=https://api.yourdomain.com
```

**说明**：
- Vite 在构建时会自动读取对应环境的 .env 文件
- 生产环境 API 地址需替换为实际的后端服务地址
- 如果后端也部署在 GitHub，可使用相对路径或 GitHub Pages URL

#### 敏感信息保护

如需在构建时注入敏感信息（如 API Key）：

1. 在 GitHub 仓库设置中添加 Secret（Settings → Secrets and variables → Actions）
2. 在工作流中通过 `${{ secrets.SECRET_NAME }}` 引用
3. 作为环境变量传递给构建命令

**示例**：
```yaml
- name: 构建前端项目
  run: pnpm --filter @my-app/frontend build
  env:
    VITE_API_KEY: ${{ secrets.VITE_API_KEY }}
```

## 扩展规划

当前设计已实现 CI/CD 基础流程，未来可根据项目需求扩展以下功能：

### 阶段二：测试覆盖率报告

- 集成 Codecov 或 Coveralls 服务
- 在 PR 中自动展示覆盖率变化
- 设置最低覆盖率阈值（如 80%）

### 阶段三：Docker 镜像构建

- 构建 backend 和 frontend 的 Docker 镜像
- 推送到 Docker Hub 或阿里云镜像仓库
- 使用镜像标签管理版本（如 latest、git-sha）

### 阶段四：后端自动化部署

- 主分支合并后自动部署后端到云服务器
- 发布标签时自动部署到生产环境
- 集成健康检查确保部署成功

### 阶段五：跨平台构建

- 构建 Electron 桌面应用（Windows/macOS/Linux）
- 构建移动端应用（iOS/Android）需配合云构建服务
- 自动发布到 GitHub Releases

## 验证清单

在集成 GitHub Actions 后，需验证以下功能正常工作：

### CI 工作流验证

- [ ] 创建新 PR 时自动触发 CI 流程
- [ ] CI 失败时 PR 状态显示为不可合并
- [ ] CI 通过时 PR 状态显示为可合并
- [ ] 新提交推送后自动取消旧的构建
- [ ] 缓存机制生效，第二次运行明显加速
- [ ] 所有检查项（Lint/Test/Build）独立显示结果
- [ ] 本地运行 `pnpm lint && pnpm test && pnpm build` 可复现 CI 环境

### 部署工作流验证

- [ ] 推送到 main 分支后自动触发部署流程
- [ ] 部署成功后 gh-pages 分支自动更新
- [ ] GitHub Pages 网站可正常访问（`https://{username}.github.io/vue3-nest-template/`）
- [ ] 前端路由跳转正常（无 404 错误）
- [ ] 静态资源（CSS/JS/图片）加载正常
- [ ] API 请求指向正确的后端地址
- [ ] 部署状态徽章实时反映部署结果
- [ ] 手动触发部署功能正常（在 Actions 页面点击 Run workflow）

### 配置文件验证

- [ ] Vite base 配置正确（生产环境为 `/vue3-nest-template/`）
- [ ] Vue Router base 配置正确（使用 `import.meta.env.BASE_URL`）
- [ ] .env.production 文件配置正确的 API 地址
- [ ] .nojekyll 文件已添加到构建产物
- [ ] GitHub Pages 设置中 Source 配置为 gh-pages 分支