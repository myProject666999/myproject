# 在线编程评测系统 (Online Judge)

一个基于 Spring Boot + Vue3 + MySQL + Redis 的在线编程评测系统，支持 C/C++/Java/Python 多语言判题，具有题库管理、竞赛、排行榜等功能。

## 项目结构

```
OnlineProgrammingEvaluation/
├── online-judge-backend/     # 后端 (Spring Boot 3.x)
│   ├── src/main/java/com/oj/
│   │   ├── common/          # 通用类 (Result, 异常处理, 常量)
│   │   ├── config/          # 配置类 (Security, Redis, MyBatis, 异步)
│   │   ├── controller/      # 控制器层
│   │   ├── dto/             # 数据传输对象
│   │   ├── entity/          # 实体类
│   │   ├── judge/           # 判题模块 (沙箱, 任务处理)
│   │   ├── mapper/          # MyBatis-Plus Mapper
│   │   ├── security/        # 安全认证 (JWT过滤器)
│   │   ├── service/         # 服务层
│   │   ├── util/            # 工具类 (JWT, Redis)
│   │   └── OnlineJudgeApplication.java
│   └── src/main/resources/
│       ├── application.yml  # 应用配置
│       └── sql/             # 数据库初始化脚本
│
├── online-judge-frontend/    # 前端 (Vue3 + Vite + Element Plus)
│   ├── src/
│   │   ├── views/           # 页面组件
│   │   │   ├── admin/      # 后台管理页面
│   │   │   ├── Login.vue
│   │   │   ├── ProblemList.vue
│   │   │   ├── ProblemDetail.vue
│   │   │   └── ...
│   │   ├── router/          # 路由配置
│   │   ├── stores/          # Pinia 状态管理
│   │   ├── styles/          # 样式文件
│   │   └── utils/           # 工具 (Axios封装)
│   └── package.json
│
└── sql/                      # 数据库脚本
    ├── init.sql             # 完整初始化脚本 (含DROP)
    └── schema.sql           # 安全初始化脚本 (无DROP, 可重复执行)
```

## 技术栈

### 后端
- **框架**: Spring Boot 3.2.5
- **数据库**: MySQL 8.0+
- **中间件**: Redis (缓存, 消息队列)
- **ORM**: MyBatis-Plus 3.5.5
- **安全**: Spring Security + JWT
- **API文档**: Knife4j (Swagger)
- **工具**: Hutool, Lombok, Docker-Java
- **JDK**: Java 17+

### 前端
- **框架**: Vue 3.4
- **构建工具**: Vite 5.2
- **UI组件库**: Element Plus 2.6
- **路由**: Vue Router 4.3
- **状态管理**: Pinia 2.1
- **HTTP客户端**: Axios 1.6
- **代码编辑器**: Monaco Editor

## 核心功能

1. **题库管理**
   - 题目创建、编辑、删除
   - 难度标签 (简单/中等/困难)
   - 测试用例管理 (输入/期望输出)
   - 标签分类

2. **在线代码提交与判题**
   - 支持 C/C++/Java/Python
   - 编译运行沙箱隔离
   - 判题结果: AC/WA/TLE/MLE/RE/CE/SE
   - 运行时间、内存占用统计

3. **用户系统**
   - 注册/登录 (JWT认证)
   - 个人中心 (AC统计、通过率)
   - 管理员权限

4. **竞赛系统**
   - 竞赛创建与管理
   - 密码保护竞赛
   - 实时排行榜 (罚时计算)
   - 标准赛/CF赛

5. **排行榜**
   - 基于 Redis ZSet 的实时排名
   - 积分 (初始1500)
   - 通过数、提交数、通过率

## 快速开始

### 环境要求
- JDK 17+
- Node.js 18+
- MySQL 8.0+
- Redis 6.0+

### 1. 数据库配置

启动 MySQL 服务，创建数据库：

