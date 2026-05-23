# 🎫 在线投票与抽奖系统

一个基于 **Golang (Fiber) + React + MySQL + Redis** 的高并发在线投票与抽奖系统，支持实时计票、WebSocket 推送、防刷票限流等核心能力。

## ✨ 核心功能

- 📝 **活动管理**：创建投票（单选/多选）、抽奖活动，配置起止时间
- 🗳️ **实时投票**：Redis 原子操作计数，WebSocket 秒级推送
- 🎯 **抽奖中心**：按概率抽奖，每人每日限抽 3 次
- 📊 **结果大屏**：炫酷深色大屏，自动刷新
- 🛡️ **防刷票**：IP/User 限流、图形验证码、登录/游客均可参与
- 🔐 **后台配置**：管理员可创建、编辑、删除活动

## 🏗️ 技术栈

| 模块 | 技术 |
|------|------|
| 后端 | Golang 1.21+ · Fiber v2 · GORM · Redis |
| 前端 | React 18 · Vite · React Router |
| 数据库 | MySQL 5.7+ / 8.x |
| 缓存/限流 | Redis 6+ |
| 实时通信 | WebSocket |

## 📁 项目结构

```
OnlineVoting/
├── backend/                 # 后端 Go 服务
│   ├── cmd/server/          # 启动入口
│   ├── config/              # 配置
│   ├── internal/
│   │   ├── database/        # 数据库初始化 + 种子数据
│   │   ├── redis/           # Redis 客户端
│   │   ├── hub/             # WebSocket 广播中心
│   │   ├── middleware/      # JWT / 限流中间件
│   │   ├── handler/         # 业务处理器
│   │   ├── model/           # 数据模型
│   │   ├── response/        # 统一响应
│   │   └── route/           # 路由注册
│   └── go.mod
├── frontend/                # 前端 React 项目
│   ├── src/
│   │   ├── api/             # API 封装
│   │   ├── pages/           # 页面组件
│   │   └── styles/          # 全局样式
│   └── package.json
└── schema.sql               # 数据库初始化脚本
```

## 🚀 快速开始

### 1. 准备环境

- MySQL 5.7+ / 8.x（已运行在 `127.0.0.1:3306`，密码 `123456`）
- Redis 6+（默认 `127.0.0.1:6379`，无密码）
- Go 1.21+
- Node.js 18+

### 2. 初始化数据库

```powershell
# PowerShell 方式（项目已自动执行）
& "C:\phpstudy_pro\Extensions\MySQL5.7.26\bin\mysql.exe" `
  --host=127.0.0.1 --port=3306 --user=root --password=123456 `
  -e "source D:/Workspace/myproject/OnlineVoting/schema.sql"

# 或手动导入 schema.sql
```

> 首次启动后端也会通过 GORM AutoMigrate 自动建表，并通过 `Seed()` 写入示例数据。

### 3. 启动后端

```powershell
cd backend
go mod tidy
go run ./cmd/server
```

后端默认监听 `http://127.0.0.1:8080`

### 4. 启动前端

```powershell
cd frontend
npm install
npm run dev
```

前端默认监听 `http://localhost:3000`，已配置代理 `/api` → `http://127.0.0.1:8080`

### 5. 默认账号

| 账号 | 密码 | 角色 |
|------|------|------|
| admin | 123456 | 管理员（可进入后台） |
| user1 | 123456 | 普通用户 |

## 🧩 核心页面

| 路由 | 说明 |
|------|------|
| `/` | 活动列表页（筛选投票/抽奖） |
| `/vote/:id` | 投票页（单选/多选 + 验证码） |
| `/result/:id` | 实时结果页（每 3s 轮询 + WebSocket） |
| `/dashboard/:id` | 结果大屏（深色炫酷主题，每秒刷新） |
| `/lottery/:id` | 抽奖页（动画 + 中奖记录） |
| `/admin` | 后台配置页（创建/编辑/删除活动） |
| `/login` | 登录页（图形验证码） |

## 🔌 核心 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/captcha` | 获取图形验证码 |
| POST | `/api/login` | 登录 |
| GET | `/api/activities` | 活动列表 |
| GET | `/api/activities/:id` | 活动详情 |
| GET | `/api/activities/:id/result` | 投票结果 |
| POST | `/api/vote` | 提交投票 |
| POST | `/api/lottery/:id` | 抽奖 |
| POST | `/api/admin/activities` | 创建活动（管理员） |
| PUT | `/api/admin/activities/:id` | 更新活动 |
| DELETE | `/api/admin/activities/:id` | 删除活动 |
| WS | `/ws?channel=vote:<id>` | 实时投票推送 |

## 🛡️ 防刷票策略

1. **图形验证码**：登录 / 投票均需验证
2. **IP 限流**：Redis `INCR` + EXPIRE，每分钟最多 10 次投票
3. **用户/IP 重复限制**：同一用户或 IP 每个活动只能投 1 次
4. **抽奖日限**：每人每天最多 3 次抽奖
5. **登录鉴权**：JWT + Cookie 双写，Cookie 支持 CSRF 场景

## ⚡ 高并发计票

- **Redis 原子自增**：`HINCRBY vote:<activityID> <optionID> 1`
- **DB 异步同步**：每 5 分钟通过定时任务将 Redis 中的票数同步回 MySQL
- **WebSocket 推送**：每次投票后立即广播到订阅该活动的客户端

## 📸 预览

启动后访问 [http://localhost:3000](http://localhost:3000) 体验：
- 活动列表 → 选择投票活动 → 提交投票 → 查看结果大屏
- 或进入抽奖页体验转盘式抽奖动画

## 📝 License

MIT
