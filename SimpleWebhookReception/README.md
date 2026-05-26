# Simple Webhook Reception

简易 Webhook 接收服务，支持接收 GitHub/GitLab/自定义 Webhook，提供请求查看、转发规则、重发等功能。

## 技术栈

- **后端**: Go + Gin + GORM + SQLite
- **前端**: Vue 3 + Element Plus + Axios

## 项目结构

```
SimpleWebhookReception/
├── server/                 # Go 后端
│   ├── main.go            # 入口文件
│   ├── config/            # 配置
│   ├── models/            # 数据模型
│   ├── handlers/          # 请求处理
│   ├── middleware/        # 中间件
│   ├── routes/            # 路由
│   └── database/          # 数据库
└── web/                   # Vue 前端
    ├── src/
    │   ├── views/         # 页面组件
    │   ├── api/           # API 调用
    │   └── router/        # 路由
    └── vite.config.js     # Vite 配置
```

## 核心功能

1. **Endpoint 生成**: 自动生成唯一的 Webhook 接收地址
2. **请求查看**: 查看所有接收到的 Webhook 请求详情
3. **转发规则**: 配置请求转发到其他服务
4. **重发功能**: 支持重新转发已接收的请求
5. **保留期**: 可配置请求数据的保留天数

## 快速开始

### 后端启动

```bash
cd server
go mod tidy
go run main.go
```

服务默认运行在 `http://localhost:8080`

### 前端启动

```bash
cd web
npm install
npm run dev
```

前端默认运行在 `http://localhost:3000`

## API 接口

### Endpoint 管理

- `POST /api/endpoints` - 创建 Endpoint
- `GET /api/endpoints` - 获取 Endpoint 列表
- `GET /api/endpoints/:id` - 获取 Endpoint 详情
- `PUT /api/endpoints/:id` - 更新 Endpoint
- `DELETE /api/endpoints/:id` - 删除 Endpoint

### Webhook 接收

- `ANY /webhook/:token/*path` - 接收 Webhook 请求

### 请求管理

- `GET /api/requests` - 获取请求列表
- `GET /api/requests/:id` - 获取请求详情
- `POST /api/requests/:id/resend` - 重新转发请求
- `DELETE /api/requests/:id` - 删除请求

### 转发规则

- `POST /api/endpoints/:id/rules` - 创建转发规则
- `GET /api/endpoints/:id/rules` - 获取转发规则列表
- `PUT /api/rules/:id` - 更新转发规则
- `DELETE /api/rules/:id` - 删除转发规则

## 安全机制

- **Endpoint 隔离**: 每个 Endpoint 通过唯一 Token 隔离
- **请求限速**: 每个 Endpoint 每分钟最多 60 个请求
- **数据保留**: 根据配置的保留期自动清理过期请求
