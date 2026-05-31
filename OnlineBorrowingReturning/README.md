# 在线借还物品系统

社区/办公室共享物品管理平台，支持物品登记、借还、预约排队和超期提醒。

## 技术栈

- **后端**: Golang + Fiber + GORM + SQLite
- **前端**: Vue 3 + Element Plus + Vue Router + Axios
- **数据库**: SQLite

## 项目结构

```
OnlineBorrowingReturning/
├── backend/                    # 后端项目
│   ├── main.go                 # 入口文件
│   ├── database/               # 数据库连接
│   ├── models/                 # 数据模型
│   ├── handlers/               # 处理器
│   ├── routes/                 # 路由配置
│   └── scheduler/              # 定时任务
├── frontend/                   # 前端项目
│   ├── src/
│   │   ├── api/                # API 接口
│   │   ├── views/              # 页面组件
│   │   ├── router/             # 路由配置
│   │   ├── assets/             # 静态资源
│   │   ├── App.vue             # 根组件
│   │   └── main.js             # 入口文件
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 功能特性

### 核心功能
- ✅ 物品登记与库存管理
- ✅ 借出/归还操作（含库存并发控制）
- ✅ 超期提醒定时任务
- ✅ 借用记录查询与统计
- ✅ 预约排队系统
- ✅ 物品状态管理

### 关键页面
- **物品列表页**: 查看所有物品，支持搜索和分类筛选
- **借还操作页**: 借出和归还物品
- **借用记录页**: 查看历史借用记录，支持多条件筛选
- **预约排队页**: 预约物品，查看排队状态
- **后台管理页**: 物品增删改查，统计数据展示

## 快速开始

### 后端启动

```bash
cd backend

# 安装依赖
go mod tidy

# 运行服务
go run main.go
```

后端服务将在 `http://localhost:8080` 启动

### 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务将在 `http://localhost:5173` 启动

## API 接口

### 物品管理
- `GET /api/v1/items` - 获取物品列表
- `GET /api/v1/items/:id` - 获取物品详情
- `POST /api/v1/items` - 创建物品
- `PUT /api/v1/items/:id` - 更新物品
- `DELETE /api/v1/items/:id` - 删除物品

### 借还管理
- `GET /api/v1/borrows` - 获取借用记录
- `GET /api/v1/borrows/:id` - 获取借用详情
- `POST /api/v1/borrows` - 创建借出记录
- `PUT /api/v1/borrows/:id/return` - 归还物品

### 预约管理
- `GET /api/v1/reservations` - 获取预约列表
- `GET /api/v1/reservations/:id` - 获取预约详情
- `POST /api/v1/reservations` - 创建预约
- `PUT /api/v1/reservations/:id/cancel` - 取消预约
- `GET /api/v1/reservations/item/:itemId/queue` - 获取物品预约队列

### 统计接口
- `GET /api/v1/stats/items` - 物品统计
- `GET /api/v1/stats/borrows` - 借用统计

## 注意事项

### 库存并发控制
- 使用数据库事务和行级锁 (`FOR UPDATE`) 防止库存超卖
- 使用互斥锁 (`sync.Mutex`) 确保借出操作的原子性

### 超期提醒
- 系统每小时自动检查超期记录
- 超期未还的记录状态会自动更新为"已超期"

### 预约排队
- 物品有库存时，预约直接变为"可领取"状态
- 物品无库存时，进入等待队列
- 归还物品时，自动通知下一位排队者

## 数据库

使用 SQLite 数据库，数据库文件将在首次运行时自动创建在 `backend/borrowing.db`

## License

MIT
