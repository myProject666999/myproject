# 在线弹幕互动系统

一个基于 Golang + React + MySQL + Redis 构建的实时弹幕互动平台，适用于线下活动、会议、演出等场景。

## 功能特性

- 📝 **弹幕发送** - 观众实时发送弹幕消息
- 🔍 **敏感词过滤** - 自动检测并过滤敏感内容
- ✅ **消息审核** - 管理员后台审核待发布消息
- 📺 **大屏展示** - 弹幕滚动展示效果
- ❤️ **点赞互动** - 观众对喜欢的弹幕点赞
- 🎰 **幸运抽奖** - 互动抽奖功能
- ⚡ **实时推送** - WebSocket + Redis 消息队列

## 技术栈

### 后端
- **Golang** - 主语言
- **Gin** - Web框架
- **Gorilla WebSocket** - WebSocket支持
- **GORM** - ORM框架
- **Redis** - 消息队列/广播
- **MySQL** - 数据库

### 前端
- **React 18** - UI框架
- **Ant Design** - UI组件库
- **Axios** - HTTP客户端
- **React Router** - 路由管理

## 项目结构

```
OnlineBarrageInteraction/
├── backend/                    # Golang后端
│   ├── config/                 # 配置文件
│   │   ├── config.yaml         # 主配置
│   │   ├── config.go           # 配置加载
│   │   └── redis.go            # Redis连接
│   ├── handlers/               # 请求处理器
│   │   ├── user.go             # 用户相关
│   │   ├── message.go          # 消息相关
│   │   ├── like.go             # 点赞相关
│   │   └── lottery.go          # 抽奖相关
│   ├── middleware/              # 中间件
│   │   ├── cors.go             # CORS
│   │   ├── limiter.go          # 限流
│   │   └── auth.go             # 认证
│   ├── models/                 # 数据模型
│   │   └── models.go           # 数据库模型定义
│   ├── utils/                  # 工具函数
│   │   └── sensitive.go        # 敏感词过滤
│   ├── websocket/              # WebSocket服务
│   │   ├── hub.go              # Hub管理
│   │   └── websocket.go        # WebSocket处理
│   ├── main.go                 # 入口文件
│   ├── go.mod                  # Go模块
│   └── go.sum                  # 依赖锁定
├── database/                   # 数据库脚本
│   └── init.sql                # 初始化SQL
└── frontend/                   # React前端
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── pages/              # 页面组件
    │   │   ├── SendPage.js     # 弹幕发送页
    │   │   ├── DisplayPage.js  # 大屏展示页
    │   │   ├── AdminPage.js    # 审核后台
    │   │   ├── LotteryPage.js  # 抽奖页
    │   │   ├── LoginPage.js    # 用户登录页
    │   │   └── AdminLoginPage.js # 管理员登录页
    │   ├── services/           # 服务
    │   │   ├── api.js          # API服务
    │   │   └── websocket.js    # WebSocket服务
    │   ├── index.js            # 入口文件
    │   └── index.css           # 样式
    └── package.json
```

## 快速开始

### 前置要求

- Go 1.21+
- Node.js 16+
- MySQL 8.0+
- Redis 6.0+

### 1. 数据库配置

确保MySQL服务正在运行，然后执行初始化脚本：

```bash
# 使用MySQL命令行
mysql -u root -p123456 < database/init.sql

# 或使用Go的自动迁移（后端启动时会自动创建表）
```

### 2. 启动后端

```bash
cd backend

# 下载依赖
go mod tidy

# 启动服务
go run main.go
```

后端将在 `http://localhost:8080` 启动

### 3. 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm start
```

前端将在 `http://localhost:3000` 启动

## 页面访问

| 页面 | URL | 说明 |
|------|-----|------|
| 用户登录 | http://localhost:3000/login | 观众登录入口 |
| 弹幕发送 | http://localhost:3000/send | 发送弹幕消息 |
| 大屏展示 | http://localhost:3000/display | 弹幕滚动展示 |
| 管理员登录 | http://localhost:3000/admin/login | 管理员登录 |
| 审核后台 | http://localhost:3000/admin | 消息审核管理 |
| 抽奖页面 | http://localhost:3000/lottery | 互动抽奖 |

## 默认账号

### 管理员
- 用户名: `admin`
- 密码: `admin123`

### 用户
- 首次登录时自动注册，只需输入昵称即可

## 配置说明

### 后端配置 (backend/config/config.yaml)

```yaml
server:
  port: 8080              # 服务端口

database:
  host: 127.0.0.1         # MySQL地址
  port: 3306              # MySQL端口
  username: root          # 用户名
  password: 123456        # 密码
  dbname: barrage_db      # 数据库名

redis:
  host: 127.0.0.1         # Redis地址
  port: 6379              # Redis端口
  password: ""            # Redis密码
  db: 0                   # Redis数据库
  channel: barrage_channel # 消息频道

limiter:
  max_requests: 10        # 最大请求数
  duration: 60            # 时间窗口(秒)
```

## API文档

### 用户接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/register | 用户注册 |
| POST | /api/login | 用户登录 |
| POST | /api/admin/login | 管理员登录 |
| GET | /api/users | 获取用户列表 |

### 消息接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/messages | 发送消息 |
| GET | /api/messages | 获取消息列表 |
| GET | /api/messages/pending | 获取待审核消息 |
| PUT | /api/messages/:id/approve | 审核通过 |
| PUT | /api/messages/:id/reject | 审核拒绝 |

### 点赞接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/likes/:message_id | 点赞 |
| DELETE | /api/likes/:message_id | 取消点赞 |

### 抽奖接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/lottery | 创建抽奖活动 |
| GET | /api/lottery | 获取抽奖列表 |
| GET | /api/lottery/:id | 获取抽奖详情 |
| POST | /api/lottery/:id/draw | 执行抽奖 |
| GET | /api/lottery/:id/winners | 获取中奖名单 |

## 消息状态

| 状态值 | 说明 |
|--------|------|
| 0 | 待审核 |
| 1 | 已通过 |
| 2 | 已拒绝/包含敏感词 |

## 注意事项

1. **实时推送**: 使用WebSocket + Redis发布订阅模式实现消息实时推送
2. **敏感词过滤**: 自动检测敏感词，敏感消息自动标记为拒绝状态
3. **限流机制**: 每个IP每分钟最多发送10条消息（可配置）
4. **审核延迟**: 非敏感消息需要管理员审核后才能上墙显示
5. **连接管理**: WebSocket支持自动重连，最多重试5次

## 许可证

MIT License
