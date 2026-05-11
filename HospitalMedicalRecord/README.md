# 医院病历管理系统

一个基于 Golang + React 的医院病历管理系统

## 技术栈

- **后端**: Go (Gin, GORM, JWT)
- **前端**: React 18 + React Router + Ant Design 5
- **数据库**: MySQL
- **认证**: JWT (JSON Web Token)

## 功能模块

### 角色权限
- **管理员**: 用户管理（增删改查、模糊搜索、密码重置）、修改个人密码
- **医生**: 医护人员管理、病人管理、病历管理、药品管理
- **护士**: 医护人员管理、病人管理、病历管理、药品管理

### 功能列表
1. **系统用户管理
   - 用户增删改查
   - 按用户名、姓名、电话模糊搜索
   - 密码修改和重置
   - 角色管理

2. **医护人员管理**
   - 医生信息管理（工号、科室、职称、专长）
   - 护士信息管理（工号、科室、职称）

3. **病人管理**
   - 病人信息管理（病历号、姓名、性别、出生日期、身份证、联系方式等）
   - 多条件查询

4. **病历管理**
   - 病历信息管理（主诉症状、检查结果、诊断、治疗方案、处方等）

5. **药品管理**
   - 药品信息管理（编号、名称、规格、剂型、分类、价格、库存等）
   - 多条件查询
   - 药品图片上传

## 项目结构

```
HospitalMedicalRecord/
├── backend/                    # 后端项目
│   ├── config/             # 配置文件
│   ├── controllers/        # 控制器
│   ├── database/         # 数据库相关
│   ├── middleware/      # 中间件
│   ├── models/           # 数据模型
│   ├── routes/           # 路由
│   ├── utils/            # 工具函数
│   ├── .env             # 环境变量配置
│   ├── go.mod           # Go 依赖
│   └── main.go          # 入口文件
├── frontend/               # 前端项目
│   ├── src/
│   │   ├── components/   # 组件
│   │   ├── pages/        # 页面
│   │   ├── utils/        # 工具函数
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 快速开始

### 1. 准备环境

确保你需要安装：
- Go 1.21+
- Node.js 18+
- MySQL 5.7+

### 2. 数据库初始化

1. 创建数据库并执行初始化脚本：

```bash
mysql -u root -p
```

然后在 MySQL 中执行：

```sql
source /path/to/HospitalMedicalRecord/backend/database/init.sql
```

或者直接复制 `backend/database/init.sql` 中的内容到 MySQL 客户端执行。

### 3. 配置数据库连接

编辑 `backend/.env` 文件，修改数据库连接信息：

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hospital_medical_record
```

### 4. 运行后端

```bash
cd backend
go mod tidy
go run main.go
```

后端服务将在 http://localhost:8080 启动

### 5. 运行前端

```bash
cd frontend
npm install
npm run dev
```

前端开发服务器将在 http://localhost:3000 启动

## 默认账户

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |
| doctor01 | admin123 | 医生 |
| nurse01 | admin123 | 护士 |

## API 接口说明

### 认证接口
- POST `/api/login` - 用户登录

### 用户管理（管理员权限）
- GET `/api/users` - 获取用户列表
- GET `/api/users/:id` - 获取用户详情
- POST `/api/users` - 创建用户
- PUT `/api/users/:id` - 更新用户
- DELETE `/api/users/:id` - 删除用户
- POST `/api/users/:id/reset-password` - 重置密码

### 通用接口
- GET `/api/me` - 获取当前用户信息
- PUT `/api/change-password` - 修改当前用户密码

### 医生管理
- GET `/api/doctors` - 获取医生列表
- GET `/api/doctors/:id` - 获取医生详情
- POST `/api/doctors` - 创建医生
- PUT `/api/doctors/:id` - 更新医生
- DELETE `/api/doctors/:id` - 删除医生

### 护士管理
- GET `/api/nurses` - 获取护士列表
- GET `/api/nurses/:id` - 获取护士详情
- POST `/api/nurses` - 创建护士
- PUT `/api/nurses/:id` - 更新护士
- DELETE `/api/nurses/:id` - 删除护士

### 病人管理
- GET `/api/patients` - 获取病人列表
- GET `/api/patients/:id` - 获取病人详情
- POST `/api/patients` - 创建病人
- PUT `/api/patients/:id` - 更新病人
- DELETE `/api/patients/:id` - 删除病人

### 病历管理
- GET `/api/medical-records` - 获取病历列表
- GET `/api/medical-records/:id` - 获取病历详情
- POST `/api/medical-records` - 创建病历
- PUT `/api/medical-records/:id` - 更新病历
- DELETE `/api/medical-records/:id` - 删除病历

### 药品管理
- GET `/api/medicines` - 获取药品列表
- GET `/api/medicines/:id` - 获取药品详情
- POST `/api/medicines` - 创建药品
- PUT `/api/medicines/:id` - 更新药品
- DELETE `/api/medicines/:id` - 删除药品
- POST `/api/medicines/upload-image` - 上传药品图片

## 注意事项

1. 初始 SQL 脚本中的测试数据密码为示例，实际使用时请使用 bcrypt 生成正确的加密密码
2. 生产环境中请修改 JWT_SECRET 为安全的随机字符串
3. 生产环境中请配置正确的 CORS 配置，不要使用 `*`
4. 建议使用 HTTPS 部署生产环境