```sql
CREATE DATABASE online_judge DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

导入数据库脚本（手动或通过Spring Boot自动初始化）：

```bash
# 手动导入
mysql -u root -p123456 online_judge < sql/schema.sql
```

### 2. 启动 Redis

```bash
redis-server
```

### 3. 启动后端

```bash
cd online-judge-backend
mvn spring-boot:run
```

后端服务运行在 http://127.0.0.1:8080/api

API文档地址: http://127.0.0.1:8080/api/doc.html

### 4. 启动前端

```bash
cd online-judge-frontend
npm install
npm run dev
```

前端服务运行在 http://127.0.0.1:5173

## 数据库配置

在 `online-judge-backend/src/main/resources/application.yml` 中配置数据库连接：

```yaml
spring:
  datasource:
    url: jdbc:mysql://127.0.0.1:3306/online_judge?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: "123456"
  data:
    redis:
      host: 127.0.0.1
      port: 6379
      password:
```

## 数据库表结构

| 表名 | 说明 |
|------|------|
| user | 用户表 |
| problem | 题目表 |
| tag | 标签表 |
| problem_tag | 题目-标签关联 |
| problem_case | 题目测试用例 |
| submission | 提交记录 |
| contest | 竞赛表 |
| contest_problem | 竞赛-题目关联 |
| contest_user | 竞赛-用户关联 |
| user_problem_ac | 用户AC记录 |
| announcement | 公告表 |
| system_config | 系统配置 |

## 判题状态码

| 状态 | 说明 |
|------|------|
| 0 | Pending (等待) |
| 1 | Judging (判题中) |
| 2 | Accepted (通过) |
| 3 | Wrong Answer (答案错误) |
| 4 | Time Limit Exceeded (超时) |
| 5 | Memory Limit Exceeded (超内存) |
| 6 | Runtime Error (运行错误) |
| 7 | Compile Error (编译错误) |
| 8 | System Error (系统错误) |

## 功能路由

### 公开页面
- `/problem/list` - 题目列表
- `/problem/detail/:id` - 题目详情
- `/submission/list` - 提交记录
- `/contest/list` - 竞赛列表
- `/contest/detail/:id` - 竞赛详情
- `/ranklist` - 排行榜
- `/login` - 登录
- `/register` - 注册

### 需登录
- `/user/profile` - 个人中心
- `/submission/detail/:id` - 提交详情

### 管理员页面
- `/admin/problem/list` - 题库管理
- `/admin/problem/create` - 创建题目
- `/admin/problem/edit/:id` - 编辑题目
- `/admin/user/list` - 用户管理
- `/admin/contest/list` - 竞赛管理
- `/admin/announcement/list` - 公告管理
- `/admin/system/config` - 系统设置

## API 接口

### 用户模块
- `POST /api/user/login` - 登录
- `POST /api/user/register` - 注册
- `GET /api/user/info` - 获取当前用户信息
- `PUT /api/user/update` - 更新用户信息

### 题目模块
- `GET /api/problem/list` - 题目列表
- `GET /api/problem/detail/:id` - 题目详情
- `POST /api/problem/create` - 创建题目 (管理员)
- `PUT /api/problem/update` - 更新题目 (管理员)
- `DELETE /api/problem/delete/:id` - 删除题目 (管理员)

### 提交模块
- `POST /api/submission/submit` - 提交代码
- `GET /api/submission/list` - 提交记录列表
- `GET /api/submission/detail/:id` - 提交详情
- `GET /api/submission/mine` - 我的提交记录

### 竞赛模块
- `GET /api/contest/list` - 竞赛列表
- `GET /api/contest/detail/:id` - 竞赛详情
- `POST /api/contest/create` - 创建竞赛 (管理员)
- `POST /api/contest/join/:id` - 加入竞赛
- `GET /api/contest/rank/:id` - 竞赛排行榜

### 排行榜
- `GET /api/ranklist/list` - 排行榜
- `POST /api/ranklist/refresh` - 刷新排行榜

## 判题流程

1. 用户提交代码
2. 提交记录入库，状态设为 Pending
3. 提交ID入 Redis 队列 (oj:submit:queue)
4. 判题任务处理器从队列获取任务
5. 状态更新为 Judging
6. 根据语言编译代码
7. 逐个运行测试用例
8. 比对输出，计算得分
9. 回写判题结果到数据库
10. 通过 Redis 发布消息通知前端

## 注意事项

1. **判题沙箱**: 当前版本使用本地进程执行代码，生产环境建议使用 Docker 容器隔离
2. **安全限制**: 请确保服务器上的 gcc、g++、javac、python3 等编译器已安装
3. **资源限制**: 可在 application.yml 中调整时间和内存限制
4. **数据备份**: 建议定期备份数据库和 Redis 数据

## 许可证

MIT License
