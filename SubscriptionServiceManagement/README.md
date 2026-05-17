# 订阅服务管理系统

一个用于管理和追踪各类订阅服务（如 Netflix、iCloud、视频会员等）的全栈应用，帮助用户避免重复扣款，统一管理订阅。

## 技术栈

- **后端**: Spring Boot 3.2 + MySQL 8.0
- **前端**: Vue 3 + Vite + Element Plus + ECharts
- **构建工具**: Maven (后端) + npm (前端)

## 功能特性

- ✅ 订阅录入与管理：支持添加、编辑、删除订阅
- ✅ 续费提醒：自动生成到期提醒，支持自定义提醒天数
- ✅ 费用换算：自动进行月费/年费换算，支持自定义周期
- ✅ 即将到期看板：一目了然查看未来即将到期的订阅
- ✅ 多币种汇总：支持多币种管理，使用静态汇率自动换算为人民币
- ✅ 统计分析：分类分布饼图、币种支出柱状图等可视化分析
- ✅ 定时任务：每日自动生成提醒、发送提醒通知

## 数据库配置

### 数据库信息
- 地址: 127.0.0.1
- 端口: 3306
- 用户名: root
- 密码: 123456
- 数据库名: subscription_management

### 导入数据库脚本

**注意**: 本项目 MySQL 命令行工具可能未在系统 PATH 中，请使用以下方法之一导入：

#### 方法 1: 使用 MySQL 命令行（如果已安装）

```bash
# 导入表结构
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < database/schema.sql

# 导入示例数据
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < database/data.sql
```

#### 方法 2: 使用 PowerShell 管道

```powershell
Get-Content database\schema.sql | & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -h 127.0.0.1 -P 3306 -u root -p123456
Get-Content database\data.sql | & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -h 127.0.0.1 -P 3306 -u root -p123456
```

#### 方法 3: 使用 Navicat、DBeaver 等可视化工具

1. 打开数据库连接工具，连接到 127.0.0.1:3306
2. 创建数据库 `subscription_management`
3. 执行 `database/schema.sql` 创建表结构
4. 执行 `database/data.sql` 插入示例数据

### 数据库表结构

- `subscriptions`: 订阅服务主表
- `exchange_rates`: 汇率表（静态汇率）
- `reminders`: 提醒记录表

## 后端运行

### 环境要求
- JDK 17+
- Maven 3.6+

### 启动步骤

```bash
cd backend

# 编译项目
mvn clean package -DskipTests

# 运行项目
mvn spring-boot:run
```

后端服务将在 `http://localhost:8080/api` 启动

### API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /subscriptions | 获取所有订阅 |
| GET | /subscriptions/active | 获取活跃订阅 |
| GET | /subscriptions/{id} | 获取单个订阅详情 |
| POST | /subscriptions | 创建订阅 |
| PUT | /subscriptions/{id} | 更新订阅 |
| DELETE | /subscriptions/{id} | 删除订阅 |
| GET | /subscriptions/upcoming/{days} | 获取未来N天内到期的订阅 |
| POST | /subscriptions/{id}/renew | 续费订阅 |
| GET | /reminders/pending | 获取待发送提醒 |
| PUT | /reminders/{id}/sent | 标记提醒为已发送 |
| POST | /reminders/generate | 手动生成提醒 |
| GET | /statistics | 获取统计数据 |
| GET | /exchange-rates | 获取所有汇率 |

## 前端运行

### 环境要求
- Node.js 16+
- npm 8+

### 启动步骤

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务将在 `http://localhost:5173` 启动

### 页面说明

1. **看板 (Dashboard)**: 展示统计概览和即将到期的订阅
2. **订阅列表 (Subscriptions)**: 展示所有订阅，支持搜索、筛选、编辑、删除
3. **添加/编辑订阅**: 表单页面，用于录入新订阅或编辑现有订阅
4. **提醒中心 (Reminders)**: 管理所有提醒，支持手动生成提醒
5. **统计分析 (Statistics)**: 图表展示分类分布、币种支出等数据

## 项目结构

```
SubscriptionServiceManagement/
├── database/                    # 数据库脚本
│   ├── schema.sql              # 表结构
│   └── data.sql                # 示例数据
├── backend/                     # Spring Boot 后端
│   ├── pom.xml
│   └── src/main/java/com/subscription/
│       ├── SubscriptionManagementApplication.java
│       ├── controller/         # 控制器
│       ├── service/            # 业务逻辑
│       ├── repository/         # 数据访问
│       ├── entity/             # 实体类
│       ├── dto/                # 数据传输对象
│       └── resources/
│           └── application.yml # 配置文件
└── frontend/                    # Vue 前端
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.js
        ├── App.vue
        ├── router/             # 路由配置
        ├── views/              # 页面组件
        ├── api/                # API 接口
        └── utils/              # 工具函数
```

## 注意事项

1. **周期计算**: 支持月付、年付和自定义周期，自定义周期需指定天数
2. **汇率管理**: 使用静态汇率，可在数据库中自行更新
3. **定时任务**: 每天 8:00 自动生成提醒，9:00 自动发送提醒（控制台输出）
4. **数据备份**: 定期备份数据库，防止数据丢失
