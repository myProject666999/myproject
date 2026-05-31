# 在线学习社区 + 打卡组队

一个帮助学习者组队互相监督打卡坚持学习的全栈Web应用。

## 项目简介

学习者可以创建或加入学习小组，每日打卡记录学习进度，查看组内排行榜，互相督促坚持学习。

## 技术栈

- **后端**: Node.js + NestJS + TypeORM + JWT
- **前端**: React 18 + TypeScript + TailwindCSS + React Query
- **数据库**: MySQL 5.7+
- **缓存**: Redis (用于排行榜 ZSet 实现)

## 核心功能

### 学习小组
- 创建小组（设置名称、描述、分类、最大人数）
- 加入/退出小组
- 查看小组详情（成员、打卡记录、动态、目标、排行）

### 打卡功能
- 每日打卡（支持多个小组）
- 记录学习内容、时长、心情
- 自动计算连续打卡天数
- 打卡日历可视化展示

### 排行榜
- 全局排行榜（累计打卡天数）
- 小组内排行榜
- 连续打卡排行
- Redis ZSet 实现高性能排行

### 动态流
- 发布动态（可关联小组）
- 点赞/取消点赞
- 评论功能
- 关注的小组动态流

### 目标管理
- 创建学习目标
- 进度追踪
- 状态管理（进行中/已完成/已放弃）

### 个人中心
- 个人信息展示
- 打卡统计
- 学习成就
- 加入的小组

## 项目结构

```
OnlineLearningCommunity/
├── sql/
│   └── init.sql              # 数据库初始化脚本
├── backend/                   # NestJS 后端
│   ├── src/
│   │   ├── main.ts           # 入口文件
│   │   ├── app.module.ts     # 根模块
│   │   ├── common/           # 公共模块
│   │   │   └── guards/       # 守卫
│   │   └── modules/          # 业务模块
│   │       ├── auth/         # 认证模块
│   │       ├── user/         # 用户模块
│   │       ├── group/        # 小组模块
│   │       ├── checkin/      # 打卡模块
│   │       ├── post/         # 动态模块
│   │       ├── goal/         # 目标模块
│   │       ├── ranking/      # 排行榜模块
│   │       ├── notification/ # 通知模块
│   │       └── redis/        # Redis 模块
│   ├── package.json
│   └── .env                  # 环境配置
└── frontend/                  # React 前端
    ├── src/
    │   ├── main.tsx          # 入口文件
    │   ├── App.tsx           # 路由配置
    │   ├── layouts/          # 布局组件
    │   ├── components/       # 公共组件
    │   ├── pages/            # 页面组件
    │   ├── services/         # API 服务
    │   └── store/            # 状态管理
    └── package.json
```

## 数据库设计

### 数据表
1. **users** - 用户表
2. **study_groups** - 学习小组表
3. **group_members** - 小组成员表
4. **check_ins** - 打卡记录表
5. **posts** - 动态/帖子表
6. **comments** - 评论表
7. **likes** - 点赞表
8. **goals** - 目标表
9. **notifications** - 通知表

### Redis Key 设计
- `ranking:global` - 全局排行榜 ZSet
- `ranking:group:{groupId}` - 小组排行榜 ZSet

## 快速开始

### 前置条件
- Node.js >= 16
- MySQL >= 5.7
- Redis >= 6.0

### 1. 数据库准备

数据库已初始化，连接配置：
- Host: 127.0.0.1
- Port: 3306
- Username: root
- Password: 123456
- Database: online_learning_community

如需重新导入数据库脚本：
```bash
mysql -h 127.0.0.1 -P 3306 -u root -p123456 --default-character-set=utf8mb4 -e "source sql/init.sql"
```

### 2. 启动后端服务

```bash
cd backend
npm install
npm run start:dev
```

后端服务将在 http://localhost:3000 启动

API 文档: http://localhost:3000/api

### 3. 启动前端服务

```bash
cd frontend
npm install
npm run dev
```

前端服务将在 http://localhost:5173 启动

### 4. 默认测试账号

数据库中已预置以下测试用户（密码均为 123456）：
- zhangsan / 张三
- lisi / 李四
- wangwu / 王五

## API 接口

### 认证接口
- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录
- `GET /auth/profile` - 获取当前用户信息

### 用户接口
- `GET /users/profile` - 获取个人资料
- `PUT /users/profile` - 更新个人资料
- `GET /users/:id` - 获取用户详情
- `GET /users/:id/stats` - 获取用户统计

### 小组接口
- `GET /groups` - 获取小组列表
- `POST /groups` - 创建小组
- `GET /groups/:id` - 获取小组详情
- `POST /groups/:id/join` - 加入小组
- `POST /groups/:id/leave` - 退出小组
- `GET /groups/my` - 获取我的小组

### 打卡接口
- `POST /checkins/group/:groupId` - 打卡
- `GET /checkins/mine` - 获取我的打卡记录
- `GET /checkins/group/:groupId` - 获取小组打卡记录
- `GET /checkins/today/group/:groupId` - 检查今日是否已打卡
- `GET /checkins/stats` - 获取打卡统计

### 动态接口
- `GET /posts/feed` - 获取动态流
- `GET /posts` - 获取帖子列表
- `POST /posts` - 发布帖子
- `GET /posts/:id` - 获取帖子详情
- `POST /posts/:id/comments` - 评论帖子
- `POST /posts/:id/like` - 点赞/取消点赞
- `DELETE /posts/:id` - 删除帖子

### 目标接口
- `GET /goals/mine` - 获取我的目标
- `POST /goals` - 创建目标
- `PUT /goals/:id/progress` - 更新进度
- `PUT /goals/:id/status` - 更新状态

### 排行榜接口
- `GET /rankings/global` - 全局排行榜
- `GET /rankings/group/:groupId` - 小组排行榜
- `GET /rankings/group/:groupId/streak` - 连续打卡排行
- `GET /rankings/my-rank` - 我的排名

### 通知接口
- `GET /notifications` - 获取通知列表
- `PUT /notifications/:id/read` - 标记已读
- `PUT /notifications/read-all` - 全部已读

## 关键实现细节

### 打卡连续天数计算
- 每次打卡时检查上次打卡日期
- 如果昨天打卡过，连续天数+1
- 如果昨天没打卡，连续天数重置为1
- 更新最长连续天数记录

### Redis 排行榜实现
- 使用 ZSet 数据结构存储排行榜
- 每次打卡时自动更新分数
- 支持按分数排序获取排名
- 缓存与数据库同步机制

### 动态流设计
- 显示已加入小组的动态
- 支持点赞、评论交互
- 实时更新动态列表

## 开发说明

### 后端开发
- 使用 TypeORM 实体定义数据库表
- 使用 JWT 进行用户认证
- 使用守卫保护需要登录的接口
- 服务层处理业务逻辑

### 前端开发
- 使用 Zustand 进行状态管理
- 使用 React Query 处理服务端状态
- 使用 TailwindCSS 进行样式开发
- 组件化设计，代码复用率高

## License

MIT
