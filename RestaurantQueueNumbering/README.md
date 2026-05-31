# 餐厅排队叫号与等位预约系统

## 项目简介

热门餐厅排队混乱，顾客干等体验差，需要线上取号、实时叫号、预估等待并可提前预约的完整解决方案。

## 技术栈

- **后端**: Golang + Gin + WebSocket + GORM
- **数据库**: MySQL 5.7+
- **缓存队列**: Redis 5.0+
- **前端**: Vue 3 + Vite + Vant UI + Pinia + Vue Router

## 核心功能

### 1. 线上取号与桌型选择
- 支持多种桌型（小桌/中桌/大桌/包厢）
- 根据人数智能推荐桌型
- 取号频控，防止恶意刷号

### 2. 实时队列与叫号
- Redis 原子操作维护队列
- WebSocket 实时推送位次变化
- 叫号通知实时触达用户

### 3. 等待预估
- 基于桌型平均用餐时间计算
- 实时更新预估等待时间

### 4. 过号处理
- 过号自动延后3位重排
- 最多支持3次过号机会

### 5. 远程预约
- 支持提前7天预约
- 时间段可配置（默认30分钟间隔）
- 预约号与现场号协调排队

### 6. 到店核验
- 6位核验码验证
- 支持提前30分钟核验
- 核验成功自动入队

## 关键页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 餐厅列表 | `/` | 展示所有餐厅，支持取号/预约入口 |
| 取号页 | `/queue/:restaurantId` | 选择桌型、人数，取号 |
| 我的排队 | `/my-queue` | 实时查看位次、取消排队 |
| 预约页 | `/reservation/:restaurantId` | 选择日期时段预约 |
| 我的预约 | `/my-reservation` | 预约管理、核验入口 |
| 商家叫号台 | `/merchant/:restaurantId` | 叫号、过号、入座管理 |
| 核验页 | `/verify` | 预约核验取号 |
| 登录页 | `/login` | 手机号快捷登录 |

## 项目结构

```
RestaurantQueueNumbering/
├── backend/                    # 后端Go项目
│   ├── config/                # 配置模块
│   ├── database/              # 数据库连接
│   ├── handlers/              # API处理器
│   ├── models/                # 数据模型
│   ├── router/                # 路由配置
│   ├── services/              # 业务逻辑
│   ├── websocket/             # WebSocket服务
│   ├── .env                   # 环境变量
│   ├── go.mod                 # Go依赖
│   └── main.go                # 主程序入口
├── frontend/                  # 前端Vue3项目
│   ├── src/
│   │   ├── api/               # API接口
│   │   ├── assets/            # 静态资源
│   │   ├── router/            # 路由
│   │   ├── stores/            # Pinia状态
│   │   ├── utils/             # 工具函数
│   │   ├── views/             # 页面组件
│   │   ├── App.vue            # 根组件
│   │   └── main.js            # 入口文件
│   ├── index.html             # HTML模板
│   ├── package.json           # npm依赖
│   └── vite.config.js         # Vite配置
├── sql/                       # 数据库脚本
│   └── schema.sql            # 建表与初始化数据
├── start-backend.bat          # 后端启动脚本
├── start-frontend.bat         # 前端启动脚本
└── start-all.bat              # 一键启动脚本
```

## 数据库设计

### 核心数据表

1. **users** - 用户表
2. **restaurants** - 餐厅表
3. **table_types** - 桌型表
4. **queue_settings** - 排队配置表
5. **queues** - 排队记录表
6. **reservations** - 预约记录表
7. **verify_records** - 核验记录表

### Redis键设计

| 键模式 | 类型 | 说明 |
|--------|------|------|
| `queue:{restaurantId}:{prefix}` | List | 等待队列 |
| `queue_meta:{restaurantId}:{prefix}` | Hash | 队列元数据（当前号数） |
| `queue_called:{restaurantId}` | List | 最近叫号记录 |
| `queue_info:{queueId}` | Hash | 排队详情缓存 |
| `user_queue:{userId}` | ZSet | 用户排队记录 |
| `rate_limit:{restaurantId}:{phone}` | String | 取号频控 |

## 快速开始

### 环境要求

- Go 1.21+
- Node.js 16+
- MySQL 5.7+
- Redis 5.0+

### 1. 数据库初始化

数据库脚本已自动导入到本地数据库（127.0.0.1:3306，密码123456）

