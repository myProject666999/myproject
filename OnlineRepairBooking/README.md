# 在线维修预约平台

一个基于 Golang(Echo) + Vue3 的家电/家政维修预约平台。

## 项目架构

```
OnlineRepairBooking/
├── backend/                    # 后端服务 (Golang + Echo)
│   ├── config/                # 配置管理
│   ├── internal/
│   │   ├── handlers/          # API 处理器
│   │   ├── middleware/        # 中间件 (JWT认证, 角色检查)
│   │   ├── models/            # 数据模型
│   │   ├── routes/            # 路由定义
│   │   └── services/          # 业务服务 (状态机, 派单逻辑)
│   ├── pkg/
│   │   ├── database/          # 数据库连接 (MySQL, Redis)
│   │   ├── response/          # 统一响应格式
│   │   └── utils/             # 工具函数 (JWT, 密码哈希)
│   ├── main.go                # 应用入口
│   └── .env                   # 环境变量
├── frontend/                   # 前端应用 (Vue3 + Vant)
│   ├── src/
│   │   ├── api/               # API 接口封装
│   │   ├── components/        # 公共组件
│   │   ├── router/            # 路由配置
│   │   ├── stores/            # 状态管理 (Pinia)
│   │   ├── utils/             # 工具函数
│   │   └── views/             # 页面组件
│   ├── main.js                # 应用入口
│   └── vite.config.js         # Vite 配置
└── database/
    └── schema.sql             # 数据库脚本
```

## 技术栈

### 后端
- **框架**: Echo v4
- **语言**: Go 1.21+
- **数据库**: MySQL 8.0+
- **缓存**: Redis 6.0+
- **认证**: JWT
- **密码**: bcrypt

### 前端
- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite 5
- **UI 组件**: Vant 4
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP 客户端**: Axios

## 核心功能

### 服务端 API
| 模块 | 功能 |
|------|------|
| **用户认证** | 注册、登录、JWT认证、个人信息管理 |
| **服务管理** | 服务分类、服务列表、服务详情、时段查询 |
| **师傅管理** | 师傅列表、师傅详情、师傅评价、师傅注册 |
| **订单管理** | 创建订单、订单列表、订单详情、取消订单 |
| **抢单/派单** | 师傅抢单、系统自动派单 |
| **订单状态机** | 待接单→已接单→服务中→待评价→已完成/已取消 |
| **评价系统** | 用户评价、师傅回复、评分统计 |
| **支付模拟** | 创建支付、模拟支付成功 |
| **地址管理** | 地址CRUD、默认地址设置 |

### 前端页面
| 页面 | 路径 | 功能 |
|------|------|------|
| 首页 | `/` | 分类展示、推荐服务、优秀师傅 |
| 服务列表 | `/services` | 分类筛选、服务搜索、服务列表 |
| 服务详情/下单 | `/service/:id` | 服务信息、选择师傅、选择地址、选择时间、提交订单 |
| 订单列表 | `/orders` | 订单状态筛选、订单列表 |
| 订单详情 | `/order/:id` | 订单状态时间轴、服务信息、操作按钮 |
| 评价页 | `/review/:orderId` | 星级评分、评价内容、图片上传 |
| 师傅工作台 | `/worker/dashboard` | 数据统计、快捷操作 |
| 师傅订单 | `/worker/orders` | 待抢单列表、我的订单、接单/开始/完成 |
| 师傅详情 | `/worker/:id` | 师傅信息、评价列表、快速预约 |
| 师傅注册 | `/worker/register` | 师傅入驻申请 |
| 个人中心 | `/profile` | 用户信息、功能菜单、退出登录 |
| 地址管理 | `/address` | 地址列表、新增、编辑、删除 |
| 登录 | `/login` | 用户登录 |
| 注册 | `/register` | 用户注册 |

## 数据库设计

### 核心数据表
- `users` - 用户表（普通用户、师傅、管理员）
- `addresses` - 用户地址表
- `service_categories` - 服务分类表（两级分类）
- `services` - 服务项目表
- `workers` - 师傅信息表
- `worker_skills` - 师傅技能关联表
- `orders` - 订单表
- `order_status_logs` - 订单状态历史表
- `order_bids` - 订单抢单表
- `reviews` - 评价表
- `payments` - 支付记录表
- `time_slots` - 时段配置表

