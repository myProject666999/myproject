# 在线天气/空气质量看板

一个用于监控多地空气质量与污染趋势的实时看板系统。

## 项目背景

用户需要监控多地空气质量与污染趋势，提供实时数据展示、历史趋势分析、污染预警和多城市对比功能。

## 技术栈

- **后端**: Golang + Fiber 框架
- **前端**: React + Vite + Ant Design + Recharts
- **数据库**: MySQL 8.0+
- **缓存**: Redis 6.0+

## 核心功能

### 1. 城市 AQI 实时数据
- 实时展示各监控城市的 AQI 指数
- 空气质量等级标识（优/良/轻度污染/中度污染/重度污染/严重污染）
- 首要污染物显示
- 温度、湿度、风向等气象数据

### 2. 历史趋势曲线
- AQI 日趋势、周趋势、月趋势图表
- PM2.5、PM10、O3、NO2、SO2、CO 各污染物趋势
- 最高/最低/平均 AQI 统计

### 3. 污染预警
- 自动检测空气质量异常
- 多级预警（黄色/橙色/红色）
- 预警消息推送展示
- 预警历史记录

### 4. 多城市对比
- 支持多城市 AQI 趋势对比
- 柱状图/折线图可视化对比
- 综合数据对比表

## 关键页面

1. **看板首页** - 总览所有城市空气质量概览
2. **城市详情页** - 单个城市的详细数据和历史记录
3. **趋势页** - 历史趋势图表分析
4. **对比页** - 多城市数据对比
5. **设置页** - 系统参数配置

## 项目结构

```
OnlineWeatherAirQualityDashboard/
├── backend/                    # 后端 Go 项目
│   ├── main.go                 # 主入口
│   ├── init_db.go              # 数据库初始化程序
│   ├── go.mod
│   ├── .env                    # 环境配置
│   ├── sql/
│   │   └── init.sql            # 数据库初始化脚本
│   └── internal/
│       ├── config/             # 配置模块
│       ├── database/           # 数据库连接
│       ├── cache/              # Redis 缓存
│       ├── models/             # 数据模型
│       ├── services/           # 业务逻辑层
│       ├── handlers/           # 控制器层
│       ├── routes/             # 路由定义
│       └── scheduler/          # 定时任务
├── frontend/                   # 前端 React 项目
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx            # 入口文件
│       ├── App.jsx             # 根组件
│       ├── index.css           # 全局样式
│       ├── services/
│       │   └── api.js          # API 接口封装
│       └── pages/              # 页面组件
│           ├── Dashboard.jsx   # 看板首页
│           ├── CityDetail.jsx  # 城市详情页
│           ├── Trends.jsx      # 趋势分析页
│           ├── Comparison.jsx  # 对比页
│           └── Settings.jsx    # 设置页
├── init-db.bat                 # 数据库初始化脚本
├── start.bat                   # 一键启动脚本
└── README.md
```

## 数据库设计

### 核心数据表

1. **cities** - 城市信息表
2. **aqi_records** - AQI 实时记录表
3. **aqi_trends** - AQI 日趋势聚合表
4. **alerts** - 预警信息表
5. **user_settings** - 系统配置表

## 快速开始

### 环境要求

- Go 1.21+
- Node.js 18+
- MySQL 8.0+
- Redis 6.0+

### 配置说明

后端配置文件 `backend/.env`:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=air_quality_dashboard

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

SERVER_PORT=8080
SERVER_MODE=debug
```

### 启动步骤

#### 方式一：使用脚本启动（推荐）

1. 确保 MySQL 和 Redis 服务已启动
2. 双击运行 `init-db.bat` 初始化数据库（首次运行）
3. 双击运行 `start.bat` 启动前后端服务

#### 方式二：手动启动

**1. 初始化数据库**
```bash
cd backend
# 使用 MySQL 客户端执行 SQL 脚本
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < sql/init.sql
# 或使用 Go 程序初始化
go run init_db.go
```

**2. 启动后端服务**
```bash
cd backend
go mod download
go run main.go
```
后端服务将在 http://localhost:8080 启动

**3. 启动前端服务**
```bash
cd frontend
npm install
npm run dev
```
前端服务将在 http://localhost:3000 启动

### 访问应用

- 前端看板: http://localhost:3000
- 后端 API: http://localhost:8080/api
- API 健康检查: http://localhost:8080/api/health

## API 接口文档

### 城市相关接口
- `GET /api/cities` - 获取所有城市列表
- `GET /api/cities/with-aqi` - 获取所有城市及最新 AQI 数据
- `GET /api/cities/:id` - 获取单个城市详情

### AQI 数据接口
- `GET /api/aqi` - 获取所有城市最新 AQI
- `GET /api/aqi/:cityId` - 获取指定城市最新 AQI
- `GET /api/aqi/:cityId/history?hours=24` - 获取指定城市历史 AQI 数据

### 趋势接口
- `GET /api/trends/city/:cityId?days=7` - 获取城市趋势数据
- `GET /api/trends/comparison?cities=1,2,3&days=7` - 获取多城市对比数据

### 预警接口
- `GET /api/alerts/active` - 获取活跃预警
- `GET /api/alerts/city/:cityId` - 获取城市预警历史
- `PUT /api/alerts/:id/resolve` - 标记预警已解除

### 设置接口
- `GET /api/settings` - 获取所有配置
- `PUT /api/settings` - 更新配置

## 核心特性说明

### 1. 第三方 API 缓存
- 使用 Redis 缓存热点数据
- 缓存过期时间可配置（默认 5 分钟）
- 支持缓存自动失效和刷新

### 2. 定时数据采集
- 定时采集第三方 AQI 数据（默认 30 分钟）
- 支持模拟数据生成（当前实现）
- 可扩展接入真实的空气质量 API

### 3. 趋势聚合
- 每日凌晨自动聚合前一天的 AQI 数据
- 计算平均、最高、最低 AQI
- 识别首要污染物

### 4. 预警阈值配置
- 支持自定义 AQI 预警阈值
- 支持自定义 PM2.5 预警阈值
- 多级预警机制（黄色/橙色/红色）

## 预警级别说明

| AQI 范围 | 空气质量等级 | 预警级别 | 颜色标识 |
|---------|-------------|---------|---------|
| 0-50 | 优 | - | 绿色 |
| 51-100 | 良 | - | 黄色 |
| 101-150 | 轻度污染 | 黄色预警 | 橙色 |
| 151-200 | 中度污染 | 橙色预警 | 红色 |
| 201-300 | 重度污染 | 红色预警 | 紫色 |
| 300+ | 严重污染 | 红色预警 | 褐红色 |

## 开发说明

### 接入真实空气质量 API

当前系统使用模拟数据生成。如需接入真实 API，请修改 `backend/internal/scheduler/scheduler.go` 中的 `collectData` 方法，替换为真实的 API 调用。

推荐的空气质量数据 API：
- 和风天气 API
- 聚合数据 API
- 各省市环保部门公开 API

### 扩展城市列表

在数据库 `cities` 表中添加新的城市记录即可扩展监控城市。

## License

MIT
