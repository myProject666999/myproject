# 健康问诊预约系统

## 项目简介

基于 Spring Boot + Vue3 的在线问诊预约挂号系统，支持科室排班展示、预约挂号、号源管理、叫号管理等功能。

## 技术栈

### 后端
- **框架**: Spring Boot 3.2.0
- **数据库**: MySQL 8.0+
- **缓存**: Redis 6.0+
- **ORM**: Spring Data JPA
- **构建工具**: Maven
- **Java版本**: JDK 17+

### 前端
- **框架**: Vue 3.4
- **路由**: Vue Router 4
- **UI组件**: Element Plus
- **HTTP客户端**: Axios
- **构建工具**: Vite 5

## 项目结构

```
HealthConsultationAppointment/
├── backend/                    # 后端项目
│   ├── src/
│   │   └── main/
│   │       ├── java/com/health/appointment/
│   │       │   ├── common/     # 通用类
│   │       │   ├── config/     # 配置类
│   │       │   ├── controller/ # 控制层
│   │       │   ├── entity/     # 实体类
│   │       │   ├── repository/ # 数据访问层
│   │       │   ├── service/    # 业务逻辑层
│   │       │   └── HealthAppointmentApplication.java
│   │       └── resources/
│   │           └── application.yml
│   └── pom.xml
├── frontend/                   # 前端项目
│   ├── src/
│   │   ├── api/                # API接口
│   │   ├── router/             # 路由配置
│   │   ├── utils/              # 工具类
│   │   ├── views/              # 页面组件
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── health_appointment.sql      # 数据库脚本
└── README.md
```

## 数据库设计

### 核心表结构

| 表名 | 说明 |
|------|------|
| department | 科室表 |
| doctor | 医生表 |
| patient | 患者表 |
| schedule | 排班表 |
| appointment | 预约表 |
| queue_call | 叫号表 |
| sys_config | 系统配置表 |

### 数据库配置

- 数据库名: `health_appointment`
- 地址: `127.0.0.1:3306`
- 用户名: `root`
- 密码: `123456`

## 快速开始

### 1. 导入数据库

#### 方式一：使用命令行
```bash
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < health_appointment.sql
```

#### 方式二：使用批处理脚本
双击运行 `导入数据库.bat`

#### 方式三：使用Navicat等工具
1. 连接MySQL数据库
2. 新建数据库 `health_appointment`
3. 右键数据库 -> 运行SQL文件 -> 选择 `health_appointment.sql`

### 2. 启动Redis

确保Redis服务已启动（默认端口6379）

```bash
# Windows
redis-server.exe

# Linux/Mac
redis-server
```

### 3. 启动后端服务

```bash
cd backend

# 编译项目
mvn clean package

# 运行项目
mvn spring-boot:run
```

后端服务启动在: `http://localhost:8080/api`

### 4. 启动前端服务

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务
npm run dev
```

前端服务启动在: `http://localhost:5173`

## 功能模块

### 1. 科室管理
- 科室列表展示
- 科室详情查看

### 2. 医生排班
- 医生信息展示
- 排班列表查询（按日期、时段）
- 号源剩余数量显示

### 3. 预约挂号
- 选择排班进行预约
- 患者信息录入
- 号源并发控制（Redis分布式锁）
- 每日预约数量限制
- 防止重复预约

### 4. 预约管理
- 我的预约列表
- 取消预约
- 预约状态跟踪

### 5. 叫号管理
- 叫号队列展示
- 呼叫下一位患者
- 重复叫号
- 标记已就诊/过号
- 当前叫号状态实时展示

## 核心特性

### 号源并发控制
- 使用Redis分布式锁防止超卖
- 号源数量原子性操作
- 双重校验（Redis + 数据库）

### 预约规则
- 每人每天最多预约2个号（可配置）
- 就诊前24小时可取消预约（可配置）
- 同一患者不能重复预约同一排班

### 叫号管理
- 支持多次叫号
- 过号处理
- 就诊状态跟踪

## API接口文档

### 科室接口
- `GET /api/departments` - 获取科室列表
- `GET /api/departments/{id}` - 获取科室详情

### 医生接口
- `GET /api/doctors` - 获取医生列表（支持按科室筛选）
- `GET /api/doctors/{id}` - 获取医生详情

### 排班接口
- `GET /api/schedules` - 获取排班列表
- `GET /api/schedules/{id}` - 获取排班详情

### 预约接口
- `GET /api/appointments/patient/{patientId}` - 获取患者预约列表
- `GET /api/appointments/{id}` - 获取预约详情
- `POST /api/appointments` - 创建预约
- `PUT /api/appointments/{id}/cancel` - 取消预约

### 叫号接口
- `GET /api/queue-calls` - 获取叫号列表
- `GET /api/queue-calls/current` - 获取当前叫号
- `POST /api/queue-calls/call-next` - 呼叫下一位
- `PUT /api/queue-calls/{id}/recall` - 重复叫号
- `PUT /api/queue-calls/{id}/visited` - 标记已就诊
- `PUT /api/queue-calls/{id}/missed` - 标记过号

## 系统配置

可在 `sys_config` 表中配置以下参数：

| 配置键 | 说明 | 默认值 |
|--------|------|--------|
| cancel_limit_hours | 预约取消限制时间（小时） | 24 |
| max_appointment_per_day | 每人每天最大预约数 | 2 |
| queue_call_interval | 叫号间隔时间（分钟） | 5 |
| missed_appointment_limit | 爽约次数限制 | 3 |

## 测试数据

数据库脚本已预置以下测试数据：
- 8个科室（内科、外科、儿科、妇产科、眼科、耳鼻喉科、皮肤科、口腔科）
- 12位医生（各科室1-3位）
- 5位测试患者
- 未来7天的排班数据（约40条排班记录）
- 系统配置参数

## 注意事项

1. 确保MySQL和Redis服务已启动
2. 数据库连接配置在 `backend/src/main/resources/application.yml`
3. Redis连接配置同上
4. 前端API代理配置在 `frontend/vite.config.js`
5. 生产环境需要修改CORS配置和数据库密码

## 开发说明

### 后端开发
```bash
cd backend
mvn spring-boot:run
```

### 前端开发
```bash
cd frontend
npm install
npm run dev
```

### 打包部署
```bash
# 后端打包
cd backend
mvn clean package

# 前端打包
cd frontend
npm run build
```

## 许可证

MIT License
