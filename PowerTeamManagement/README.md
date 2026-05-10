# 团队管理系统

基于 Golang + React 开发的团队管理系统，支持看板、业务机会、客户管理、联系人管理、日报管理、组织架构和系统管理等功能。

## 技术栈

### 后端
- Golang 1.21
- Gin Web 框架
- GORM ORM
- MySQL 数据库
- JWT 认证

### 前端
- React 18
- Vite
- React Router
- Axios
- Chart.js + react-chartjs-2
- Tailwind CSS
- Day.js

## 功能模块

### 角色权限
- **管理员**: 拥有所有权限，可管理系统用户、角色、菜单、权限
- **销售主管**: 可查看团队日报，管理业务机会
- **普通销售**: 可管理自己的业务机会、客户、日报

### 功能模块
1. **看板**: 本月业务机会分布图表、转化情况图表、即将结束的业务机会列表
2. **业务机会**: 新机会、初步接触中、需求分析中、协商方案中、商业谈判中、已完成等状态管理
3. **客户管理**: 客户信息增删改查，按名称搜索
4. **联系人**: 联系人信息增删改查，按名称搜索
5. **我的日报**: 记录工作、日期切换、时间线显示
6. **团队日报**: 查看团队成员工作记录（销售主管及以上）
7. **组织架构**: 树形结构、添加组织、分配用户
8. **系统管理**: 用户管理、角色管理、菜单管理、权限管理

## 环境准备

### 必需软件
- MySQL 5.7+
- Go 1.21+
- Node.js 16+
- npm 或 yarn

## 安装与启动

### 1. 数据库准备
确保 MySQL 服务已启动，并创建数据库（系统会自动创建）：

```sql
-- 或者手动创建
CREATE DATABASE power_team_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 后端配置与启动

```bash
cd backend

# 复制环境变量配置文件
cp .env.example .env

# 修改 .env 文件中的数据库配置
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=power_team_management
# JWT_SECRET=your_jwt_secret
# PORT=8080

# 安装依赖
go mod tidy

# 启动后端服务
go run main.go
```

后端服务将在 `http://localhost:8080` 启动。

### 3. 前端配置与启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务将在 `http://localhost:3000` 启动。

## 默认账号

系统启动时会自动创建以下演示账号：

| 用户名 | 密码 | 角色 | 说明 |
|--------|------|------|------|
| admin | admin123 | 管理员 | 拥有所有权限 |
| manager | 123456 | 销售主管 | 可查看团队日报 |
| sales1 | 123456 | 普通销售 | 基础销售权限 |
| sales2 | 123456 | 普通销售 | 基础销售权限 |

## API 接口

### 认证
- `POST /api/login` - 用户登录

### 看板
- `GET /api/dashboard/stats` - 获取统计数据
- `GET /api/dashboard/opportunities-by-status` - 业务机会状态分布
- `GET /api/dashboard/conversion-stats` - 转化统计
- `GET /api/dashboard/upcoming-deadlines` - 即将结束的机会

### 业务机会
- `GET /api/opportunities` - 获取机会列表
- `POST /api/opportunities` - 创建机会
- `GET /api/opportunities/:id` - 获取详情
- `PUT /api/opportunities/:id` - 更新机会
- `DELETE /api/opportunities/:id` - 删除机会

### 客户管理
- `GET /api/customers` - 客户列表
- `GET /api/customers/all` - 所有客户
- `POST /api/customers` - 创建客户
- `PUT /api/customers/:id` - 更新客户
- `DELETE /api/customers/:id` - 删除客户

### 联系人
- `GET /api/contacts` - 联系人列表
- `POST /api/contacts` - 创建联系人
- `PUT /api/contacts/:id` - 更新联系人
- `DELETE /api/contacts/:id` - 删除联系人

### 日报
- `GET /api/my-reports` - 我的日报列表
- `GET /api/my-reports/date/:date` - 指定日期日报
- `POST /api/my-reports` - 保存日报
- `GET /api/team-reports` - 团队日报（管理员/主管）

### 组织架构
- `GET /api/organizations` - 组织列表
- `POST /api/organizations` - 创建组织
- `PUT /api/organizations/:id` - 更新组织
- `DELETE /api/organizations/:id` - 删除组织
- `POST /api/organizations/:id/assign-users` - 分配用户

### 系统管理（仅管理员）
- 用户 CRUD、角色 CRUD、菜单 CRUD、权限 CRUD
- 角色分配菜单、角色分配权限

## 项目结构

```
PowerTeamManagement/
├── backend/                    # 后端
│   ├── config/                 # 配置
│   ├── database/               # 数据库
│   ├── handlers/               # 处理器
│   ├── middleware/             # 中间件
│   ├── models/                 # 数据模型
│   ├── routes/                 # 路由
│   ├── utils/                  # 工具函数
│   ├── main.go                 # 入口
│   ├── .env                    # 环境变量
│   └── go.mod                  # Go 模块
└── frontend/                   # 前端
    ├── src/
    │   ├── components/         # 组件
    │   ├── pages/              # 页面
    │   ├── utils/              # 工具函数
    │   ├── App.jsx             # 主应用
    │   ├── main.jsx            # 入口
    │   └── index.css           # 样式
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

## 数据模型

- **User**: 用户信息
- **Role**: 角色信息
- **Menu**: 菜单信息
- **Permission**: 权限信息
- **Organization**: 组织架构
- **Customer**: 客户信息
- **Contact**: 联系人信息
- **Opportunity**: 业务机会
- **DailyReport**: 日报

## 业务机会状态

| 状态值 | 显示名称 |
|--------|----------|
| new | 新机会 |
| initial_contact | 初步接触中 |
| requirement_analysis | 需求分析中 |
| negotiation | 协商方案中 |
| commercial_negotiation | 商业谈判中 |
| completed | 已完成 |
| lost | 已流失 |

## 常见问题

### 1. 数据库连接失败
确保 MySQL 服务已启动，检查 `.env` 文件中的数据库配置。

### 2. 前端无法访问后端
检查后端是否正常运行，Vite 代理配置在 `vite.config.js` 中。

### 3. 登录失败
确保数据库已创建种子数据，使用默认账号登录。

## License

MIT
