# 同城速运配送平台

一个基于 Golang + Vue (H5) 的同城配送平台，支持用户下单、骑手抢单、实时位置跟踪等功能。

## 技术栈

### 后端
- **框架**: Golang + Gin
- **ORM**: GORM
- **数据库**: MySQL 8.0+
- **缓存**: Redis
- **实时通信**: WebSocket (gorilla/websocket)
- **认证**: JWT

### 前端
- **框架**: Vue 3 + Vite + TypeScript
- **移动端 UI**: Vant
- **管理后台 UI**: Element Plus
- **状态管理**: Pinia
- **地图**: 高德地图 / 百度地图

## 项目结构

```
SameCityExpressDeliveryPlatform/
├── backend/                    # Golang 后端
│   ├── cmd/
│   │   └── server/
│   │       └── main.go         # 主入口
│   ├── internal/
│   │   ├── handler/            # 控制器层
│   │   │   ├── user_handler.go
│   │   │   ├── rider_handler.go
│   │   │   ├── order_handler.go
│   │   │   ├── address_handler.go
│   │   │   ├── exception_handler.go
│   │   │   └── admin_handler.go
│   │   ├── service/            # 业务逻辑层
│   │   │   ├── user_service.go
│   │   │   ├── rider_service.go
│   │   │   ├── order_service.go
│   │   │   ├── address_service.go
│   │   │   └── exception_service.go
│   │   ├── model/              # 数据模型
│   │   │   └── model.go
│   │   └── middleware/         # 中间件
│   │       └── auth.go
│   ├── pkg/
│   │   └── utils/              # 工具函数
│   ├── config/                 # 配置
│   │   ├── config.yaml
│   │   └── database.go
│   ├── websocket/              # WebSocket 服务
│   │   └── ws.go
│   └── go.mod
│
├── frontend/
│   ├── user-h5/                # 用户端 H5
│   │   ├── src/
│   │   │   ├── views/          # 页面
│   │   │   ├── api/            # API 接口
│   │   │   ├── stores/         # 状态管理
│   │   │   └── router/         # 路由
│   │   └── package.json
│   │
│   ├── rider-h5/               # 骑手端 H5
│   │   └── ...
│   │
│   └── admin/                  # 运营管理后台
│       └── ...
│
└── docs/                       # 文档
    └── init.sql                # 数据库初始化脚本
```

## 功能模块

### 用户端
- 用户注册/登录
- 地址管理
- 下单（取件/送达地址、物品、要求）
- 自动计费（距离 + 重量 + 时段）
- 订单跟踪（实时位置）
- 签收码签收
- 异常工单申报
- 订单评价

### 骑手端
- 骑手注册/登录
- 接单大厅（抢单）
- 在线/离线切换
- 实时位置上传
- 取件/配送确认
- 异常工单查看

### 运营管理后台
- 数据统计仪表盘
- 订单管理
- 用户管理
- 骑手管理（审核、禁用/启用）
- 异常工单处理
- 计费规则配置

## 环境要求

### 后端
- Go 1.21+
- MySQL 8.0+
- Redis 6.0+

### 前端
- Node.js 18+
- npm 或 yarn

## 快速开始

### 1. 准备数据库

```sql
-- 创建数据库
CREATE DATABASE samecity_express DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 导入初始化脚本
mysql -u root -p samecity_express < docs/init.sql
```

### 2. 配置后端

编辑 `backend/config/config.yaml`:

```yaml
server:
  port: 8080

database:
  mysql:
    host: 127.0.0.1
    port: 3306
    username: root
    password: your_password
    database: samecity_express

redis:
  host: 127.0.0.1
  port: 6379

map:
  provider: "amap"  # amap | baidu
  amap_key: "your_amap_api_key"
  baidu_key: "your_baidu_api_key"
```

### 3. 启动后端

```bash
cd backend

# 下载依赖
go mod download

# 启动服务
go run cmd/server/main.go
```

服务将在 http://localhost:8080 启动

### 4. 启动用户端 H5

```bash
cd frontend/user-h5

# 安装依赖
npm install

# 开发模式
npm run dev
```

