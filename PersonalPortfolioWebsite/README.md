# 个人作品集网站

一个功能完整的个人作品集网站，使用 Golang(Gin) + React + SQLite 技术栈构建。

## 功能特性

### 前台功能
- 🎨 **作品展示** - 图文展示项目作品，支持 Markdown 内容
- 🏷️ **分类筛选** - 按分类浏览和搜索作品
- 👤 **关于页面** - 个人介绍、技能展示
- 📧 **联系表单** - 访客留言功能（防垃圾提交
- 🔍 **SEO 优化** - 完善的 meta 标签和结构化数据
- ⚡ **性能优化** - 图片懒加载、代码分割

### 后台管理
- 🔐 **JWT 认证** - 安全的登录机制
- 📝 **作品管理** - 新建、编辑、删除作品
- 🗂️ **分类管理** - 管理作品分类
- 💪 **技能管理** - 管理个人技能
- ℹ️ **关于信息编辑**
- 📬 **消息管理** - 查看和管理联系消息
- 🖼️ **图片上传**

## 技术栈

### 后端
- **Golang 1.21**
- **Gin v1.9.1** - Web 框架
- **GORM v1.25.5** - ORM
- **SQLite** - 数据库
- **JWT** - 身份认证

### 前端
- **React 18**
- **Vite 5** - 构建工具
- **React Router v6** - 路由
- **Axios** - HTTP 客户端
- **React Helmet Async** - SEO 优化
- **React Markdown** - Markdown 渲染

## 快速开始

### 环境要求
- Go 1.21+
- Node.js 18+
- 不需要额外安装数据库（使用 SQLite）

### 后端启动

```bash
cd backend
go mod download
go run main.go
```

后端服务将在 `http://localhost:8080` 启动

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

前端开发服务器将在 `http://localhost:3000` 启动

### 默认账号
- 用户名: `admin`
- 密码: `admin123`

后台管理入口: `http://localhost:3000/admin/login`

## 项目结构

```
.
├── backend/                 # 后端代码
│   ├── config/          # 配置模块
│   ├── controllers/     # 控制器
│   ├── database/      # 数据库连接
│   ├── middleware/    # 中间件
│   ├── models/         # 数据模型
│   ├── routes/         # 路由
│   ├── uploads/        # 上传文件目录
│   ├── main.go       # 入口文件
│   ├── go.mod
│   └── .env
│
└── frontend/            # 前端代码
    ├── src/
    │   ├── components/   # 公共组件
    │   ├── pages/        # 页面组件
    │   │   └── admin/   # 后台管理页面
    │   ├── services/    # API 服务
    │   ├── styles/      # 样式文件
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## API 接口

### 公开接口
- `GET /api/projects` - 获取作品列表
- `GET /api/projects/:slug` - 获取作品详情
- `GET /api/categories` - 获取分类列表
- `GET /api/skills` - 获取技能列表
- `GET /api/about` - 获取关于信息
- `POST /api/contact` - 提交联系表单

### 需要认证的接口
- `POST /api/auth/login` - 登录
- `GET /api/projects/all` - 获取所有作品（包括草稿）
- `POST /api/projects` - 创建作品
- `PUT /api/projects/:id` - 更新作品
- `DELETE /api/projects/:id` - 删除作品
- `POST /api/categories` - 创建分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类
- `POST /api/skills` - 创建技能
- `PUT /api/skills/:id` - 更新技能
- `DELETE /api/skills/:id` - 删除技能
- `PUT /api/about` - 更新关于信息
- `GET /api/contacts` - 获取联系消息
- `PUT /api/contacts/:id/read` - 标记已读
- `DELETE /api/contacts/:id` - 删除消息
- `POST /api/upload` - 上传图片

## 安全特性

- ✅ JWT 身份认证
- ✅ 联系表单防垃圾提交（关键词检测、频率限制）
- ✅ 密码加密存储（bcrypt）
- ✅ 文件上传类型和大小限制
- ✅ CORS 配置

## 部署

### 生产环境构建

```bash
# 后端
cd backend
go build -o portfolio-server
./portfolio-server

#前端
cd frontend
npm run build
```

### Nginx 配置示例见 `docs/nginx.conf`

## License

MIT
