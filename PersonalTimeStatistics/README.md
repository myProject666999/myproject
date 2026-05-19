# 个人时间统计系统

## 项目简介

基于 Spring Boot + Vue + MySQL 的个人时间统计管理系统，支持时间记录、类别管理、统计分析、目标设置等功能。

## 技术栈

- **后端**: Spring Boot 2.7 + JPA + MySQL
- **前端**: Vue 3 + Element Plus + ECharts
- **数据库**: MySQL 8.0+

## 核心功能

1. **时段录入**: 记录时间分配，支持跨日时段处理
2. **类别预设**: 工作/学习/娱乐/运动/休息等类别
3. **日/周/月统计**: 饼图展示时间分配，折线图展示趋势
4. **目标对比**: 设置每日/每周/每月目标，跟踪完成情况
5. **导出报表**: 导出统计数据为文本格式

## 项目结构

```
PersonalTimeStatistics/
├── backend/                    # Spring Boot 后端
│   ├── src/main/java/com/timestatistics/
│   │   ├── controller/         # 控制层
│   │   ├── entity/             # 实体类
│   │   ├── repository/         # 数据访问层
│   │   └── service/            # 业务逻辑层
│   ├── src/main/resources/
│   │   └── application.yml     # 配置文件
│   └── pom.xml
├── frontend/                   # Vue 前端
│   ├── src/
│   │   ├── api/                # API 接口
│   │   ├── views/              # 页面组件
│   │   ├── router/             # 路由配置
│   │   └── utils/              # 工具类
│   └── package.json
└── sql/
    └── time_statistics.sql     # 数据库脚本
```

## 数据库配置

### 1. 导入数据库脚本

**方式一：使用 MySQL 命令行**

```bash
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < sql/time_statistics.sql
```

**方式二：使用 PowerShell**

```powershell
Get-Content "sql/time_statistics.sql" | & "C:\path\to\mysql.exe" -h 127.0.0.1 -P 3306 -u root -p123456
```

**方式三：使用 Navicat/DBeaver 等可视化工具**

1. 创建数据库 `time_statistics`
2. 执行 `sql/time_statistics.sql` 脚本

### 2. 修改连接配置

编辑 `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://127.0.0.1:3306/time_statistics?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
    username: root
    password: 123456
```

## 启动项目

### 1. 启动后端

```bash
cd backend
mvn spring-boot:run
```

后端服务将在 `http://127.0.0.1:8080` 启动

### 2. 启动前端

```bash
cd frontend
npm install
npm run serve
```

前端服务将在 `http://127.0.0.1:8081` 启动

## API 接口

### 类别管理
- `GET /api/categories` - 获取所有类别
- `POST /api/categories` - 创建类别
- `PUT /api/categories/{id}` - 更新类别
- `DELETE /api/categories/{id}` - 删除类别

### 时间记录
- `GET /api/records/date/{date}` - 获取某日记录
- `GET /api/records/range?startDate=&endDate=` - 获取日期范围记录
- `POST /api/records` - 创建记录
- `PUT /api/records/{id}` - 更新记录
- `DELETE /api/records/{id}` - 删除记录
- `GET /api/records/statistics/category` - 按类别统计
- `GET /api/records/statistics/date` - 按日期统计

### 目标管理
- `GET /api/goals` - 获取所有目标
- `GET /api/goals/type/{type}` - 按类型获取目标
- `POST /api/goals` - 创建目标
- `PUT /api/goals/{id}` - 更新目标
- `DELETE /api/goals/{id}` - 删除目标

## 核心页面

1. **时间录入**: 选择日期，添加/编辑/删除时间记录
2. **统计图**: 日/周/月视图，饼图展示分配，折线图展示趋势，支持导出
3. **目标设置**: 管理日/周/月目标，设置类别目标时长

## 跨日时段处理

系统支持跨日时段记录，例如：
- 开始时间：2024-01-01 22:00
- 结束时间：2024-01-02 01:00
- 系统自动标记 `is_cross_day = 1`
- 记录日期按开始时间计算（2024-01-01）
