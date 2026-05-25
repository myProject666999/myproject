# 在线PPT/幻灯片分享系统

一个基于 Node.js(Express) + React + MySQL 的在线PPT/幻灯片分享平台。

## 功能特性

- 文档上传与在线转换（PPT/PPTX/PDF转图片）
- 在线翻页浏览幻灯片
- 文档分享、点赞、收藏、下载
- 分类浏览与搜索
- 用户个人中心

## 技术栈

- 后端：Node.js + Express + Sequelize
- 前端：React 18 + React Router + Ant Design
- 数据库：MySQL 5.7+

## 项目结构

```
OnlinePPTSharing/
├── backend/              # 后端项目
│   ├── config/           # 配置文件
│   ├── controllers/      # 控制器
│   ├── middleware/       # 中间件
│   ├── models/           # 数据模型
│   ├── routes/           # 路由
│   ├── services/         # 业务服务
│   └── server.js         # 服务入口
├── frontend/             # 前端项目
│   ├── src/
│   │   ├── api/          # API接口
│   │   ├── components/   # 公共组件
│   │   ├── pages/        # 页面组件
│   │   └── utils/        # 工具函数
│   └── vite.config.js    # Vite配置
└── database/             # 数据库脚本
    └── schema.sql        # 数据库结构
```

## 快速开始

### 1. 数据库配置

确保 MySQL 服务已启动，数据库脚本已导入（已完成）。

数据库连接信息：
- 主机：127.0.0.1
- 端口：3306
- 用户名：root
- 密码：123456

### 2. 启动后端服务

```bash
cd backend
npm install
npm run dev
```

后端服务将运行在 http://localhost:3001

### 3. 启动前端服务

```bash
cd frontend
npm install
npm run dev
```

前端服务将运行在 http://localhost:3000

## 默认测试账号

| 用户名 | 密码 | 说明 |
|--------|------|------|
| admin  | 123456 | 管理员账号 |
| demo   | 123456 | 普通用户 |

## API 接口

### 用户相关
- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录
- `GET /api/users/profile` - 获取用户信息
- `PUT /api/users/profile` - 更新用户信息
- `PUT /api/users/password` - 修改密码

### 文档相关
- `GET /api/documents` - 获取文档列表
- `GET /api/documents/:id` - 获取文档详情
- `POST /api/documents` - 上传文档
- `PUT /api/documents/:id` - 更新文档
- `DELETE /api/documents/:id` - 删除文档
- `GET /api/documents/search` - 搜索文档
- `GET /api/documents/:id/download` - 下载文档
- `POST /api/documents/:id/like` - 点赞/取消点赞
- `POST /api/documents/:id/favorite` - 收藏/取消收藏
- `POST /api/documents/:id/share` - 分享文档
- `GET /api/documents/:id/comments` - 获取评论
- `POST /api/documents/:id/comments` - 发表评论

### 分类相关
- `GET /api/categories` - 获取分类列表
- `GET /api/categories/hot` - 获取热门分类

## 数据库表结构

- `users` - 用户表
- `categories` - 分类表
- `documents` - 文档表
- `slides` - 幻灯片页表
- `likes` - 点赞表
- `favorites` - 收藏表
- `downloads` - 下载记录表
- `shares` - 分享记录表
- `comments` - 评论表

## 注意事项

1. 文档转换功能需要安装 LibreOffice 或其他转换工具
2. 上传文件大小限制为 100MB
3. 支持的文件格式：PPT、PPTX、PDF
