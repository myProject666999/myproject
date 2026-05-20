# 旅行计划工具

一个功能完整的旅行计划管理系统，帮助用户规划旅行日程、管理住宿酒店、控制预算以及准备必备物品清单。

## 技术栈

- **后端**: Spring Boot 3.2.0 + Spring Data JPA + MySQL
- **前端**: Vue 3 + Vite + Element Plus + Vue Router + Axios
- **地图**: 高德地图 JS API

## 功能模块

### 1. 行程总览
- 创建、编辑、删除行程
- 查看行程基本信息（名称、目的地、日期、预算）
- 行程卡片展示，显示天数

### 2. 每日详情
- 按天查看行程安排
- 添加、编辑、删除每日行程
- 景点管理（名称、地址、时间、费用、坐标）
- **地图集成**: 点击景点可在地图上查看位置（高德地图）

### 3. 预算管理
- 预算分类管理（交通、住宿、餐饮、门票、购物等）
- 预算金额与实际金额对比
- 统计总预算、已花费、剩余预算
- 差额计算与可视化

### 4. 住宿管理
- 酒店信息管理（名称、地址、联系方式）
- 入住/退房日期管理
- 自动计算住宿天数和总价
- 支持经纬度记录

### 5. 物品清单
- 物品分类管理（证件、衣物、电子设备等）
- 打包进度追踪
- 数量管理
- 备注功能

## 数据库设计

### 数据表
- `trip` - 行程表
- `daily_schedule` - 每日行程表
- `attraction` - 景点表
- `hotel` - 酒店表
- `budget` - 预算表
- `packing_item` - 物品清单表

## 快速开始

### 环境要求
- JDK 17+
- Node.js 16+
- MySQL 8.0+
- Maven 3.6+

### 1. 导入数据库

```bash
# 方式一：使用 MySQL 命令行
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < sql/travel_planning.sql

# 方式二：在 MySQL 客户端中执行
source d:/Workspace/myproject/TravelPlanningTool/sql/travel_planning.sql
```

数据库配置：
- 主机: 127.0.0.1
- 端口: 3306
- 用户名: root
- 密码: 123456
- 数据库名: travel_planning

### 2. 启动后端服务

```bash
cd backend
mvn spring-boot:run
```

后端服务将在 http://localhost:8080 启动

### 3. 启动前端服务

```bash
cd frontend
npm install
npm run dev
```

前端服务将在 http://localhost:5173 启动

### 4. 配置高德地图 API

1. 访问 [高德开放平台](https://lbs.amap.com/) 注册账号
2. 创建应用，获取 Web 端 (JS API) Key
3. 替换 `frontend/index.html` 中的 `YOUR_AMAP_KEY` 为你的 Key

```html
<script type="text/javascript" src="https://webapi.amap.com/maps?v=2.0&key=你的Key"></script>
```

## API 接口

### 行程管理
- `GET /api/trips` - 获取行程列表
- `GET /api/trips/{id}` - 获取行程详情
- `POST /api/trips` - 创建行程
- `PUT /api/trips/{id}` - 更新行程
- `DELETE /api/trips/{id}` - 删除行程

### 每日行程
- `GET /api/daily-schedules/trip/{tripId}` - 获取行程的每日安排
- `POST /api/daily-schedules` - 创建每日行程
- `PUT /api/daily-schedules/{id}` - 更新每日行程
- `DELETE /api/daily-schedules/{id}` - 删除每日行程

### 景点管理
- `GET /api/attractions/schedule/{scheduleId}` - 获取每日行程的景点
- `POST /api/attractions` - 添加景点
- `PUT /api/attractions/{id}` - 更新景点
- `DELETE /api/attractions/{id}` - 删除景点

### 其他接口
- 酒店管理: `/api/hotels`
- 预算管理: `/api/budgets`
- 物品清单: `/api/packing-items`

## 项目结构

```
TravelPlanningTool/
├── backend/                    # Spring Boot 后端
│   ├── src/main/java/com/travel/
│   │   ├── TravelPlanningApplication.java
│   │   ├── config/            # 配置类
│   │   ├── controller/        # 控制器
│   │   ├── entity/            # 实体类
│   │   ├── repository/        # 数据访问层
│   │   └── service/           # 业务逻辑层
│   ├── src/main/resources/
│   │   └── application.yml    # 配置文件
│   └── pom.xml
├── frontend/                   # Vue 前端
│   ├── src/
│   │   ├── api/               # API 接口
│   │   ├── router/            # 路由配置
│   │   ├── views/             # 页面组件
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── style.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── sql/
│   └── travel_planning.sql    # 数据库脚本
└── README.md
```

## 注意事项

1. **数据库连接**: 请确保 MySQL 服务已启动，并正确配置了用户名和密码
2. **高德地图 Key**: 地图功能需要配置有效的高德地图 API Key
3. **跨域配置**: 前端已配置代理，开发环境下通过 `/api` 前缀访问后端接口
4. **测试数据**: 数据库脚本中已包含云南七日游的示例数据，可直接预览效果

## 开发说明

- 后端端口: 8080
- 前端端口: 5173
- 数据库端口: 3306
- 跨域处理: 后端已配置 CorsConfig 支持跨域请求
