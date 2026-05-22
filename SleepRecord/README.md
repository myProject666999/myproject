# 睡眠记录系统

一个基于 Spring Boot + Vue 3 + MySQL 的睡眠记录与分析系统。

## 功能特性

- 睡眠时段记录（支持跨零点处理）
- 睡眠质量打分（1-10分）
- 深/浅睡眠时长手动记录
- 月度睡眠报告
- 规律性评分算法
- 数据可视化图表

## 技术栈

- **后端**: Spring Boot 3.2 + MyBatis-Plus + MySQL
- **前端**: Vue 3 + Element Plus + ECharts + Vite
- **数据库**: MySQL 5.7+

## 项目结构

```
SleepRecord/
├── backend/                 # Spring Boot 后端
│   ├── src/main/java/com/sleeprecord/
│   │   ├── SleepRecordApplication.java
│   │   ├── common/Result.java
│   │   ├── controller/SleepRecordController.java
│   │   ├── dto/SleepRecordDTO.java
│   │   ├── entity/SleepRecord.java
│   │   ├── mapper/SleepRecordMapper.java
│   │   └── service/SleepRecordService.java
│   └── src/main/resources/
│       └── application.yml
├── frontend/                # Vue 3 前端
│   ├── src/
│   │   ├── api/index.js
│   │   ├── router/index.js
│   │   ├── views/
│   │   │   ├── Record.vue   # 录入页面
│   │   │   └── Report.vue   # 报告页面
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── style.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── sql/
    └── sleep_record.sql     # 数据库脚本
```

## 快速开始

### 1. 数据库配置

数据库已创建并导入初始数据，包含10条示例记录。

连接信息：
- Host: 127.0.0.1
- Port: 3306
- Database: sleep_record
- Username: root
- Password: 123456

### 2. 启动后端

```bash
cd backend
mvn spring-boot:run
```

后端服务将运行在 http://localhost:8080

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端服务将运行在 http://localhost:3000

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/sleep/record | 创建睡眠记录 |
| PUT | /api/sleep/record/{id} | 更新睡眠记录 |
| DELETE | /api/sleep/record/{id} | 删除睡眠记录 |
| GET | /api/sleep/record/{id} | 获取单条记录 |
| GET | /api/sleep/records | 获取日期范围内记录 |
| GET | /api/sleep/report | 获取睡眠报告 |
| GET | /api/sleep/today | 获取今日统计 |

## 跨零点处理

系统自动处理跨零点的睡眠记录：
- 入睡时间在中午12点后：sleep_date = 入睡日期
- 入睡时间在中午12点前：sleep_date = 入睡日期 - 1天

例如：凌晨1:00入睡，早上8:00起床，sleep_date会记录为前一天。

## 规律性评分算法

规律性评分基于以下因素计算（0-100分）：
1. 早睡比例（22:00-0:00入睡）- 权重30%
2. 入睡时间标准差 - 权重35%
3. 起床时间标准差 - 权重35%
