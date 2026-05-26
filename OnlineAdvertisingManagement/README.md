# 在线投放广告位管理系统

## 项目简介

一个功能完整的在线广告位管理系统，支持广告位管理、素材管理、投放排期、展示/点击统计等功能。

## 技术栈

- **后端**: Node.js + NestJS + TypeORM
- **前端**: React + TypeScript + Vite + Ant Design
- **数据库**: MySQL
- **缓存/计数**: Redis

## 功能特性

### 核心功能

1. **广告位管理**
   - 广告位增删改查
   - 尺寸、位置配置
   - 启用/禁用状态

2. **广告素材管理**
   - 素材上传（图片、视频、文字）
   - 跳转链接配置
   - 素材预览

3. **投放排期**
   - 时间范围配置
   - 广告位与素材关联
   - 优先级设置
   - **排期冲突检测**
   - 投放状态（待投放、投放中、已结束）

4. **统计分析**
   - **曝光/点击异步计数**（Redis）
   - **CTR 统计**（点击率）
   - 趋势图表
   - 多维度筛选

## 项目结构

```
OnlineAdvertisingManagement/
├── database/
│   └── schema.sql          # 数据库脚本
├── backend/
│   ├── src/
│   │   ├── entities/       # TypeORM 实体
│   │   ├── ad-space/       # 广告位模块
│   │   ├── ad-material/    # 素材模块
│   │   ├── ad-schedule/    # 排期模块
│   │   ├── ad-stat/        # 统计模块
│   │   ├── common/         # 公共服务（Redis）
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── pages/          # 页面组件
    │   ├── services/       # API 服务
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts
```

## 快速开始

### 1. 数据库初始化

```bash
# 导入数据库脚本
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < database/schema.sql
```

或使用 MySQL 客户端手动执行 `database/schema.sql` 文件。

### 2. 启动 Redis

确保本地 Redis 服务已启动（默认端口 6379）

### 3. 启动后端服务

```bash
cd backend
npm install
npm run start:dev
```

后端服务运行在 http://localhost:3001

### 4. 启动前端服务

```bash
cd frontend
npm install
npm run dev
```

前端服务运行在 http://localhost:3000

## 核心设计

### 异步计数架构

- 曝光和点击数据先写入 Redis（高性能）
- 后台定时任务（每5分钟）同步到 MySQL
- Redis Key 格式: `ad:impression:{scheduleId}:{date}`

### 排期冲突检测

创建/更新排期时自动检测同一广告位是否有时间重叠的排期，避免投放冲突。

### CTR 计算

`CTR = 点击量 / 曝光量 × 100%`

每次同步统计数据时自动计算。

## API 接口

### 广告位

- `GET /api/ad-spaces` - 获取所有广告位
- `POST /api/ad-spaces` - 创建广告位
- `PUT /api/ad-spaces/:id` - 更新广告位
- `DELETE /api/ad-spaces/:id` - 删除广告位

### 素材

- `GET /api/ad-materials` - 获取所有素材
- `POST /api/ad-materials` - 创建素材
- `PUT /api/ad-materials/:id` - 更新素材
- `DELETE /api/ad-materials/:id` - 删除素材

### 排期

- `GET /api/ad-schedules` - 获取所有排期
- `GET /api/ad-schedules/current` - 获取当前投放排期
- `POST /api/ad-schedules` - 创建排期
- `PUT /api/ad-schedules/:id` - 更新排期
- `DELETE /api/ad-schedules/:id` - 删除排期
- `POST /api/ad-schedules/:id/impression` - 记录曝光
- `POST /api/ad-schedules/:id/click` - 记录点击

### 统计

- `GET /api/ad-stats` - 获取统计数据
- `GET /api/ad-stats/summary` - 获取汇总数据
- `GET /api/ad-stats/schedule/:id` - 按排期获取统计
