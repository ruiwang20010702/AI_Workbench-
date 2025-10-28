# Railway 部署指南 - AI Workbench

## 概述

本文档详细介绍如何将 AI Workbench 项目部署到 Railway 平台。Railway 是一个现代化的云平台，特别适合全栈应用的快速部署。

## 项目架构

AI Workbench 是一个全栈应用，包含：
- **前端**: React + TypeScript + Vite + Tailwind CSS
- **后端**: Node.js + Express + TypeScript
- **数据库**: PostgreSQL
- **缓存**: Redis
- **文件存储**: 本地文件系统（可扩展为云存储）

## 准备工作

### 1. 账户准备
- 注册 [Railway](https://railway.app) 账户
- 安装 Railway CLI（可选）
- 准备 GitHub 仓库（推荐）

### 2. 环境变量准备
准备以下环境变量：
```
# 数据库配置（Railway 会自动提供）
DATABASE_URL=postgresql://username:password@host:port/database

# JWT 密钥
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# OpenAI API 密钥（如果使用 AI 功能）
OPENAI_API_KEY=your-openai-api-key

# CORS 配置
CORS_ORIGIN=https://your-frontend-domain.railway.app

# Redis URL（Railway 会自动提供）
REDIS_URL=redis://default:password@host:port

# 应用端口
PORT=8000

# 环境
NODE_ENV=production
```

## 部署步骤

### 方法一：通过 Railway Web 界面部署

#### 1. 创建新项目
1. 登录 Railway 控制台
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 连接你的 GitHub 账户并选择项目仓库

#### 2. 配置数据库服务
1. 在项目中点击 "Add Service"
2. 选择 "Database" → "PostgreSQL"
3. Railway 会自动创建数据库并提供连接信息
4. 记录 `DATABASE_URL` 环境变量

#### 3. 配置 Redis 服务
1. 再次点击 "Add Service"
2. 选择 "Database" → "Redis"
3. Railway 会自动创建 Redis 实例
4. 记录 `REDIS_URL` 环境变量

#### 4. 配置后端服务
1. 点击 "Add Service" → "GitHub Repo"
2. 选择你的仓库
3. 设置构建配置：
   - **Root Directory**: `server`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. 配置环境变量（在 Variables 标签页）：
   ```
   NODE_ENV=production
   PORT=8000
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   JWT_SECRET=your-super-secret-jwt-key
   OPENAI_API_KEY=your-openai-api-key
   CORS_ORIGIN=https://your-frontend-domain.railway.app
   ```

#### 5. 配置前端服务
1. 再次点击 "Add Service" → "GitHub Repo"
2. 选择同一个仓库
3. 设置构建配置：
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run preview`
4. 配置环境变量：
   ```
   VITE_API_URL=https://your-backend-domain.railway.app
   ```

### 方法二：使用 Railway CLI 部署

#### 1. 安装 Railway CLI
```bash
# macOS/Linux
curl -fsSL https://railway.app/install.sh | sh

# Windows (PowerShell)
iwr https://railway.app/install.ps1 | iex
```

#### 2. 登录并初始化
```bash
# 登录
railway login

# 在项目根目录初始化
railway init
```

#### 3. 创建服务配置文件

在项目根目录创建 `railway.json`：
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "sleepApplication": false,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

在 `server` 目录创建 `railway.json`：
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "numReplicas": 1
  }
}
```

在 `client` 目录创建 `railway.json`：
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm run preview",
    "numReplicas": 1
  }
}
```

#### 4. 部署服务
```bash
# 部署后端
cd server
railway up

# 部署前端
cd ../client
railway up
```

## 配置优化

### 1. 自定义域名
1. 在 Railway 控制台中选择服务
2. 进入 "Settings" → "Domains"
3. 添加自定义域名
4. 配置 DNS 记录

### 2. 环境变量管理
- 使用 Railway 的环境变量功能
- 敏感信息使用 Railway 的 Secret 管理
- 不同环境使用不同的变量配置

### 3. 数据库迁移
```bash
# 连接到 Railway 数据库执行迁移
railway connect postgres
# 或者通过环境变量在本地执行
DATABASE_URL="your-railway-db-url" npm run db:migrate
```

### 4. 监控和日志
- 使用 Railway 内置的日志查看功能
- 配置健康检查端点
- 设置告警通知

## 成本优化

### 1. 资源配置
- 根据实际需求调整服务规格
- 使用 Railway 的自动休眠功能
- 监控资源使用情况

### 2. 免费额度
Railway 提供免费额度：
- $5/月 的免费使用额度
- 适合小型项目和原型开发
- 超出后按使用量计费

## 故障排除

### 1. 常见问题

#### 构建失败
- 检查 `package.json` 中的脚本配置
- 确认 Node.js 版本兼容性
- 查看构建日志中的错误信息

#### 数据库连接失败
- 确认 `DATABASE_URL` 环境变量正确
- 检查数据库服务是否正常运行
- 验证网络连接

#### 前后端通信问题
- 确认 CORS 配置正确
- 检查 API 端点 URL
- 验证环境变量设置

### 2. 调试技巧
```bash
# 查看服务日志
railway logs

# 连接到服务进行调试
railway shell

# 查看环境变量
railway variables
```

## 安全最佳实践

### 1. 环境变量安全
- 使用强密码和复杂的 JWT 密钥
- 定期轮换敏感信息
- 不在代码中硬编码密钥

### 2. 网络安全
- 配置适当的 CORS 策略
- 使用 HTTPS（Railway 自动提供）
- 限制数据库访问权限

### 3. 应用安全
- 启用 Helmet.js 安全头
- 实施速率限制
- 定期更新依赖包

## 维护和更新

### 1. 自动部署
- 配置 GitHub Actions 或 Railway 的自动部署
- 设置不同分支对应不同环境
- 实施 CI/CD 流程

### 2. 备份策略
- 定期备份数据库
- 使用 Railway 的快照功能
- 制定灾难恢复计划

### 3. 性能监控
- 监控应用性能指标
- 设置告警阈值
- 定期优化查询和代码

## 扩展和升级

### 1. 水平扩展
- 增加服务副本数量
- 使用负载均衡
- 优化数据库连接池

### 2. 垂直扩展
- 升级服务器规格
- 增加内存和 CPU
- 优化资源分配

### 3. 功能扩展
- 添加 CDN 支持
- 集成文件存储服务
- 实施缓存策略

## 总结

Railway 为 AI Workbench 项目提供了一个简单而强大的部署平台。通过本指南，你可以：

1. 快速部署全栈应用
2. 配置数据库和缓存服务
3. 管理环境变量和域名
4. 实施安全和监控最佳实践
5. 优化成本和性能

Railway 的优势在于其简单性和自动化程度，特别适合快速原型开发和中小型项目的生产部署。

## 相关链接

- [Railway 官方文档](https://docs.railway.app/)
- [Railway CLI 文档](https://docs.railway.app/develop/cli)
- [项目 GitHub 仓库](https://github.com/your-username/AI_Workbench)
- [Railway 定价](https://railway.app/pricing)

---

*最后更新时间: 2024年12月*