### 订单状态机
```
0 - 待接单 (PENDING)
    ↓
1 - 已接单 (ACCEPTED)
    ↓
2 - 服务中 (IN_SERVICE)
    ↓
3 - 待评价 (TO_REVIEW)
    ↓
4 - 已完成 (COMPLETED)

任意状态 → 5 - 已取消 (CANCELLED)
```

## 快速开始

### 环境要求
- Go 1.21+
- Node.js 18+
- MySQL 8.0+
- Redis 6.0+

### 数据库配置

修改 `backend/.env` 文件：

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=online_repair_booking

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

### 数据库初始化

后端服务启动时会自动：
1. 创建数据库（如果不存在）
2. 执行 `database/schema.sql` 初始化表结构
3. 插入初始测试数据

### 启动后端服务

```bash
cd backend
go run main.go
```

服务将在 `http://127.0.0.1:8080` 启动

### 启动前端服务

```bash
cd frontend
npm install
npm run dev
```

前端将在 `http://127.0.0.1:5173` 启动

## 测试账号

| 角色 | 手机号 | 密码 |
|------|--------|------|
| 管理员 | 13800000000 | 123456 |
| 普通用户 | 13800000001 | 123456 |
| 普通用户 | 13800000002 | 123456 |
| 师傅 | 13900000001 | 123456 |
| 师傅 | 13900000002 | 123456 |
| 师傅 | 13900000003 | 123456 |

## API 文档

### 用户认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/user/profile` - 获取用户信息
- `PUT /api/user/profile` - 更新用户信息

### 服务
- `GET /api/services/categories` - 获取服务分类
- `GET /api/services` - 获取服务列表
- `GET /api/services/:id` - 获取服务详情
- `GET /api/services/time-slots` - 获取可预约时段

### 师傅
- `GET /api/workers` - 获取师傅列表
- `GET /api/workers/:id` - 获取师傅详情
- `GET /api/workers/:id/reviews` - 获取师傅评价
- `POST /api/workers/register` - 师傅注册

### 订单
- `POST /api/orders` - 创建订单
- `GET /api/orders` - 获取用户订单列表
- `GET /api/orders/:id` - 获取订单详情
- `POST /api/orders/:id/cancel` - 取消订单
- `GET /api/worker/orders` - 获取师傅订单
- `GET /api/worker/orders/pending` - 获取待抢单列表
- `POST /api/worker/orders/:id/accept` - 师傅接单
- `POST /api/worker/orders/:id/start` - 开始服务
- `POST /api/worker/orders/:id/complete` - 完成服务
- `POST /api/worker/orders/:id/grab` - 抢单

### 评价
- `POST /api/reviews` - 创建评价
- `GET /api/reviews` - 获取评价列表
- `GET /api/reviews/my` - 获取我的评价
- `POST /api/reviews/:id/reply` - 师傅回复评价

### 支付
- `POST /api/payments` - 创建支付
- `POST /api/payments/process` - 处理支付
- `GET /api/payments/:id` - 获取支付状态

### 地址
- `POST /api/user/addresses` - 创建地址
- `GET /api/user/addresses` - 获取地址列表
- `PUT /api/user/addresses/:id` - 更新地址
- `DELETE /api/user/addresses/:id` - 删除地址
- `POST /api/user/addresses/:id/default` - 设置默认地址

## 项目特点

1. **订单状态机**：严格的状态流转控制，使用 Redis 缓存订单状态，提高查询性能
2. **分布式锁**：使用 Redis SetNX 防止订单并发操作
3. **派单/抢单**：支持抢单模式和系统自动派单两种模式
4. **地址快照**：创建订单时保存地址快照，防止后续地址修改影响历史订单
5. **事务保证**：所有写操作使用数据库事务，确保数据一致性
6. **事件驱动**：订单状态变更通过 Redis 发布订阅，便于扩展通知功能
7. **响应式设计**：前端使用 Vant UI，适配移动端
8. **代码复用**：组件化设计，公共逻辑抽离为工具函数和组件

## 注意事项

1. 本项目包含支付模拟，生产环境需要接入真实的支付网关（微信支付、支付宝等）
2. 图片上传使用模拟实现，生产环境需要对接对象存储（OSS、COS等）
3. 消息通知（短信、APP推送）需要对接相应的服务商
4. 地理位置服务（LBS）可扩展实现师傅按距离排序
