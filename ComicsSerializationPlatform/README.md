# 漫画连载平台

一个基于 Express + Vue + MySQL 的漫画连载平台，支持作者上传漫画章节，读者订阅追更。

## 功能特性

- 作品管理：创建、编辑、删除漫画作品
- 章节上传：支持多图片上传，自动排序
- 阅读器：图片懒加载，翻页交互，键盘快捷键
- 收藏追更：订阅漫画更新，收藏喜欢的作品
- 评论系统：作品评论，点赞互动

## 技术栈

### 后端
- Express.js
- MySQL
- JWT 认证
- Multer 文件上传

### 前端
- Vue 3
- Pinia 状态管理
- Vue Router
- Element Plus
- Axios

## 项目结构

```
ComicsSerializationPlatform/
├── server/                 # 后端服务
│   ├── config/            # 配置文件
│   ├── controllers/       # 控制器
│   ├── middleware/        # 中间件
│   ├── routes/           # 路由
│   ├── uploads/          # 上传文件目录
│   ├── server.js         # 入口文件
│   └── package.json
├── client/               # 前端应用
│   ├── src/
│   │   ├── api/         # API 请求
│   │   ├── components/  # 组件
│   │   ├── router/      # 路由配置
│   │   ├── stores/      # 状态管理
│   │   ├── styles/      # 样式文件
│   │   ├── views/       # 页面视图
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── database/            # 数据库脚本
│   └── init.sql
└── README.md
```

## 快速开始

### 1. 初始化数据库

```bash
# 登录 MySQL
mysql -u root -p

# 执行初始化脚本
source database/init.sql
```

### 2. 配置后端

```bash
cd server

# 安装依赖
npm install

# 修改 .env 文件配置数据库连接
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=comics_platform

# 启动服务
npm run dev
```

后端服务将在 http://localhost:3000 启动

### 3. 启动前端

```bash
cd client

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端应用将在 http://localhost:5173 启动

## 默认账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | 123456 | 管理员 |
| author1 | 123456 | 作者 |
| reader1 | 123456 | 读者 |

## API 文档

### 用户相关
- `POST /api/users/register` - 注册
- `POST /api/users/login` - 登录
- `GET /api/users/profile` - 获取用户信息
- `PUT /api/users/profile` - 更新用户信息

### 漫画相关
- `GET /api/comics` - 获取漫画列表
- `GET /api/comics/:id` - 获取漫画详情
- `POST /api/comics` - 创建漫画（需登录）
- `PUT /api/comics/:id` - 更新漫画（需登录）
- `DELETE /api/comics/:id` - 删除漫画（需登录）

### 章节相关
- `GET /api/chapters/comic/:comicId` - 获取章节列表
- `GET /api/chapters/comic/:comicId/chapter/:chapterId` - 获取章节内容
- `POST /api/chapters/comic/:comicId` - 创建章节（需登录）
- `PUT /api/chapters/:chapterId` - 更新章节（需登录）
- `DELETE /api/chapters/:chapterId` - 删除章节（需登录）

### 订阅相关
- `POST /api/subscriptions/toggle` - 切换订阅状态
- `GET /api/subscriptions` - 获取订阅列表
- `GET /api/subscriptions/check/:comicId` - 检查订阅状态

### 评论相关
- `GET /api/comments` - 获取评论列表
- `POST /api/comments` - 发表评论
- `DELETE /api/comments/:id` - 删除评论
- `POST /api/comments/:id/like` - 点赞评论

### 收藏相关
- `POST /api/favorites/toggle` - 切换收藏状态
- `GET /api/favorites` - 获取收藏列表
- `GET /api/favorites/check/:comicId` - 检查收藏状态

## 阅读器快捷键

| 按键 | 功能 |
|------|------|
| ← | 上一页 |
| → | 下一页 |
| F | 切换全屏 |
| Esc | 退出缩略图/全屏 |

## 许可证

MIT
