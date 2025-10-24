# AI Workbench

一个现代化的 AI 驱动的工作台应用，集成了笔记管理、待办事项和 AI 助手功能。

## ✨ 功能特性

### 🔐 用户认证
- 用户注册和登录
- JWT 令牌认证
- 安全的密码加密
- 会话管理

### 📝 笔记管理
- 创建、编辑、删除笔记
- 富文本编辑器支持
- 笔记分类和标签
- 全文搜索功能
- 笔记导出 (PDF, Markdown)

### ✅ 待办事项
- 任务创建和管理
- 优先级设置
- 截止日期提醒
- 任务状态跟踪
- 批量操作

### 🤖 AI 助手
- **文本生成**: 基于提示生成内容
- **文本改写**: 改进和重写文本
- **内容总结**: 提取关键信息
- **多语言翻译**: 支持多种语言互译
- **文本分析**: 情感分析和关键词提取
- **模板生成**: 各种文档模板
- **内容优化**: SEO 和可读性优化

### 📊 数据统计
- 使用情况分析
- 生产力指标
- AI 功能使用统计
- 个人数据洞察

## 🛠️ 技术栈

### 前端
- **React 18** - 用户界面框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **Lucide React** - 图标库
- **React Router** - 路由管理
- **Axios** - HTTP 客户端

### 后端
- **Node.js** - 运行时环境
- **Express.js** - Web 框架
- **TypeScript** - 类型安全
- **PostgreSQL** - 主数据库
- **Redis** - 缓存和会话存储
- **JWT** - 身份认证
- **OpenAI API** - AI 功能集成

### 部署
- **Docker** - 容器化
- **Docker Compose** - 多容器编排
- **Nginx** - 反向代理和负载均衡
- **Let's Encrypt** - SSL 证书

## 🚀 快速开始

### 前置要求
- Node.js 18+
- Docker & Docker Compose
- Git

### 开发环境设置

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd AI_Workbench
   ```

2. **环境配置**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，配置必要的环境变量
   ```

3. **启动开发环境**
   ```bash
   # 使用 Docker Compose
   docker-compose up -d
   
   # 或者分别启动前后端
   # 后端
   cd server
   npm install
   npm run dev
   
   # 前端
   cd client
   npm install
   npm start
   ```

4. **访问应用**
   - 前端: http://localhost:3000
   - 后端 API: http://localhost:8000
   - API 文档: http://localhost:8000/api-docs

### 生产环境部署

详细的部署指南请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)

```bash
# 一键部署
./scripts/deploy.sh production
```

## 📁 项目结构

```
AI_Workbench/
├── client/                 # 前端应用
│   ├── public/            # 静态资源
│   ├── src/               # 源代码
│   │   ├── components/    # React 组件
│   │   ├── pages/         # 页面组件
│   │   ├── services/      # API 服务
│   │   ├── hooks/         # 自定义 Hooks
│   │   ├── contexts/      # React Context
│   │   └── utils/         # 工具函数
│   ├── Dockerfile         # 前端 Docker 配置
│   └── package.json       # 前端依赖
├── server/                # 后端应用
│   ├── src/               # 源代码
│   │   ├── controllers/   # 控制器
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由定义
│   │   ├── middleware/    # 中间件
│   │   ├── services/      # 业务逻辑
│   │   └── utils/         # 工具函数
│   ├── Dockerfile         # 后端 Docker 配置
│   └── package.json       # 后端依赖
├── nginx/                 # Nginx 配置
├── scripts/               # 部署和维护脚本
├── docker-compose.yml     # Docker Compose 配置
├── .env.example          # 环境变量模板
└── README.md             # 项目说明
```

## 🔧 配置说明

### 环境变量

| 变量名 | 描述 | 必需 |
|--------|------|------|
| `NODE_ENV` | 运行环境 | ✅ |
| `DATABASE_URL` | 数据库连接字符串 | ✅ |
| `JWT_SECRET` | JWT 签名密钥 | ✅ |
| `OPENAI_API_KEY` | OpenAI API 密钥 | ✅ |
| `REDIS_URL` | Redis 连接字符串 | ❌ |
| `CORS_ORIGIN` | CORS 允许的源 | ❌ |

### API 配置

```javascript
// 前端 API 配置
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// 后端服务配置
const config = {
  port: process.env.PORT || 8000,
  database: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  openaiApiKey: process.env.OPENAI_API_KEY
};
```

## 📚 API 文档

### 认证端点
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户信息

### 笔记端点
- `GET /api/notes` - 获取笔记列表
- `POST /api/notes` - 创建笔记
- `GET /api/notes/:id` - 获取单个笔记
- `PUT /api/notes/:id` - 更新笔记
- `DELETE /api/notes/:id` - 删除笔记

### 待办事项端点
- `GET /api/todos` - 获取待办事项列表
- `POST /api/todos` - 创建待办事项
- `PUT /api/todos/:id` - 更新待办事项
- `DELETE /api/todos/:id` - 删除待办事项

### AI 助手端点
- `POST /api/ai/generate` - 文本生成
- `POST /api/ai/rewrite` - 文本改写
- `POST /api/ai/summarize` - 内容总结
- `POST /api/ai/translate` - 文本翻译
- `POST /api/ai/analyze` - 文本分析

## 🧪 测试

### 运行测试
```bash
# 后端测试
cd server
npm test

# 前端测试
cd client
npm test

# 端到端测试
npm run test:e2e
```

### 测试覆盖率
```bash
# 生成测试覆盖率报告
npm run test:coverage
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范
- 使用 ESLint 和 Prettier 进行代码格式化
- 遵循 TypeScript 最佳实践
- 编写单元测试
- 更新相关文档

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🆘 支持

如果您遇到问题或有疑问，请：

1. 查看 [FAQ](docs/FAQ.md)
2. 搜索现有的 [Issues](https://github.com/your-repo/issues)
3. 创建新的 Issue
4. 联系维护者

## 🗺️ 路线图

### v1.1.0 (计划中)
- [ ] 实时协作功能
- [ ] 移动端适配
- [ ] 更多 AI 模型支持
- [ ] 插件系统

### v1.2.0 (计划中)
- [ ] 团队协作功能
- [ ] 高级分析面板
- [ ] API 限流和配额管理
- [ ] 多租户支持

## 📊 项目状态

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Coverage](https://img.shields.io/badge/coverage-85%25-yellowgreen)

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

特别感谢：
- OpenAI 提供的强大 AI 能力
- React 和 Node.js 社区
- 所有开源项目的贡献者

---

**注意**: 这是一个开源项目，欢迎社区贡献和反馈。如果您觉得这个项目有用，请给我们一个 ⭐️！