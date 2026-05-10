# 有约剧本杀管理系统

基于 **Golang (Gin) + React (Ant Design) 的剧本杀门店管理系统

## 技术栈

**后端：
- Go 1.21+
- Gin Web 框架
- GORM ORM
- MySQL 数据库
- JWT 认证
- bcrypt 密码加密

**前端:**
- React 18
- Vite
- Ant Design 5
- React Router 6
- Axios HTTP 客户端
- Day.js 日期处理
- Axios

## 项目结构

```
ContractScriptManagement/
├── backend/           # Go 后端
│   ├── config/        # 配置文件
│   ├── controllers/   # 控制器
│   ├── middleware/  # 中间件
│   ├── models/      # 数据模型
│   ├── routes/      # 路由定义
│   ├── utils/       # 工具函数
│   ├── main.go      # 入口文件
│   └── go.mod       # Go 依赖
├── frontend/          # React 前端
│   ├── src/
│   │   ├── components/  # 通用组件
│   │   ├── contexts/    # React Context
│   │   ├── pages/       # 页面组件
│   │   ├── services/    # API 服务
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 功能特性

### 用户端功能：
- 用户注册/登录/退出
- 首页（轮播图、热门剧本、最新资讯
- 剧本列表、详情、预约下单
- 剧本讨论区（发帖、浏览）
- 资讯列表、详情
- 个人中心（信息修改、我的订单、我的发布）

### 管理员功能：
- 用户管理（增删改查
- 剧本管理（增删改查、图片上传、发布
- 剧本类型管理（增删改查
- 订单管理（查看、审核、删除
- 房间管理（增删改查
- 讨论管理（查看、编辑、删除
- 资讯管理（增删改查
- 轮播图管理（增删改查

## 快速开始

### 1. 环境准备

确保已安装：
- Go 1.21+
- Node.js 18+
- MySQL 5.7+

### 2. 数据库准备

```sql
CREATE DATABASE script_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 后端启动

```bash
cd backend

# 复制配置
cp .env.example .env
# 编辑 .env 修改数据库配置

# 安装依赖
go mod tidy

# 运行
go run main.go
```

后端服务启动在 http://localhost:8080

### 4. 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 开发模式
npm run dev
```

前端服务启动在 http://localhost:3000

## 默认账号

- 管理员账号：admin / admin123

## API 接口

### 认证接口：
- POST /api/auth/register - 注册
- POST /api/auth/login - 登录
- GET  /api/auth/me - 获取当前用户
- PUT  /api/auth/profile - 更新个人信息

### 公共接口：
- GET /api/carousels - 轮播图列表
- GET /api/scripts/types - 剧本类型
- GET /api/scripts - 剧本列表
- GET /api/scripts/hot - 热门剧本
- GET /api/scripts/:id - 剧本详情
- GET /api/rooms - 房间列表
- GET /api/news - 资讯列表
- GET /api/news/:id - 资讯详情
- GET /api/discussions - 讨论列表
- GET /api/discussions/:id - 讨论详情

### 用户接口（需要登录）：
- GET  /api/orders - 我的订单
- POST /api/orders - 创建订单
- GET  /api/orders/:id - 订单详情
- GET  /api/my/discussions - 我的发布
- POST /api/discussions - 发布讨论

### 管理员接口（需要管理员权限）：
- /api/admin/users - 用户管理
- /api/admin/types - 剧本类型管理
- /api/admin/scripts - 剧本管理
- /api/admin/rooms - 房间管理
- /api/admin/orders - 订单管理
- /api/admin/discussions - 讨论管理
- /api/admin/news - 资讯管理
- /api/admin/carousels - 轮播图管理

## 开发说明

### 订单状态码：

- 0: 待审核
- 1: 已通过
- 2: 已拒绝

### 状态码：

- 0: 禁用/未发布
- 1: 启用/已发布
