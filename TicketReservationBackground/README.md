# 机票预订后台管理系统

一个基于Golang + React的完整机票预订系统，包含前台用户端和后台管理端。

## 技术栈

### 后端
- **Golang** - 编程语言
- **Gin** - Web框架
- **GORM** - ORM框架
- **MySQL** - 数据库
- **JWT** - 身份认证

### 前端
- **React** - JavaScript框架
- **Ant Design** - UI组件库
- **Redux Toolkit** - 状态管理
- **React Router** - 路由管理
- **Axios** - HTTP客户端

## 项目结构

```
TicketReservationBackground/
├── backend/                    # 后端代码
│   ├── main.go                 # 主入口文件
│   ├── go.mod                  # Go模块配置
│   ├── .env                    # 环境变量配置
│   ├── controllers/            # 控制器
│   │   ├── auth.go            # 认证相关
│   │   ├── flight.go          # 航班管理
│   │   ├── order.go           # 订单管理
│   │   ├── user.go            # 用户管理
│   │   └── comment.go         # 评论管理
│   ├── models/                # 数据模型
│   │   ├── user.go
│   │   ├── flight.go
│   │   ├── order.go
│   │   └── comment.go
│   ├── middleware/            # 中间件
│   │   └── auth.go            # JWT认证中间件
│   └── database/              # 数据库配置
│       ├── database.go
│       └── seed.go            # 测试数据种子
└── frontend/                   # 前端代码
    ├── package.json           # 依赖配置
    ├── public/                # 静态文件
    └── src/                   # 源码目录
        ├── index.js           # 入口文件
        ├── App.js             # 路由配置
        ├── index.css          # 全局样式
        ├── store/             # Redux Store
        │   ├── index.js
        │   └── slices/
        │       └── authSlice.js
        ├── services/          # API服务
        │   └── api.js
        └── pages/             # 页面组件
            ├── Login.js
            ├── Register.js
            ├── Home.js
            ├── FlightDetail.js
            ├── Booking.js
            ├── UserCenter.js
            ├── Comments.js
            └── admin/
                ├── Dashboard.js
                ├── Flights.js
                ├── Orders.js
                ├── Users.js
                └── Comments.js
```

## 功能模块

### 用户端功能
1. **用户认证** - 注册、登录、退出
2. **网站首页** - 轮播图、航班搜索、航班列表
3. **航班详情** - 查看航班详细信息
4. **在线订票** - 选择舱位、填写乘机人信息、提交订单
5. **用户中心** - 个人资料管理、订单查询
6. **留言评论** - 查看留言、发表评论

### 管理员端功能
1. **数据概览** - 航班、订单、用户、评论统计
2. **航班管理** - 航班列表、添加航班、编辑航班、删除航班
3. **订单管理** - 查看所有订单
4. **用户管理** - 查看用户列表、删除用户
5. **留言管理** - 查看所有留言、删除留言

## 快速开始

### 环境要求
- Go 1.21+
- Node.js 18+
- MySQL 5.7+

### 1. 创建数据库

```sql
CREATE DATABASE ticket_reservation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 配置后端

```bash
cd backend
go mod download
```

编辑 `.env` 文件，修改数据库连接信息：

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=ticket_reservation
JWT_SECRET=your_jwt_secret_key_here
PORT=8080
```

### 3. 启动后端

```bash
cd backend
go run main.go
```

后端服务将在 http://localhost:8080 启动

### 4. 安装前端依赖

```bash
cd frontend
npm install
```

### 5. 启动前端

```bash
cd frontend
npm start
```

前端应用将在 http://localhost:3000 启动

## 默认账号

### 管理员账号
- 用户名: `admin`
- 密码: `admin123`

## API接口

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 用户接口 (需要认证)
- `GET /api/user/profile` - 获取个人资料
- `PUT /api/user/profile` - 更新个人资料

### 航班接口
- `GET /api/flights` - 获取航班列表
- `GET /api/flights/:id` - 获取航班详情
- `POST /api/admin/flights` - 添加航班 (管理员)
- `PUT /api/admin/flights/:id` - 更新航班 (管理员)
- `DELETE /api/admin/flights/:id` - 删除航班 (管理员)

### 订单接口 (需要认证)
- `POST /api/orders` - 创建订单
- `GET /api/orders` - 获取我的订单
- `GET /api/orders/:id` - 获取订单详情
- `GET /api/admin/orders` - 获取所有订单 (管理员)

### 用户管理接口 (需要管理员权限)
- `GET /api/admin/users` - 获取用户列表
- `DELETE /api/admin/users/:id` - 删除用户

### 评论接口
- `GET /api/comments` - 获取评论列表
- `POST /api/comments` - 发表评论 (需要认证)
- `GET /api/admin/comments` - 获取所有评论 (管理员)
- `DELETE /api/admin/comments/:id` - 删除评论 (管理员)

## 注意事项

1. 首次启动后端时会自动创建数据库表并添加测试数据
2. 前端通过代理转发请求到后端，无需配置CORS
3. 生产环境请修改JWT_SECRET为安全的随机字符串
4. 数据库密码请根据实际情况修改

## 许可证

MIT License
