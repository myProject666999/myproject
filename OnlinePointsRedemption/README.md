# 在线积分商城/兑换系统

一个基于 Golang(Gin) + Vue3 + MySQL + Redis 的积分商城兑换系统。

## 项目结构

```
OnlinePointsRedemption/
├── backend/                 # Go 后端 (Gin 框架)
│   ├── cmd/server/          # 入口
│   ├── config/              # 配置文件
│   ├── internal/
│   │   ├── config/          # 配置加载
│   │   ├── handler/         # HTTP 处理器
│   │   ├── middleware/      # 中间件 (CORS, Auth)
│   │   ├── model/           # 数据模型
│   │   ├── pkg/             # 公共包 (数据库、Redis、响应)
│   │   ├── repository/      # 数据访问层
│   │   ├── router/          # 路由注册
│   │   └── service/         # 业务逻辑层
│   └── go.mod / go.sum
├── frontend/                # Vue3 前端
│   ├── src/
│   │   ├── api/             # API 请求
│   │   ├── router/          # 路由配置
│   │   ├── store/           # Pinia 状态管理
│   │   ├── style/           # 全局样式
│   │   └── views/           # 页面组件
│   └── package.json
└── sql/
    └── init.sql             # MySQL 数据库初始化脚本
```

## 数据库脚本导入

### 方式一：命令行导入

```bash
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < sql/init.sql
```

### 方式二：PowerShell 导入

```powershell
Get-Content "sql\init.sql" -Raw | mysql -h 127.0.0.1 -P 3306 -u root -p123456
```

## 数据库表结构

| 表名 | 说明 |
|------|------|
| `users` | 用户表 |
| `points_account` | 积分账户表 (用户总积分、可用积分、冻结积分) |
| `points_rules` | 积分获取规则表 |
| `points_detail` | 积分明细表 (积分流水，含变动前/后余额) |
| `products` | 商品表 |
| `product_stock` | 商品库存表 (支持 Redis 原子扣减) |
| `product_categories` | 商品分类表 |
| `redemption_orders` | 兑换订单表 (含发货物流信息) |

## 后端启动

### 前置依赖

- Go 1.21+
- MySQL 8.0+
- Redis 6.0+

### 启动步骤

```bash
cd backend

# 安装依赖
go mod tidy

# 启动服务 (默认端口 8080)
go run cmd/server/main.go

# 或编译后运行
go build -o server.exe ./cmd/server/
./server.exe
```

### 配置文件

`backend/config/config.yaml`:

```yaml
server:
  port: 8080
  mode: debug

mysql:
  host: 127.0.0.1
  port: 3306
  user: root
  password: "123456"
  database: online_points_mall
  charset: utf8mb4

redis:
  host: 127.0.0.1
  port: 6379
  password: ""
  db: 0
```

## 前端启动

### 前置依赖

- Node.js 18+
- npm 9+

### 启动步骤

```bash
cd frontend

# 安装依赖
npm install

# 开发模式 (默认端口 5173，代理 /api 到后端)
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 关键技术方案

### 1. 积分扣减原子性

- 使用 Redis `SETNX` 实现分布式锁 (key: `points_mall:lock:user:{userId}`)
- 积分变动在 MySQL 事务内完成：更新积分账户 → 写入积分明细
- 积分明细记录变动前后余额 (`balance_before` / `balance_after`)，确保流水可追溯

### 2. 库存防超兑

- Redis 缓存商品可用库存 (key: `points_mall:stock:{productId}`)
- 使用 Redis `SETNX` 加分布式锁 (key: `points_mall:lock:stock:{productId}`)
- 扣减流程：加锁 → 检查 Redis 库存 → 扣减 Redis 库存 → 扣减 MySQL 库存(带乐观锁) → 释放锁
- 取消订单时自动恢复库存 (Redis + MySQL)

### 3. 兑换流程原子性

```
1. 检查用户积分 (Redis/MySQL)
2. 检查商品库存 (Redis)
3. 扣减库存 (Redis + MySQL)
4. 创建订单 (MySQL)
5. 扣减积分 (MySQL 事务)
6. 任何步骤失败 → 回滚已执行的操作
```

### 4. 积分流水

- 每次积分变动都会写入 `points_detail` 表
- 记录变动积分、变动前后余额、关联订单号、备注
- 支持按用户、时间范围、规则类型查询

## API 接口文档

### 商品相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/products` | 商品列表 (分页、分类筛选) |
| GET | `/api/products/:id` | 商品详情 (含库存) |
| GET | `/api/products/categories` | 商品分类列表 |

### 积分相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/user/points` | 用户积分账户 |
| GET | `/api/user/points/details` | 积分明细 (分页) |
| POST | `/api/user/points/earn` | 获取积分 |
| GET | `/api/user/ranking` | 积分排行榜 |

### 订单相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/orders` | 创建兑换订单 |
| GET | `/api/orders` | 用户订单列表 (分页) |
| GET | `/api/orders/:id` | 订单详情 |
| POST | `/api/orders/cancel` | 取消订单 (退积分) |

### 后台管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/orders` | 订单列表 (按状态筛选) |
| POST | `/api/admin/orders/ship` | 订单发货 |
| POST | `/api/admin/orders/complete` | 完成订单 |

### 请求头

- `X-User-ID`: 用户 ID (用于测试，可手动切换用户)

## 页面说明

### 1. 积分商城首页 (`/`)

- 商品列表展示 (网格布局，响应式)
- 分类筛选
- 分页浏览
- 点击商品进入详情

### 2. 商品详情页 (`/product/:id`)

- 商品大图、名称、描述
- 积分价格、原价对比
- 库存状态、数量选择
- 立即兑换按钮

### 3. 兑换确认页 (`/exchange/:id`)

- 商品信息确认
- 收货信息填写 (收货人、电话、地址)
- 积分消耗汇总
- 确认兑换 (二次确认弹窗)

### 4. 积分明细页 (`/points/detail`)

- 积分账户概览 (可用、总积分、冻结)
- 积分获取规则展示
- 积分流水明细 (表格展示：类型、变动积分、变动前后余额、备注、时间)
- 模拟获取积分功能

### 5. 积分排行榜 (`/ranking`)

- Top 3 特殊展示 (带奖杯/奖牌图标)
- 4-N 名表格展示
- 点击查看用户详情

### 6. 后台管理页 (`/admin`)

- 订单列表 (按状态筛选)
- 待处理订单 → 发货操作
- 已发货订单 → 完成操作
- 可取消订单 → 取消 (退积分)

## 测试账号

| 用户ID | 用户名 | 昵称 | 积分 |
|--------|--------|------|------|
| 1 | admin | 超级管理员 | 10,000 |
| 2 | user001 | 张三 | 5,000 |
| 3 | user002 | 李四 | 3,000 |
| 4 | user003 | 王五 | 8,000 |
| 5 | user004 | 赵六 | 1,500 |

在前端页面右上角下拉菜单中切换用户。

## 注意事项

1. **MySQL 连接**：确保 MySQL 服务已启动，密码配置正确 (默认 `123456`)
2. **Redis 连接**：Redis 用于库存原子扣减和分布式锁，如果 Redis 不可用，库存扣减将降级为仅 MySQL 乐观锁
3. **积分规则**：每日签到等规则有每日限额，通过 `points_detail` 表统计当日次数
4. **订单状态流转**：待处理(0) → 已发货(1) → 已完成(2) / 已取消(3)
5. **取消订单**：取消后自动退还积分到用户账户，库存恢复