如需手动导入：
```bash
mysql -h 127.0.0.1 -P 3306 -u root -p123456 --default-character-set=utf8mb4 < sql/schema.sql
```

### 2. 启动Redis

确保Redis服务已启动在 `127.0.0.1:6379`

### 3. 一键启动

双击 `start-all.bat` 或分别执行：

**启动后端**:
```bash
start-backend.bat
```

**启动前端**:
```bash
start-frontend.bat
```

### 4. 访问系统

- **前端地址**: http://127.0.0.1:5173
- **后端API**: http://127.0.0.1:8080/api
- **WebSocket**: ws://127.0.0.1:8080/ws

## 测试账号

### 顾客账号
- 张三: `13800138001`
- 李四: `13800138002`
- 王五: `13800138003`

### 商家账号
- 川味轩叫号台: `13900139001`
- 粤港茶餐厅叫号台: `13900139002`

## API接口文档

### 用户相关
- `POST /api/user/login` - 登录/注册
- `GET /api/user/:id` - 获取用户信息

### 餐厅相关
- `GET /api/restaurant` - 获取餐厅列表
- `GET /api/restaurant/:id` - 获取餐厅详情
- `GET /api/restaurant/:restaurant_id/table-types` - 获取桌型列表

### 排队相关
- `POST /api/queue` - 取号
- `GET /api/queue/:id` - 获取排队详情
- `GET /api/queue/user/:user_id` - 获取用户排队记录
- `POST /api/queue/:id/cancel` - 取消排队
- `POST /api/queue/call` - 叫号
- `GET /api/queue/called/:restaurant_id` - 获取叫号记录
- `GET /api/queue/waiting/:restaurant_id/:prefix` - 获取等待队列
- `POST /api/queue/over` - 标记过号
- `POST /api/queue/seated` - 标记入座
- `POST /api/queue/completed` - 标记完成

### 预约相关
- `POST /api/reservation` - 创建预约
- `GET /api/reservation/user/:user_id` - 获取用户预约
- `POST /api/reservation/:id/cancel` - 取消预约
- `GET /api/reservation/timeslots/:restaurant_id/:table_type_id` - 获取可预约时段
- `POST /api/reservation/verify` - 核验预约

## 核心技术点

### 1. 队列入队/叫号原子操作
- 使用Redis事务（TxPipeline）保证原子性
- 分布式锁防止并发问题

### 2. 位次实时推送
- WebSocket长连接实时推送
- 叫号时同时通知餐厅端和用户端

### 3. 过号规则与重排
- 过号自动延后3位插入队列
- 超过3次过号取消排队资格

### 4. 预约与现场号源协调
- 预约核验后进入同一排队队列
- 预约号享有优先排队权（可配置）

### 5. 防恶意刷号频控
- 基于手机号+餐厅的频控
- 默认60秒内最多取1个号

## 配置说明

### 后端配置（backend/.env）

```env
# 服务配置
SERVER_HOST=0.0.0.0
SERVER_PORT=8080

# MySQL配置
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=123456
MYSQL_DATABASE=restaurant_queue
MYSQL_CHARSET=utf8mb4

# Redis配置
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# WebSocket配置
WS_READ_BUFFER_SIZE=1024
WS_WRITE_BUFFER_SIZE=1024
WS_CHECK_ORIGIN=true
```

### 排队配置（数据库 queue_settings 表）

| 字段 | 说明 | 默认值 |
|------|------|--------|
| max_queue_length | 最大排队长度 | 50 |
| over_number_limit | 过号最多可延后位数 | 3 |
| max_advance_days | 最远可预约天数 | 7 |
| reserve_time_gap | 预约时间段间隔(分钟) | 30 |
| rate_limit_seconds | 取号频控时间(秒) | 60 |
| rate_limit_count | 频控时间内最大取号次数 | 1 |

## 注意事项

1. 确保MySQL和Redis服务已启动
2. 首次运行会自动创建数据库和表
3. 测试数据包含2家餐厅和4种桌型
4. 前端开发模式下已配置代理，无需跨域处理
5. 生产环境建议配置Nginx反向代理

## 常见问题

**Q: 启动后端报错：dial tcp 127.0.0.1:6379: connect: connection refused**
A: 请确保Redis服务已启动

**Q: 前端页面空白**
A: 检查后端服务是否正常启动，或查看浏览器控制台错误信息

**Q: 取号提示"取号太频繁"**
A: 这是频控机制，等待60秒后再试，或修改数据库配置
