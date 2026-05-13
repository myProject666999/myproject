# 健身房会员与排课管理系统

## 项目概述

基于 SpringBoot + Vue 的健身房会员与排课管理系统，实现了会员卡管理、团体课排课预约、私教排课核销、教练业绩提成、闸机数据接入和续卡提醒等功能。

## 技术栈

### 后端
- Java 8
- SpringBoot 2.7.18
- Spring Security + JWT
- MyBatis Plus 3.5.3.1
- MySQL 8.x
- Hutool 工具库
- Lombok

### 前端
- Vue 3.4
- Vite 5.0
- Element Plus 2.4
- Vue Router 4.2
- Pinia 2.1
- Axios

## 功能模块

1. **用户管理与权限系统**
   - 角色：管理员、前台、教练、会员
   - 登录认证（JWT）
   - 用户增删改查
   - 状态管理

2. **会员卡管理**
   - 年卡、季卡、月卡、次卡
   - 购卡、续卡
   - 有效期管理
   - 次卡次数管理

3. **团体课排课**
   - 课程类型：瑜伽、动感单车、普拉提、搏击操、拉丁舞、杠铃操
   - 排课管理
   - 会员预约
   - 签到核销

4. **私教课程管理**
   - 私教课程创建
   - 私教排课
   - 课时核销
   - 剩余课时管理

5. **教练业绩与提成**
   - 业绩统计
   - 提成规则配置
   - 私教/团体课/销售提成

6. **入场闸机**
   - 入场/出场记录
   - 会员卡验证
   - 次卡自动扣减

7. **续卡提醒**
   - 自动生成提醒
   - 到期提醒
   - 次数不足提醒

## 项目结构

```
GymMembershipScheduling/
├── backend/                      # 后端项目
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/gym/membership/
│       │   ├── config/          # 配置类
│       │   ├── controller/      # 控制器
│       │   ├── dto/             # 数据传输对象
│       │   ├── entity/          # 实体类
│       │   ├── exception/       # 异常处理
│       │   ├── mapper/          # MyBatis Mapper
│       │   ├── security/        # 安全认证
│       │   ├── service/         # 业务逻辑
│       │   ├── vo/              # 视图对象
│       │   └── GymMembershipApplication.java
│       └── resources/
│           ├── application.yml
│           └── sql/schema.sql   # 数据库脚本
└── frontend/                    # 前端项目
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── api/                 # API 接口
        ├── assets/              # 静态资源
        ├── router/              # 路由配置
        ├── utils/               # 工具函数
        ├── views/               # 页面组件
        ├── App.vue
        └── main.js
```

## 快速开始

### 环境准备

1. JDK 8+
2. Maven 3.6+
3. MySQL 8.0+
4. Node.js 18+
5. npm 或 pnpm

### 数据库初始化

```sql
-- 1. 创建数据库
CREATE DATABASE gym_membership DEFAULT CHARACTER SET utf8mb4;

-- 2. 执行初始化脚本
-- backend/src/main/resources/sql/schema.sql
```

### 后端启动

1. 修改数据库配置（如需要）：
   `backend/src/main/resources/application.yml`

2. 编译并运行：
```bash
cd backend
mvn clean compile
mvn spring-boot:run
```

后端服务将在 `http://localhost:8080` 启动

### 前端启动

1. 安装依赖：
```bash
cd frontend
npm install
```

2. 开发模式运行：
```bash
npm run dev
```

前端服务将在 `http://localhost:3000` 启动

3. 生产构建：
```bash
npm run build
```

## 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | 123456 |

## API 接口

### 认证接口
- `POST /api/auth/login` - 登录
- `POST /api/auth/register` - 注册
- `GET /api/auth/roles` - 获取角色列表

### 用户管理
- `GET /api/users` - 用户列表
- `POST /api/users` - 新增用户
- `PUT /api/users/{id}` - 更新用户
- `DELETE /api/users/{id}` - 删除用户
- `GET /api/users/coaches` - 教练列表
- `GET /api/users/members` - 会员列表

### 会员卡管理
- `GET /api/membership-cards/types` - 卡类型列表
- `POST /api/membership-cards/purchase` - 购卡
- `GET /api/membership-cards` - 会员卡列表
- `POST /api/membership-cards/{id}/renew` - 续卡

### 团体课管理
- `GET /api/group-classes/types` - 课程类型
- `POST /api/group-classes/schedules` - 新增排课
- `GET /api/group-classes/schedules` - 排课列表
- `POST /api/group-classes/schedules/{id}/book` - 预约课程
- `POST /api/group-classes/bookings/{id}/check-in` - 签到

### 私教课程
- `POST /api/private-courses` - 新增私教课
- `GET /api/private-courses` - 私教课列表
- `POST /api/private-courses/schedules` - 私教排课
- `GET /api/private-courses/schedules` - 排课列表
- `POST /api/private-courses/schedules/{id}/check-in` - 签到核销

### 业绩管理
- `GET /api/performance` - 业绩列表
- `GET /api/performance/commission-rules` - 提成规则
- `PUT /api/performance/commission-rules/{id}` - 更新提成规则

### 闸机记录
- `POST /api/gate/access` - 闸机入场/出场
- `GET /api/gate/records` - 闸机记录

### 续卡提醒
- `GET /api/renewal-reminders` - 提醒列表
- `POST /api/renewal-reminders/generate` - 生成提醒

## 权限说明

| 接口/功能 | 管理员 | 前台 | 教练 | 会员 |
|-----------|--------|------|------|------|
| 用户管理 | ✓ | ✓ | ✗ | ✗ |
| 会员卡管理 | ✓ | ✓ | ✗ | ✗ |
| 团体课排课 | ✓ | ✓ | ✗ | ✗ |
| 团体课预约 | ✓ | ✓ | ✗ | ✓ |
| 私教课程 | ✓ | ✓ | ✓ | ✗ |
| 私教排课 | ✓ | ✓ | ✓ | ✗ |
| 业绩管理 | ✓ | ✓ | ✗ | ✗ |
| 闸机记录 | ✓ | ✓ | ✗ | ✗ |
| 续卡提醒 | ✓ | ✓ | ✗ | ✗ |

## 数据库表

1. `user` - 用户表
2. `role` - 角色表
3. `user_role` - 用户角色关联
4. `membership_card_type` - 会员卡类型
5. `membership_card` - 会员卡
6. `membership_card_order` - 购卡记录
7. `course_type` - 课程类型
8. `group_class_schedule` - 团体课排课
9. `group_class_booking` - 团体课预约
10. `private_course` - 私教课程
11. `private_schedule` - 私教排课
12. `coach_performance` - 教练业绩
13. `commission_rule` - 提成规则
14. `gate_record` - 闸机记录
15. `renewal_reminder` - 续卡提醒

## 注意事项

1. 默认管理员密码为 `123456`，登录后请及时修改
2. 数据库连接配置在 `application.yml` 中
3. JWT Token 有效期为 24 小时
4. 续卡提醒任务每天 9 点自动执行
5. 会员卡状态每天自动检查更新

## License

MIT
