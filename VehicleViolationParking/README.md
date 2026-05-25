# 车辆违章/停车管理系统（园区）

基于 Golang(Gin) + Vue3 + MySQL + Redis 构建的园区/小区车辆停车管理系统。

## 项目结构

```
VehicleViolationParking/
├── backend/                 # Go 后端
│   ├── config/             # 配置
│   ├── middleware/          # 中间件（认证、CORS）
│   ├── models/             # 数据模型
│   ├── handlers/           # 请求处理器
│   ├── utils/              # 工具函数（JWT、Redis、计费）
│   ├── router/             # 路由
│   ├── main.go             # 入口
│   └── go.mod
├── frontend/                # Vue3 前端
│   ├── src/
│   │   ├── api/            # API 接口
│   │   ├── components/     # 组件
│   │   ├── router/         # 路由
│   │   ├── stores/         # 状态管理
│   │   ├── styles/         # 样式
│   │   ├── utils/          # 工具
│   │   ├── views/          # 页面
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── sql/                     # 数据库脚本
│   ├── vehicle_parking.sql # 建表和初始化数据脚本
│   ├── import_db.py        # 数据库导入脚本
│   └── init_data.py        # 初始化数据脚本
├── parking-server.exe       # 编译后的后端可执行文件
└── README.md
```

## 核心功能

- **车辆登记管理**：车辆信息登记、月卡/临时车区分、车主信息管理
- **车位分配管理**：车位登记、区域划分、实时状态监控
- **出入记录管理**：车辆入场/出场记录、手动登记
- **停车计费系统**：基于时长的计费规则、日封顶、免费时长
- **月卡管理**：月卡办理、续期、退卡
- **车位状态看板**：实时车位状态展示、区域统计

## 技术栈

### 后端
- **Golang** 1.21+
- **Gin** v1.10.0 - Web 框架
- **GORM** v1.25.12 - ORM
- **MySQL** - 关系型数据库
- **Redis** v9.6.1 - 车位实时状态缓存
- **JWT** - 用户认证

### 前端
- **Vue3** v3.4+ - 前端框架
- **Element Plus** v2.4+ - UI 组件库
- **Pinia** - 状态管理
- **Vue Router** - 路由
- **Axios** - HTTP 客户端
- **Vite** - 构建工具

## 数据库配置

- 地址：`127.0.0.1:3306`
- 用户名：`root`
- 密码：`123456`
- 数据库：`vehicle_parking`

### 数据库表

| 表名 | 说明 |
|------|------|
| vehicles | 车辆表 |
| parking_spots | 车位表 |
| access_records | 出入记录表 |
| billing_rules | 计费规则表 |
| monthly_cards | 月卡记录表 |
| payments | 支付记录表 |
| users | 用户表 |

### 数据库初始化

```bash
# 方式一：使用 Python 脚本
python sql/import_db.py
python sql/init_data.py

# 方式二：手动导入 SQL
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < sql/vehicle_parking.sql
```

## Redis 配置

- 地址：`127.0.0.1:6379`
- 密码：无
- 数据库：0

## 启动方式

### 1. 启动后端

```bash
cd backend
go mod tidy
go run main.go
# 或编译后运行
go build -o ../parking-server.exe .
../parking-server.exe
```

后端服务默认监听 `http://127.0.0.1:8080`

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端服务默认监听 `http://127.0.0.1:5173`

## 默认账号

- 用户名：`admin`
- 密码：`123456`

## 计费规则说明

系统支持灵活的计费规则配置：

- **免费时长**：停车时间在免费时长内不收费
- **基础费用**：超过免费时长后的首段费用
- **单位费用**：超出基础时长后按单位时长计费
- **日封顶**：单日最高费用（0 表示不封顶）

示例计费规则：
- 小型车：5元/30分钟起步，超出后3元/30分钟，日封顶50元，月卡300元/月
- 中型车：8元/30分钟起步，超出后5元/30分钟，日封顶80元，月卡500元/月
- 大型车：12元/30分钟起步，超出后8元/30分钟，日封顶120元，月卡800元/月

## API 接口

### 认证
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/userinfo` - 获取用户信息

### 车辆管理
- `GET /api/vehicles` - 车辆列表
- `GET /api/vehicles/:id` - 车辆详情
- `GET /api/vehicles/plate/:plate` - 按车牌号查询
- `POST /api/vehicles` - 新增车辆
- `PUT /api/vehicles/:id` - 更新车辆
- `DELETE /api/vehicles/:id` - 删除车辆

### 车位管理
- `GET /api/spots` - 车位列表
- `GET /api/spots/:id` - 车位详情
- `GET /api/spots/realtime/status` - 实时车位状态
- `GET /api/spots/statistics/overview` - 车位统计
- `GET /api/spots/areas/list` - 区域列表
- `POST /api/spots` - 新增车位
- `PUT /api/spots/:id` - 更新车位
- `DELETE /api/spots/:id` - 删除车位

### 出入记录
- `GET /api/records` - 记录列表
- `POST /api/records/entry` - 车辆入场
- `POST /api/records/exit` - 车辆出场
- `GET /api/records/calculate/fee` - 计算费用
- `GET /api/records/statistics/overview` - 记录统计
- `GET /api/records/statistics/trend` - 趋势统计
- `POST /api/records/manual/entry` - 手动入场
- `POST /api/records/manual/exit` - 手动出场

### 计费规则
- `GET /api/rules` - 规则列表
- `POST /api/rules` - 新增规则
- `PUT /api/rules/:id` - 更新规则
- `DELETE /api/rules/:id` - 删除规则

### 月卡管理
- `GET /api/cards` - 月卡列表
- `POST /api/cards` - 办理月卡
- `POST /api/cards/:id/renew` - 续期
- `POST /api/cards/:id/refund` - 退卡
- `GET /api/cards/statistics/overview` - 月卡统计

### 支付记录
- `GET /api/payments` - 支付记录列表
- `GET /api/payments/statistics/overview` - 支付统计

### 仪表盘
- `GET /api/dashboard/overview` - 概览数据
- `GET /api/dashboard/recent-records` - 最近记录
- `GET /api/dashboard/expiring-cards` - 即将到期月卡

## 注意事项

1. **车位并发占用**：系统使用数据库事务和 Redis 缓存确保车位状态一致性
2. **Redis 可选**：如果 Redis 不可用，系统会降级为纯数据库模式
3. **车牌识别**：预留了车牌识别接口对接能力，可扩展接入硬件设备

## 开发说明

### 后端开发

```bash
cd backend
go mod tidy
go run main.go
```

### 前端开发

```bash
cd frontend
npm install
npm run dev
```

### 前端构建

```bash
cd frontend
npm run build
# 构建产物在 dist/ 目录
```

## License

MIT
