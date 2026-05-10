# 应急互助信息管理系统

基于 Golang + React 的应急互助信息管理系统，集成紧急通知、物资信息、心理知识、招募报名等功能于一体。

## 功能特性

### 用户功能
- 登录、注册、退出
- 首页：主导航栏，轮播图，各模块推荐
- 紧急通知：搜索，列表展示，详情
- 物资信息：搜索，列表展示，详情，在线申请
- 招募信息：搜索，列表展示，详情，在线报名，赞/踩
- 个人中心：个人信息查看与修改
- 我的收藏列表

### 管理员功能
- 个人中心：个人信息查看与修改，密码修改
- 紧急通知管理：增删改查
- 用户管理：增删改查，头像修改
- 志愿者管理：增删改查，照片上传
- 求助信信息管理：列表查询，审核，统计报表
- 物资信息管理：增删改查，物资分配
- 物资申请管理：查询和审核
- 心理知识管理：增删改查
- 医疗救助管理：列表查询，详情，删除，审核
- 招募报名管理：查看与审核

## 技术栈

### 后端
- Golang 1.21+
- Gin Web Framework
- GORM (ORM)
- MySQL
- JWT Authentication
- CORS

### 前端
- React 18+
- React Router DOM
- Ant Design 5
- Axios
- Day.js

## 目录结构

```
EmergencyMutualAidInformation/
├── backend/                    # 后端项目
│   ├── config/                # 配置文件
│   ├── controllers/           # 控制器
│   ├── database/              # 数据库初始化
│   ├── middleware/            # 中间件
│   ├── models/                # 数据模型
│   ├── routes/                # 路由配置
│   ├── utils/                 # 工具函数
│   ├── go.mod
│   └── main.go                # 主入口
└── frontend/                   # 前端项目
    ├── public/
    ├── src/
    │   ├── components/        # 组件
    │   ├── pages/             # 页面
    │   ├── utils/             # 工具函数
    │   ├── App.jsx
    │   └── index.js
    └── package.json
```

## 安装与运行

### 前置要求
- Go 1.21+
- Node.js 16+
- MySQL 5.7+

### 后端配置

1. 创建数据库
```sql
CREATE DATABASE emergency_mutual_aid CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 进入后端目录并安装依赖
```bash
cd backend
go mod download
```

3. 配置环境变量（可选）
```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=root
export DB_PASSWORD=your_password
export DB_NAME=emergency_mutual_aid
export JWT_SECRET=your_secret_key
export PORT=8080
```

4. 运行后端服务
```bash
go run main.go
```

后端服务将在 http://localhost:8080 启动

### 前端配置

1. 进入前端目录并安装依赖
```bash
cd frontend
npm install
```

2. 运行前端开发服务器
```bash
npm start
```

前端服务将在 http://localhost:3000 启动

## 默认账户

系统首次启动时会自动创建默认管理员账户：
- 用户名：admin
- 密码：admin123

## API 文档

### 认证接口
- POST /api/auth/register - 用户注册
- POST /api/auth/login - 用户登录
- GET /api/auth/me - 获取当前用户信息

### 公共接口
- GET /api/notices - 紧急通知列表
- GET /api/notices/:id - 紧急通知详情
- GET /api/materials - 物资列表
- GET /api/materials/:id - 物资详情
- GET /api/knowledge - 心理知识列表
- GET /api/knowledge/:id - 心理知识详情
- GET /api/rumors - 辟谣列表
- GET /api/rumors/:id - 辟谣详情
- GET /api/recruitments - 招募列表
- GET /api/recruitments/:id - 招募详情
- POST /api/recruitments/:id/like - 点赞
- POST /api/recruitments/:id/dislike - 点踩

### 用户接口（需要登录）
- PUT /api/user/profile - 更新个人信息
- POST /api/user/apply-material - 申请物资
- POST /api/user/apply-recruitment - 报名招募
- GET /api/user/favorites - 收藏列表
- POST /api/user/favorites - 添加收藏
- DELETE /api/user/favorites/:id - 取消收藏

### 管理员接口（需要管理员权限）
- GET /api/admin/dashboard - 仪表盘统计
- PUT /api/admin/change-password - 修改密码
- GET /api/admin/users - 用户列表
- POST /api/admin/users - 创建用户
- PUT /api/admin/users/:id - 更新用户
- DELETE /api/admin/users/:id - 删除用户
- 以及更多管理接口...

## 数据库模型

- User - 用户表
- EmergencyNotice - 紧急通知表
- Material - 物资表
- PsychologicalKnowledge - 心理知识表
- Recruitment - 招募信息表
- Volunteer - 志愿者表
- HelpRequest - 求助信表
- Application - 物资申请表
- RecruitmentApplication - 招募报名表
- MedicalAid - 医疗救助表
- Favorite - 收藏表
- Rumor - 辟谣表

## 开发说明

### 后端开发
- 控制器放在 `controllers/` 目录
- 数据模型放在 `models/` 目录
- 路由配置在 `routes/routes.go`
- 中间件放在 `middleware/` 目录

### 前端开发
- 页面组件放在 `src/pages/` 目录
- 公共组件放在 `src/components/` 目录
- API 封装在 `src/utils/api.js`
- 使用 Ant Design 组件库

## 许可证

MIT License
