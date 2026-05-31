# 接口压测与性能基线平台

## 项目简介

一个完整的接口压测与性能基线管理平台，支持压测任务配置、分布式压力发起、实时指标监控、报告生成、性能基线对比和告警功能。

## 技术栈

### 后端
- **Golang 1.21+**
- **Gin Web Framework**
- **GORM ORM**
- **MySQL** - 数据持久化存储
- **Redis** - 实时指标汇聚
- **JWT** - 身份认证

### 前端
- **Vue 3**
- **Vite**
- **Element Plus**
- **ECharts** - 图表可视化
- **Pinia** - 状态管理
- **Vue Router** - 路由管理

## 核心功能

### 1. 压测任务管理
- 支持配置并发数、压测时长、阶梯启动
- 支持GET/POST/PUT/DELETE等HTTP方法
- 支持自定义请求头和请求体
- 任务启停控制

### 2. 实时监控大屏
- 实时QPS、响应时间、错误率展示
- ECharts动态趋势图表
- 秒级指标更新
- P50/P95/P99百分位指标

### 3. 报告生成
- 自动生成压测报告
- 包含完整的性能指标（QPS、RT、错误率等）
- 百分位统计（P50/P95/P99）
- 支持导出基线

### 4. 基线管理
- 基于报告创建性能基线
- 自定义告警阈值
- 基线对比分析
- 支持多基线管理

### 5. 告警系统
- 阈值告警
- 性能回归告警
- 告警处理流程

### 6. 目标管理
- 压测目标地址管理
- IP白名单限制
- 授权令牌验证

## 数据库表结构

- `users` - 用户表
- `targets` - 压测目标表
- `tasks` - 压测任务表
- `task_nodes` - 任务节点表
- `metrics` - 实时指标表
- `reports` - 压测报告表
- `baselines` - 性能基线表
- `comparisons` - 对比记录表
- `alarms` - 告警表

## 快速开始

### 1. 数据库初始化

```bash
# 执行SQL脚本
mysql -h 127.0.0.1 -P 3306 -u root -p < sql/init.sql
```

默认管理员账号：`admin` / `admin123`

### 2. 后端启动

```bash
cd backend

# 安装依赖
go mod tidy

# 启动服务
go run cmd/main.go
```

服务地址：http://localhost:8080

### 3. 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务
npm run dev
```

服务地址：http://localhost:3000

## 配置说明

### 后端配置 (backend/.env)

```env
# 服务配置
SERVER_PORT=8080
SERVER_MODE=debug

# 数据库配置
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=load_testing

# Redis配置
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT配置
JWT_SECRET=load-testing-secret-key-2024
JWT_EXPIRE_HOURS=24
```

### 前端配置 (frontend/vite.config.js)

```javascript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

## API 接口

### 认证接口
- `POST /api/v1/auth/login` - 用户登录
- `GET /api/v1/auth/user` - 获取当前用户

### 目标管理
- `GET /api/v1/targets` - 获取目标列表
- `POST /api/v1/targets` - 创建目标
- `PUT /api/v1/targets/:id` - 更新目标
- `DELETE /api/v1/targets/:id` - 删除目标

### 任务管理
- `GET /api/v1/tasks` - 获取任务列表
- `POST /api/v1/tasks` - 创建任务
- `POST /api/v1/tasks/:id/start` - 启动任务
- `POST /api/v1/tasks/:id/stop` - 中止任务
- `DELETE /api/v1/tasks/:id` - 删除任务

### 实时指标
- `GET /api/v1/metrics/task/:id` - 获取实时指标
- `GET /api/v1/metrics/task/:id/history` - 获取历史指标

### 报告管理
- `GET /api/v1/reports` - 获取报告列表
- `GET /api/v1/reports/:id` - 获取报告详情

### 基线管理
- `GET /api/v1/baselines` - 获取基线列表
- `POST /api/v1/baselines` - 创建基线
- `POST /api/v1/comparisons` - 基线对比

### 告警管理
- `GET /api/v1/alarms` - 获取告警列表
- `POST /api/v1/alarms/:id/handle` - 处理告警

## 项目结构

```
InterfaceLoadTesting/
├── backend/                 # 后端项目
│   ├── cmd/                # 启动入口
│   │   └── main.go
│   ├── config/             # 配置管理
│   ├── internal/           # 内部代码
│   │   ├── handler/        # API处理器
│   │   ├── middleware/     # 中间件
│   │   ├── model/          # 数据模型
│   │   ├── repository/     # 数据访问层
│   │   └── service/        # 业务逻辑层
│   ├── pkg/                # 公共包
│   │   ├── loadtest/       # 压测引擎
│   │   ├── logger/         # 日志
│   │   └── utils/          # 工具函数
│   └── go.mod
├── frontend/               # 前端项目
│   ├── src/
│   │   ├── views/          # 页面组件
│   │   ├── components/     # 公共组件
│   │   ├── api/            # API接口
│   │   ├── router/         # 路由配置
│   │   ├── store/          # 状态管理
│   │   └── main.js         # 入口文件
│   └── package.json
├── sql/                    # 数据库脚本
│   └── init.sql
└── README.md
```

## 使用流程

1. **创建压测目标** - 在目标管理中添加待测接口域名
2. **创建压测任务** - 配置接口路径、并发数、压测时长等
3. **启动压测** - 点击启动按钮开始压测
4. **实时监控** - 查看实时QPS、响应时间等指标
5. **查看报告** - 压测完成后自动生成详细报告
6. **创建基线** - 将稳定报告设为性能基线
7. **对比分析** - 新报告与基线对比，自动触发告警

## 注意事项

1. 压测前请确保目标服务器授权，避免误伤
2. 建议从低并发开始逐步增加压力
3. Redis用于实时指标汇聚，需确保服务正常运行
4. 大并发压测建议使用分布式节点部署
5. 生产环境请修改默认JWT密钥

## 许可证

MIT License
