# 大学生学业规划咨询服务平台管理系统

一个基于 **Golang + React** 的全栈管理系统，用于大学生学业规划咨询服务管理。

## 技术栈

### 后端
- Golang 1.21
- Gin Web Framework
- GORM (MySQL)
- JWT 认证
- CORS 中间件

### 前端
- React 18
- Vite
- Ant Design 5
- React Router 6
- Axios
- Day.js

## 功能模块

### 管理员
- 系统用户管理：管理员信息新增、删除、密码修改
- 学生管理：列表查询、修改、删除、查看详情、审核
- 服务管理：服务信息增删改查、多条件查询
- 预约服务管理：预约信息列表查询、修改、删除、查看详情
- 学业规划知识管理：增删改查、多条件查询、附件下载
- 留言管理：列表查询、回复和删除

### 学生
- 基本功能：登录、注册、退出
- 个人资料管理：查看、修改个人信息
- 预约服务管理：列表查询、多条件搜索、修改、取消
- 网站首页：导航栏、轮播图、站内新闻、会员风采
- 服务信息：列表查询、详情查看、预约操作
- 学业规划知识：列表查询、详情查看、附件下载
- 在线留言：发布留言

## 项目结构

```
CollegeStudentsAcademic/
├── backend/                    # 后端
│   ├── controllers/           # 控制器
│   │   ├── admin_controller.go
│   │   ├── student_controller.go
│   │   ├── service_controller.go
│   │   ├── appointment_controller.go
│   │   ├── knowledge_controller.go
│   │   ├── message_controller.go
│   │   └── home_controller.go
│   ├── database/              # 数据库
│   │   ├── db.go
│   │   └── init.sql
│   ├── middleware/            # 中间件
│   │   └── auth.go
│   ├── models/                # 数据模型
│   │   └── models.go
│   ├── config/                # 配置
│   │   └── config.go
│   ├── utils/                 # 工具函数
│   │   ├── response.go
│   │   ├── jwt.go
│   │   └── hash.go
│   ├── uploads/               # 上传目录
│   ├── main.go
│   ├── go.mod
│   └── .env                   # 环境变量
│
└── frontend/                  # 前端
    ├── src/
    │   ├── pages/
    │   │   ├── admin/         # 管理员页面
    │   │   │   ├── Login.jsx
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── AdminUsers.jsx
    │   │   │   ├── StudentManagement.jsx
    │   │   │   ├── ServiceManagement.jsx
    │   │   │   ├── AppointmentManagement.jsx
    │   │   │   ├── KnowledgeManagement.jsx
    │   │   │   └── MessageManagement.jsx
    │   │   └── student/       # 学生页面
    │   │       ├── Login.jsx
    │   │       ├── Register.jsx
    │   │       ├── Home.jsx
    │   │       ├── Services.jsx
    │   │       ├── ServiceDetail.jsx
    │   │       ├── Knowledge.jsx
    │   │       ├── KnowledgeDetail.jsx
    │   │       ├── Profile.jsx
    │   │       ├── MyAppointments.jsx
    │   │       └── MyMessages.jsx
    │   ├── layouts/           # 布局组件
    │   │   ├── AdminLayout.jsx
    │   │   └── StudentLayout.jsx
    │   ├── utils/             # 工具函数
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## 安装和运行

### 1. 数据库准备

确保已安装 MySQL，然后执行 SQL 脚本：

```bash
# 方法1: 直接执行 SQL 文件
mysql -u root -p < backend/database/init.sql

# 方法2: 手动创建
CREATE DATABASE college_academic DEFAULT CHARACTER SET utf8mb4;
```

### 2. 配置后端环境变量

修改 `backend/.env` 文件（默认配置已创建）：

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=college_academic
JWT_SECRET=college-academic-jwt-secret-key-2026
PORT=8080
```

### 3. 运行后端

```bash
cd backend

# 安装依赖
go mod tidy

# 运行
go run main.go
```

后端将运行在 `http://localhost:8080`

首次启动时，GORM 会自动创建数据库表，并初始化默认管理员账号。

### 4. 运行前端

```bash
cd frontend

# 安装依赖
npm install

# 运行开发服务器
npm run dev
```

前端将运行在 `http://localhost:3000`

## 默认账号

### 管理员
- 用户名: `admin`
- 密码: `admin123`
- 登录地址: `http://localhost:3000/admin/login`

### 学生
- 学生需要先注册，然后由管理员审核通过后才能登录
- 学生登录地址: `http://localhost:3000/login`

## API 接口

### 公共接口
- `GET /api/home` - 获取首页数据
- `GET /api/services` - 获取服务列表
- `GET /api/services/:id` - 获取服务详情
- `GET /api/knowledge` - 获取知识列表
- `GET /api/knowledge/:id` - 获取知识详情
- `GET /api/knowledge/:id/download` - 下载附件

### 管理员接口 (`/api/admin/*`)
- `POST /admin/login` - 登录
- `GET /admin/stats` - 统计数据
- `GET/POST /admin/admins` - 管理员列表/新增
- `DELETE /admin/admins/:id` - 删除管理员
- `GET /admin/students` - 学生列表
- `POST /admin/students/:id/audit` - 审核学生
- `GET/POST/PUT/DELETE /admin/services` - 服务管理
- `GET/POST/PUT/DELETE /admin/appointments` - 预约管理
- `GET/POST/PUT/DELETE /admin/knowledge` - 知识管理
- `GET /admin/messages` - 留言列表
- `POST /admin/messages/:id/reply` - 回复留言

### 学生接口 (`/api/student/*`)
- `POST /student/register` - 注册
- `POST /student/login` - 登录
- `GET/PUT /student/profile` - 个人资料
- `POST /student/password` - 修改密码
- `GET/POST/PUT/DELETE /student/appointments` - 预约管理
- `GET/POST /student/messages` - 留言管理

## 功能特性

- ✅ JWT 身份认证
- ✅ 角色权限控制 (管理员/学生)
- ✅ 学生注册审核机制
- ✅ 服务预约系统
- ✅ 知识库管理（支持附件下载）
- ✅ 在线留言与回复
- ✅ 响应式前端界面
- ✅ 完善的 CRUD 操作
- ✅ 多条件查询和分页
- ✅ 管理员统计仪表盘
