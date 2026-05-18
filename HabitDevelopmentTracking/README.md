# 习惯养成追踪系统

一个基于 Spring Boot + Vue 3 + MySQL 的习惯养成追踪应用。

## 功能特性

- ✅ **习惯定义** - 创建和管理你的习惯
- 📅 **每日打卡** - 每天记录习惯完成情况
- 🔥 **连续天数** - 自动计算连续打卡天数
- 🗓️ **月历热力图** - 可视化展示打卡记录
- 🏆 **坚持榜** - 展示各习惯的坚持排名

## 技术栈

### 后端
- Spring Boot 2.7.18
- MyBatis-Plus 3.5.3.1
- MySQL 8.0+
- Java 8

### 前端
- Vue 3
- Vite
- Element Plus
- Axios

## 项目结构

```
HabitDevelopmentTracking/
├── backend/                    # 后端Spring Boot项目
│   ├── src/main/java/com/habit/tracking/
│   │   ├── controller/         # 控制器层
│   │   ├── entity/             # 实体类
│   │   ├── service/            # 服务层
│   │   ├── repository/         # 数据访问层
│   │   ├── vo/                 # 视图对象
│   │   └── HabitTrackingApplication.java
│   └── src/main/resources/
│       └── application.yml     # 配置文件
├── frontend/                   # 前端Vue项目
│   ├── src/
│   │   ├── views/              # 页面组件
│   │   ├── api/                # API接口
│   │   ├── router/             # 路由配置
│   │   └── App.vue
│   └── package.json
├── sql/                        # 数据库脚本
│   └── init.sql
└── README.md
```

## 快速开始

### 1. 数据库配置

首先确保本地MySQL服务已启动，然后执行数据库初始化脚本：

```bash
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < sql/init.sql
```

或者使用MySQL客户端工具执行 `sql/init.sql` 文件。

数据库配置信息：
- 地址：127.0.0.1
- 端口：3306
- 用户名：root
- 密码：123456
- 数据库名：habit_tracking

### 2. 启动后端服务

```bash
cd backend
mvn spring-boot:run
```

后端服务将在 http://localhost:8080/api 启动

### 3. 启动前端服务

```bash
cd frontend
npm install
npm run dev
```

前端服务将在 http://localhost:3000 启动

## API 接口

### 习惯管理
- `GET /api/habits` - 获取习惯列表
- `POST /api/habits` - 创建习惯
- `DELETE /api/habits/{id}` - 删除习惯

### 打卡功能
- `GET /api/habits/today` - 获取今日打卡状态
- `POST /api/habits/{id}/checkin` - 打卡
- `DELETE /api/habits/{id}/checkin` - 取消打卡

### 统计数据
- `GET /api/habits/stats` - 获取今日统计
- `GET /api/habits/ranking` - 获取坚持榜
- `GET /api/habits/heatmap?year=2026&month=5` - 获取热力图数据

## 核心功能说明

### 连续天数计算

连续天数计算逻辑在 `HabitService.calculateStreak()` 方法中实现：
1. 按倒序获取该习惯的所有打卡日期
2. 从今天开始向前检查，如果日期连续则递增计数
3. 遇到断档则停止计算

### 热力图渲染

热力图使用绿色渐变表示打卡强度：
- 颜色越深表示当天完成的习惯数量越多
- 透明度从 0.2 到 1.0 渐变
- 支持按月切换查看历史数据

## 数据库表结构

### user（用户表）
- id, username, nickname, avatar, created_at, updated_at

### habit（习惯表）
- id, user_id, name, icon, color, description, target_days, sort_order, is_active, created_at, updated_at

### checkin_record（打卡记录表）
- id, user_id, habit_id, checkin_date, checkin_time, remark, created_at

## 预览

系统预置了4个默认习惯：
- 💧 喝水 - 每天喝8杯水
- 📚 阅读 - 每天阅读30分钟
- 🏃 运动 - 每天运动30分钟
- 😴 早睡 - 每天23点前睡觉

并随机生成了最近30天的示例打卡数据，方便预览效果。