访问 http://localhost:3000

### 5. 启动骑手端 H5

```bash
cd frontend/rider-h5

# 安装依赖
npm install

# 开发模式
npm run dev
```

访问 http://localhost:3001

### 6. 启动运营管理后台

```bash
cd frontend/admin

# 安装依赖
npm install

# 开发模式
npm run dev
```

访问 http://localhost:3002

## 默认账号

### 运营管理后台
- 用户名: admin
- 密码: admin123

## API 文档

### 认证

#### 用户注册
```
POST /api/v1/auth/user/register
```

#### 用户登录
```
POST /api/v1/auth/user/login
```

#### 骑手注册
```
POST /api/v1/auth/rider/register
```

#### 骑手登录
```
POST /api/v1/auth/rider/login
```

#### 管理员登录
```
POST /api/v1/auth/admin/login
```

### 订单

#### 计算价格
```
POST /api/v1/user/order/calculate-price
```

#### 创建订单
```
POST /api/v1/user/order
```

#### 获取订单列表
```
GET /api/v1/user/order
```

#### 获取订单详情
```
GET /api/v1/user/order/:id
```

#### 取消订单
```
POST /api/v1/user/order/cancel
```

#### 评价订单
```
POST /api/v1/user/order/rate
```

#### 获取可用订单 (骑手)
```
GET /api/v1/rider/order/available
```

#### 接单
```
POST /api/v1/rider/order/accept
```

#### 确认取件
```
POST /api/v1/rider/order/pickup
```

#### 确认送达
```
POST /api/v1/rider/order/deliver
```

### 地址

#### 获取地址列表
```
GET /api/v1/user/address
```

#### 创建地址
```
POST /api/v1/user/address
```

#### 更新地址
```
PUT /api/v1/user/address
```

#### 删除地址
```
DELETE /api/v1/user/address/:id
```

### 异常工单

#### 创建异常工单
```
POST /api/v1/user/exception
```

#### 获取异常工单列表
```
GET /api/v1/user/exception
```

#### 处理异常工单 (管理员)
```
PUT /api/v1/admin/exception/:id/handle
```

## 订单状态

| 状态码 | 说明 |
|--------|------|
| 0 | 待接单 |
| 1 | 已接单 |
| 2 | 取件中 |
| 3 | 已取件 |
| 4 | 配送中 |
| 5 | 待签收 |
| 6 | 已完成 |
| 7 | 已取消 |
| 8 | 异常 |

## 异常工单类型

| 类型码 | 说明 |
|--------|------|
| 1 | 丢件 |
| 2 | 超时 |
| 3 | 损坏 |
| 4 | 其他 |

## WebSocket

### 连接
```
ws://localhost:8080/ws?token=your_jwt_token
```

### 消息类型

#### 骑手位置更新 (骑手 → 服务端)
```json
{
  "type": "location",
  "content": {
    "longitude": 116.397428,
    "latitude": 39.90923
  }
}
```

#### 订单状态变化 (服务端 → 用户/骑手)
```json
{
  "type": "order_status",
  "content": {
    "order_id": 1,
    "status": 1
  }
}
```

#### 新订单通知 (服务端 → 骑手)
```json
{
  "type": "new_order",
  "content": {
    "id": 1,
    "order_no": "ORD20240101120000XXXXXX"
  }
}
```

## 计费规则

- 基础费用: 8元 (3km内, 5kg内)
- 距离费用: 超出3km后 2元/km
- 重量费用: 超出5kg后 1元/kg
- 时段附加费:
  - 早高峰 (07:00-09:00): +3元
  - 午高峰 (11:00-13:00): +3元
  - 晚高峰 (17:00-19:00): +3元
  - 夜间 (22:00-06:00): +5元, 距离/重量费用增加

## 生产部署

### 后端
```bash
cd backend
go build -o server cmd/server/main.go
./server
```

### 前端
```bash
cd frontend/user-h5
npm run build

cd frontend/rider-h5
npm run build

cd frontend/admin
npm run build
```

构建后的静态文件在 `dist/` 目录，可以部署到 Nginx 或其他 Web 服务器。

## License

MIT
