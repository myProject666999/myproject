# 学生推荐平台管理系统

基于 Golang + React 开发的学生推荐平台管理系统，集成用户端和管理后台。

## 技术栈

### 后端
- Golang 1.21+
- Gin Web 框架
- GORM ORM
- MySQL 数据库
- JWT 认证

### 前端
- React 18
- Ant Design 5
- React Router 6
- Axios

## 功能模块

### 用户端
- 登录、注册、退出
- 首页（导航栏、轮播图、课程推荐、新闻公告）
- 书籍（列表、详情、评论、收藏）
- 知识点（列表、详情、评论、收藏）
- 课程（列表、详情、评论、收藏）
- 留言（查看、在线留言）

### 管理后台
- 系统用户管理：管理员用户列表查询、新增、删除、密码修改
- 站内新闻：增删改查
- 校园趣事：增删改查
- 通知公告：增删改查
- 系统简介设置：系统简介、关于我们、联系方式设置
- 用户注册管理：前台用户注册记录的修改、删除、审核
- 留言管理：留言列表、删除、回复
- 变幻图管理：轮播图的增删改查
- 书籍管理：书籍信息的增删改查
- 知识点管理：知识点信息的增删改查、多条件查询、导出
- 课程管理：课程信息的增删改查、导出、评论管理
- 分类管理：分类信息的增删改查
- 需求管理：需求信息的查询、删除、在线审核
- 系统管理：数据备份

## 快速开始

### 前置条件
- Go 1.21+
- Node.js 16+
- MySQL 5.7+

### 数据库配置

1. 创建数据库
```sql
CREATE DATABASE student_recommendation DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 修改后端数据库配置
编辑 `backend/config/database.go`，修改数据库连接信息：
```go
dsn := "root:password@tcp(127.0.0.1:3306)/student_recommendation?charset=utf8mb4&parseTime=True&loc=Local"
```

### 启动后端服务

```bash
cd backend
go mod tidy
go run main.go
```

后端服务将在 http://localhost:8080 启动

### 启动前端服务

```bash
cd frontend
npm install
npm start
```

前端服务将在 http://localhost:3000 启动

## 默认账号

### 管理员账号
- 用户名：admin
- 密码：admin123

## 项目结构

```
StudentRecommendationPlatform/
├── backend/                    # 后端代码
│   ├── main.go                 # 入口文件
│   ├── go.mod
│   ├── config/                 # 配置文件
│   │   └── database.go         # 数据库配置
│   ├── models/                 # 数据模型
│   │   └── models.go
│   ├── controllers/            # 控制器
│   │   ├── auth.go             # 认证相关
│   │   ├── content.go          # 内容管理
│   │   ├── public.go           # 公共接口
│   │   └── admin.go            # 管理员接口
│   ├── middleware/             # 中间件
│   │   └── auth.go             # JWT认证
│   └── routes/                 # 路由
│       └── routes.go
└── frontend/                   # 前端代码
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── App.js              # 路由配置
        ├── layouts/            # 布局组件
        │   ├── UserLayout.js   # 用户端布局
        │   └── AdminLayout.js  # 管理端布局
        ├── pages/              # 页面组件
        │   ├── Login.js
        │   ├── Register.js
        │   ├── user/           # 用户端页面
        │   │   ├── Home.js
        │   │   ├── Books.js
        │   │   ├── BookDetail.js
        │   │   ├── Knowledge.js
        │   │   ├── KnowledgeDetail.js
        │   │   ├── Courses.js
        │   │   ├── CourseDetail.js
        │   │   └── Messages.js
        │   └── admin/          # 管理端页面
        │       ├── Login.js
        │       ├── Dashboard.js
        │       ├── AdminUsers.js
        │       ├── FrontUsers.js
        │       ├── NewsManage.js
        │       ├── CampusStories.js
        │       ├── Notices.js
        │       ├── SystemSettings.js
        │       ├── MessageManage.js
        │       ├── Carousels.js
        │       ├── BooksManage.js
        │       ├── KnowledgeManage.js
        │       ├── CoursesManage.js
        │       ├── Categories.js
        │       └── Demands.js
        └── utils/              # 工具函数
            └── request.js
```
