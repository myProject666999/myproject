# 网上求职招聘管理系统

基于 **Golang + React 开发的网上求职招聘管理系统，支持管理员、招聘人员、用户三种角色。

## 功能特性

### 管理员
- 系统管理：管理员信息的增删改查，密码修改
- 人员信息管理：招聘人员的增删改查，应聘人员信息的列表查询，删除
- 职位管理：职位类型的增删改查，招聘信息的列表查询，删除
- 练习题管理：练习题的增删改查，练习题信息对应用户前台的答题页面
- 资讯管理：资讯信息的增删改查，多条件搜索查询

### 招聘人员
- 个人中心：个人信息的查看和修改，密码修改
- 职位管理：职位类型的增删改查，招聘信息的增删改查
- 查看投递简历：投递简历列表查询，面试结果操作，面试通过和不通过
- 收藏简历：简历收藏列表查询，查看简历详情，取消收藏

### 用户
- 基本功能：登录，注册，退出，密码修改
- 网站首页：全局搜索，职位类型导航，热招职位列表展示
- 职位：职位列表，职位详情
- 在线答题：在线练习，答题提交
- 资讯：资讯列表，资讯详情
- 面试评价：发布评价信息
- 我的简历：在线简历编辑，下载简历
- 我投递的简历：投递列表，面试通知

## 技术栈

### 后端
- **Golang** - 编程语言
- **Gin** - Web 框架
- **GORM** - ORM 框架
- **MySQL** - 数据库
- **JWT** - 身份认证
- **CORS** - 跨域处理

### 前端
- **React 18** - 前端框架
- **React Router** - 路由管理
- **Ant Design 5** - UI 组件库
- **Axios** - HTTP 客户端

## 项目结构

```
OnlineJobRecruitment/
├── backend/           # 后端项目
│   ├── config/        # 配置文件
│   ├── controllers/   # 控制器
│   ├── database/  # 数据库连接和初始化
│   ├── middleware/ # 中间件
│   ├── models/     # 数据模型
│   ├── routes/     # 路由
│   ├── utils/      # 工具函数
│   ├── .env        # 环境变量
│   ├── go.mod      # Go 模块依赖
│   └── main.go     # 入口文件
└── frontend/          # 前端项目
    ├── public/        # 静态资源
    ├── src/           # 源代码
    │   ├── pages/     # 页面组件
    │   ├── services/  # API 服务
    │   ├── utils/     # 工具函数
    │   ├── App.js    # 路由配置
    │   └── index.js  # 入口文件
    └── package.json  # 项目配置
```

## 快速开始

### 环境要求

- Go 1.21+
- Node.js 16+
- MySQL 5.7+

### 数据库准备

1. 创建数据库：

```sql
CREATE DATABASE job_recruitment CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 后端配置

1. 进入后端目录：

```bash
cd backend
```

2. 复制并修改环境变量配置文件 `.env`：

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=job_recruitment
JWT_SECRET=your_secret_key_here
PORT=8080
```

3. 安装依赖：

```bash
go mod download
```

4. 启动后端服务：

```bash
go run main.go
```

后端服务将在 http://localhost:8080 启动

### 前端配置

1. 进入前端目录：

```bash
cd frontend
```

2. 安装依赖：

```bash
npm install
```

3. 启动开发服务器：

```bash
npm start
```

前端开发服务器将在 http://localhost:3000 启动

## 默认账号

系统启动时会自动创建以下默认账号：

### 管理员
- 用户名：admin
- 密码：admin123

### 招聘人员
- 用户名：recruiter
- 密码：recruiter123

### 用户
- 可通过注册页面自行注册

## API 接口

### 认证接口
- POST /api/login - 用户登录
- POST /api/register - 用户注册

### 公共接口
- GET /api/job-types - 获取职位类型列表
- GET /api/jobs - 获取职位列表
- GET /api/jobs/:id - 获取职位详情
- GET /api/news - 获取资讯列表
- GET /api/news/:id - 获取资讯详情
- GET /api/exercises - 获取练习题列表
- GET /api/reviews - 获取评价列表

### 用户接口 (需要登录)
- GET /api/user - 获取当前用户信息
- PUT /api/user/profile - 更新个人信息
- PUT /api/user/password - 修改密码
- GET /api/resume/my - 获取我的简历
- POST/PUT /api/resume - 保存简历
- POST /api/applications - 投递简历
- GET /api/applications/my - 获取我的投递记录
- POST /api/exercises/submit - 提交练习题答案
- POST /api/reviews - 发布评价
- GET /api/reviews/my - 获取我的评价

### 管理员接口
- GET /api/admin/stats - 获取系统统计数据
- GET/POST/PUT/DELETE /api/admin/admins - 管理员管理
- GET/POST/PUT/DELETE /api/admin/recruiters - 招聘人员管理
- GET/DELETE /api/admin/users - 应聘人员管理
- GET/POST/PUT/DELETE /api/admin/job-types - 职位类型管理
- GET/DELETE /api/admin/jobs - 职位管理
- GET/POST/PUT/DELETE /api/admin/exercises - 练习题管理
- GET/POST/PUT/DELETE /api/admin/news - 资讯管理
- DELETE /api/admin/reviews/:id - 删除评价

### 招聘人员接口
- GET/POST/PUT/DELETE /api/recruiter/job-types - 职位类型管理
- GET/POST/PUT/DELETE /api/recruiter/jobs - 职位管理
- GET /api/recruiter/applications - 查看投递简历
- GET /api/recruiter/resumes/:id - 查看简历详情
- PUT /api/recruiter/applications/:id/status - 更新投递状态
- POST/GET/DELETE /api/recruiter/favorites - 收藏简历

## 开发说明

本项目已完成核心功能开发，包括：

1. 用户认证系统 - 支持三种角色登录、注册、权限控制
2. 管理员后台 - 完整的 CRUD 管理功能
3. 招聘人员功能 - 职位发布、简历查看、面试管理
4. 用户端 - 职位浏览、简历编辑、在线投递

如需扩展功能，可根据需求继续完善。
