# OnlineBookmarkCollection

在线书签收藏管理系统。

## 技术栈

- 后端：Node.js + Koa
- 前端：Vue3 + Vite + Element Plus
- 数据库：MySQL（默认）/ SQLite（可切换）

## 目录结构

```
server/          # Koa 后端
  config/        # 配置
  db/            # 数据库脚本
  src/           # 应用代码
client/          # Vue3 前端
```

## 启动

### 1. 初始化数据库

使用 MySQL 时，导入 `server/db/schema.sql`：

```bash
mysql -h127.0.0.1 -P3306 -uroot -p123456 < server/db/schema.sql
```

SQLite 模式会自动建库。

### 2. 启动后端

```bash
cd server
npm install
npm start
```

默认监听 http://127.0.0.1:3000

### 3. 启动前端

```bash
cd client
npm install
npm run dev
```

打开 http://127.0.0.1:5173

## 功能

- 书签 CRUD，自动抓取标题/图标/描述
- 文件夹 / 标签分类
- 关键词 / 标签 / 状态搜索
- 浏览器书签导入（Netscape HTML、XBEL），导出 Netscape HTML
- 失效链接检测（手动 + 定时任务）
