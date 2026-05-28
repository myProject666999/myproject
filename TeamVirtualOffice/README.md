# 团队虚拟办公室在线协同系统

## 项目概述

团队虚拟办公室是一个空间化的在线协同平台，帮助远程团队营造"在一起办公"的氛围。通过虚拟工位与房间展示团队成员的实时在线状态，支持一键发起语音/视频协作。

## 技术栈

### 后端
- **语言**: Go 1.21+
- **Web框架**: Gin
- **WebSocket**: gorilla/websocket
- **ORM**: GORM
- **数据库**: MySQL 8.0+
- **缓存/状态存储**: Redis 7.0+
- **认证**: JWT

### 前端
- **框架**: Vue 3 + Composition API
- **构建工具**: Vite
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP客户端**: Axios

## 核心功能

1. **虚拟工位与房间**
   - 多种房间类型：开放办公区、会议室、休闲区、私人房间
   - 可视化工位布局，支持抢占/释放工位

2. **实时在线状态**
   - 在线/忙碌/离开/离线状态展示
   - 心跳机制维护在线状态
   - 超时自动下线
   - 状态变更广播通知

3. **一键呼叫/进房**
   - 语音/视频呼叫
   - 屏幕共享
   - 勿扰模式拦截呼叫

4. **文字状态**
   - 自定义状态文字
   - 快捷状态选择

5. **专注勿扰**
   - 勿扰模式开关
   - 拦截所有 incoming call

6. **活动动态**
   - 团队活动时间线
   - 上线/下线/进房/状态变更记录

## 项目结构

```
TeamVirtualOffice/
├── server/                    # 后端Go项目
│   ├── main.go               # 入口文件
│   ├── go.mod
│   ├── config/               # 配置
│   │   ├── config.go
│   │   └── config.yaml
│   ├── model/                # 数据模型
│   │   ├── user.go
│   │   ├── room.go
│   │   ├── message.go
│   │   └── response.go
│   ├── cache/                # Redis缓存
│   │   └── status.go
│   ├── handler/              # API处理器
│   │   ├── user.go
│   │   ├── room.go
│   │   ├── status.go
│   │   ├── call.go
│   │   ├── message.go
│   │   ├── activity.go
│   │   └── middleware.go
│   ├── router/               # 路由
│   │   └── router.go
│   └── ws/                   # WebSocket
│       └── hub.go
├── web/                       # 前端Vue项目
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.js
│       ├── App.vue
│       ├── router/           # 路由
│       ├── stores/           # Pinia状态
│       ├── utils/            # 工具函数
│       └── views/            # 页面组件
└── sql/                       # 数据库脚本
    ├── init.sql
    └── init_en.sql
```

## 快速开始

### 环境要求

- Go 1.21+
- Node.js 18+
- MySQL 8.0+
- Redis 7.0+

### 1. 数据库初始化

```bash
# MySQL数据库已提前初始化
# 数据库: team_virtual_office
# 测试用户: user1/user2/user3/user4
# 默认密码: 123456
```

### 2. 启动后端服务

```bash
cd server
go mod tidy
go run main.go
# 服务运行在 http://localhost:8080
```

### 3. 启动前端服务

```bash
cd web
npm install
npm run dev
# 服务运行在 http://localhost:5173
```

## API 接口文档

### 认证相关

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/user/login | 用户登录 | - |
| POST | /api/user/register | 用户注册 | - |
| GET | /api/user/info | 获取当前用户信息 | ✔️ |
| GET | /api/user/list | 获取用户列表 | ✔️ |

### 房间相关

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /api/room/list | 获取房间列表 | ✔️ |
| POST | /api/room/create | 创建房间 | ✔️ |
| POST | /api/room/join/:id | 加入房间 | ✔️ |
| POST | /api/room/leave/:id | 离开房间 | ✔️ |
| GET | /api/room/:id | 获取房间详情 | ✔️ |
| GET | /api/room/:id/seats | 获取房间工位 | ✔️ |

### 工位相关

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/seat/occupy/:id | 占用工位 | ✔️ |
| POST | /api/seat/leave/:id | 离开工位 | ✔️ |

### 状态相关

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/status/update | 更新状态 | ✔️ |
| POST | /api/status/busy | 设置勿扰模式 | ✔️ |
| GET | /api/status/:id | 获取用户状态 | ✔️ |
| POST | /api/status/heartbeat | 心跳 | ✔️ |

### 呼叫相关

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/call/start | 发起呼叫 | ✔️ |
| POST | /api/call/answer/:id | 接听呼叫 | ✔️ |
| POST | /api/call/reject/:id | 拒绝呼叫 | ✔️ |
| POST | /api/call/hangup/:id | 挂断呼叫 | ✔️ |

### 消息相关

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/message/room | 发送房间消息 | ✔️ |
| POST | /api/message/private | 发送私聊消息 | ✔️ |
| GET | /api/message/room/:id | 获取房间消息 | ✔️ |
| GET | /api/message/private/:user_id | 获取私聊消息 | ✔️ |

### 动态相关

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /api/activity/list | 获取活动动态 | ✔️ |

## WebSocket 协议

### 连接

```
ws://localhost:8080/ws?token={JWT_TOKEN}
```

### 消息类型

#### 接收消息

| 类型 | 说明 |
|------|------|
| status_update | 用户状态更新 |
| user_joined | 用户加入房间 |
| user_left | 用户离开房间 |
| room_message | 房间消息 |
| private_message | 私聊消息 |
| call_incoming | 收到呼叫 |
| call_answered | 呼叫被接听 |
| call_rejected | 呼叫被拒绝 |
| call_ended | 通话结束 |

### 心跳

客户端需每30秒发送心跳消息：
```json
{"type": "ping"}
```

服务器响应：
```json
{"type": "pong"}
```

## 数据库设计

### 核心表

- **users** - 用户表
- **user_status** - 用户在线状态表
- **rooms** - 房间表
- **seats** - 工位表
- **room_members** - 房间成员表
- **messages** - 消息表
- **call_records** - 呼叫记录表
- **activities** - 活动动态表

## Redis 设计

### Key 模式

| Key | 类型 | 说明 |
|-----|------|------|
| online_users | SET | 在线用户ID集合 |
| user:status:{userId} | HASH | 用户状态哈希 |
| room:members:{roomId} | SET | 房间成员集合 |
| status:dedup:{userId} | STRING | 状态去重缓存(5s TTL) |

## 测试账号

| 用户名 | 密码 | 昵称 |
|--------|------|------|
| user1 | 123456 | Zhang San |
| user2 | 123456 | Li Si |
| user3 | 123456 | Wang Wu |
| user4 | 123456 | Zhao Liu |

## 注意事项

1. **在线状态**：使用心跳维护，超时120秒自动下线
2. **状态广播**：使用Redis进行去重，避免频繁广播
3. **勿扰模式**：开启后自动拦截所有呼叫
4. **房间权限**：支持公开/私有房间，私有房间需密码
5. **断线重连**：WebSocket支持自动重连并恢复状态
