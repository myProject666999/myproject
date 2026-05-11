# 学生综合素质测评管理系统

一个基于Golang + React的学生综合素质测评管理系统

## 项目概述

这是一个完整的学生综合素质测评管理系统，集成了综合评测、学生成绩、学生信息等功能于一体的管理系统。

## 技术栈

### 后端
- **Golang 1.19+
- **Gin Web框架
- **Gorm ORM
- **JWT 身份验证
- **MySQL 数据库
- **Bcrypt 密码加密

### 前端
- **React 18
- **Ant Design 5
- **React Router 6
- **Axios HTTP客户端
- **Dayjs 日期处理

## 功能模块

### 角色管理
- **管理员**：拥有所有权限，支持动态权限配置
- **教师**：个人资料管理、学生成绩管理、教师信息管理、学生信息管理、奖惩管理、能力加分管理、综合素质测评管理、留言板管理
- **学生**：个人资料管理、学生成绩查看、留言板管理

### 功能模块
1. **个人资料管理**：个人资料信息的查看与修改，密码修改
2. **奖惩管理**：奖惩信息的增删改查，多条件查询
3. **留言板管理**：留言信息列表查询，留言详情查看，留言回复
4. **能力加分管理**：能力加分信息的增删改查，多条件查询
5. **综合素质测评管理**：测评信息的增删改查
6. **学生成绩管理**：学生成绩信息的增删改查
7. **教师信息管理**：教师信息的增删改查
8. **学生信息管理**：学生信息的增删改查
9. **权限配置**：动态权限配置（仅管理员）

## 项目结构

```
StudentComprehensiveQualityEvaluation/
├── backend/                 # 后端项目
│   ├── config/               # 配置文件
│   │   ├── config.go      # 配置加载
│   │   └── database.go    # 数据库连接
│   ├── controllers/          # 控制器层
│   │   ├── auth.go         # 认证控制器
│   │   ├── teacher.go      # 教师管理
│   │   ├── student.go    # 学生管理
│   │   ├── grade.go      # 成绩管理
│   │   ├── reward.go     # 奖惩管理
│   │   ├── ability.go   # 能力加分
│   │   ├── evaluation.go # 综合素质测评
│   │   ├── message.go    # 留言板
│   │   └── permission.go # 权限管理
│   ├── middlewares/        # 中间件
│   │   └── auth.go       # 认证中间件
│   ├── models/           # 数据模型
│   │   └── models.go   # 所有模型定义
│   ├── routes/           # 路由配置
│   │   └── routes.go
│   ├── utils/            # 工具函数
│   │   └── jwt.go      # JWT工具
│   ├── sql/             # SQL脚本
│   │   └── init.sql   # 数据库初始化
│   ├── .env            # 环境变量
│   ├── .env.example     # 环境变量示例
│   ├── go.mod          # Go模块
│   └── main.go         # 入口文件
└── frontend/           # 前端项目
    ├── public/          # 静态资源
    │   └── index.html
    ├── src/
    │   ├── components/  # 公共组件
    │   │   └── MainLayout.js # 主布局
    │   ├── pages/       # 页面组件
    │   │   ├── Login.js        # 登录页
    │   │   ├── Dashboard.js    # 仪表板
    │   │   ├── Profile.js      # 个人资料
    │   │   ├── ChangePassword.js # 修改密码
    │   │   ├── TeacherList.js  # 教师管理
    │   │   ├── StudentList.js # 学生管理
    │   │   ├── GradeList.js   # 成绩管理
    │   │   ├── RewardList.js  # 奖惩管理
    │   │   ├── AbilityList.js # 能力加分
    │   │   ├── EvaluationList.js # 综合素质测评
    │   │   ├── MessageList.js  # 留言板
    │   │   └── PermissionList.js # 权限管理
    │   ├── utils/          # 工具函数
    │   │   └── request.js # HTTP请求
    │   ├── App.js         # 应用入口
    │   ├── index.js       # React入口
    │   └── index.css    # 全局样式
    └── package.json    # 项目配置
```

## 快速开始

### 环境要求
- Go 1.19+
- Node.js 16+
- MySQL 5.7+

### 1. 数据库初始化

```bash
# 登录MySQL
mysql -u root -p

# 执行初始化脚本
source /path/to/backend/sql/init.sql
```

或者使用MySQL客户端导入 `backend/sql/init.sql` 文件。

### 2. 后端启动

```bash
cd backend

# 复制环境变量配置
cp .env.example .env

# 修改 .env 文件，配置数据库连接信息

# 安装依赖
go mod tidy

# 启动后端服务
go run main.go
```

后端服务将在 http://localhost:8080 启动

### 3. 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 启动前端开发服务器
npm start
```

前端服务将在 http://localhost:3000 启动

## 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | 123456 |
| 教师 | teacher01 | 123456 |
| 学生 | student01 | 123456 |

## API 接口

### 认证接口
- `POST /api/login` - 用户登录
- `GET /api/user/me` - 获取当前用户信息
- `PUT /api/user/profile` - 更新个人资料
- `PUT /api/user/password` - 修改密码

### 业务接口
- `GET/POST/PUT/DELETE /api/teachers/*` - 教师信息管理
- `GET/POST/PUT/DELETE /api/students/*` - 学生信息管理
- `GET/POST/PUT/DELETE /api/grades/*` - 成绩管理
- `GET/POST/PUT/DELETE /api/rewards/*` - 奖惩管理
- `GET/POST/PUT/DELETE /api/ability/*` - 能力加分管理
- `GET/POST/PUT/DELETE /api/evaluations/*` - 综合素质测评管理
- `GET/POST/PUT/DELETE /api/messages/*` - 留言板管理
- `GET/PUT/POST /api/permissions/*` - 权限管理（仅管理员）

## 权限说明

系统采用基于角色的动态权限控制：
- 每个模块有4种权限：查看、新增、修改、删除
- 管理员默认拥有所有权限
- 可通过"权限配置"页面动态调整各角色权限
- 权限配置保存在数据库中，实时生效

## 注意事项

1. 首次运行前请确保MySQL服务已启动
2. 请修改默认的JWT_SECRET
3. 生产环境请修改默认密码
4. 前端通过proxy配置代理到后端8080端口

## 开发说明

- 后端使用Gin框架，遵循RESTful API设计规范
- 前端使用Ant Design组件库，界面美观友好
- 支持分页查询、多条件搜索
- 所有接口都需要JWT认证（除登录外）
- 使用Gorm进行数据库操作，支持自动迁移
