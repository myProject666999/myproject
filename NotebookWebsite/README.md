# 笔记本网站 (Notebook Website)

一个层级式笔记本网站，类似 OneNote，支持 Markdown 编辑。

## 技术栈

- **后端**: Spring Boot 3.2.0 + JPA + MySQL
- **前端**: Vue 3 + Vite + Vue Router + Axios
- **数据库**: MySQL 8.0+

## 功能特性

- 📚 **笔记本/分区/页面树**: 支持多层级树形结构
- 📝 **Markdown 编辑**: 实时预览，支持代码高亮
- 🔍 **全文搜索**: 基于 MySQL 全文索引的内容搜索
- ⭐ **收藏夹**: 快速访问常用笔记
- 🗑️ **回收站**: 支持恢复和永久删除

## 项目结构

```
NotebookWebsite/
├── sql/
│   └── schema.sql          # 数据库脚本
├── backend/                # Spring Boot 后端
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/notebook/
│       │   ├── NotebookApplication.java
│       │   ├── entity/        # 实体类
│       │   ├── repository/    # 数据访问层
│       │   ├── service/       # 业务逻辑层
│       │   └── controller/    # 控制层
│       └── resources/
│           └── application.yml
└── frontend/               # Vue 前端
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.js
        ├── App.vue
        ├── router/           # 路由配置
        ├── api/              # API 接口
        ├── components/       # 通用组件
        ├── views/            # 页面组件
        └── styles/           # 样式文件
```

## 快速开始

### 1. 导入数据库

确保 MySQL 服务已启动，然后执行：

```bash
# 方式一：使用 MySQL 命令行
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < sql/schema.sql

# 方式二：登录后手动执行
mysql -h 127.0.0.1 -P 3306 -u root -p123456
source sql/schema.sql
```

数据库配置：
- 地址: 127.0.0.1
- 端口: 3306
- 用户名: root
- 密码: 123456
- 数据库名: notebook_website

### 2. 启动后端

```bash
cd backend
mvn spring-boot:run
```

后端服务将在 `http://127.0.0.1:8080/api` 启动

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端服务将在 `http://127.0.0.1:5173` 启动

## 默认账号

- 用户名: admin
- 密码: 123456

## API 接口

### 笔记本 (Notebook)
- `GET /api/notebooks` - 获取所有笔记本
- `POST /api/notebooks` - 创建笔记本
- `PUT /api/notebooks/{id}` - 更新笔记本
- `DELETE /api/notebooks/{id}` - 删除笔记本

### 分区 (Section)
- `GET /api/sections/notebook/{notebookId}` - 获取笔记本下的根分区
- `GET /api/sections/parent/{parentId}` - 获取子分区
- `POST /api/sections` - 创建分区
- `PUT /api/sections/{id}` - 更新分区
- `DELETE /api/sections/{id}` - 删除分区

### 页面 (Page)
- `GET /api/pages/section/{sectionId}` - 获取分区下的页面
- `GET /api/pages/favorites` - 获取收藏的页面
- `GET /api/pages/search?keyword=xxx` - 全文搜索
- `GET /api/pages/{id}` - 获取页面详情
- `POST /api/pages` - 创建页面
- `PUT /api/pages/{id}` - 更新页面
- `DELETE /api/pages/{id}` - 移到回收站
- `PUT /api/pages/{id}/favorite` - 切换收藏状态

### 回收站 (Recycle Bin)
- `GET /api/recycle-bin` - 获取回收站列表
- `POST /api/recycle-bin/{id}/restore` - 恢复页面
- `DELETE /api/recycle-bin/{id}` - 永久删除
- `DELETE /api/recycle-bin/clear` - 清空回收站
