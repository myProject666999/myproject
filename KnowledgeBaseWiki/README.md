# 知识库Wiki系统

一个功能完整的团队知识库系统，支持文档树形目录、Markdown编辑、全文搜索、版本历史、协作权限等功能。

## 技术栈

- **后端**: Java 17 + Spring Boot 3.2 + JPA + MySQL + Redis
- **前端**: React 18 + Ant Design 5 + React Router + Axios
- **数据库**: MySQL 8.0
- **缓存**: Redis

## 项目结构

```
KnowledgeBaseWiki/
├── backend/                 # 后端Spring Boot项目
│   ├── src/
│   │   └── main/
│   │       ├── java/com/wiki/knowledgebase/
│   │       │   ├── controller/    # 控制器层
│   │       │   ├── service/       # 服务层
│   │       │   ├── repository/    # 数据访问层
│   │       │   ├── entity/        # 实体类
│   │       │   ├── config/        # 配置类
│   │       │   └── KnowledgeBaseApplication.java
│   │       └── resources/
│   │           └── application.yml
│   └── pom.xml
├── frontend/                # 前端React项目
│   ├── src/
│   │   ├── components/      # 组件
│   │   ├── pages/           # 页面
│   │   ├── services/        # API服务
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   └── package.json
├── database/                # 数据库脚本
│   └── init.sql
└── README.md
```

## 核心功能

1. **文档管理**
   - 树形目录结构
   - Markdown编辑与实时预览
   - 文件夹与文档分类

2. **版本管理**
   - 自动保存历史版本
   - 版本对比与回滚
   - 修改备注记录

3. **全文搜索**
   - MySQL全文索引
   - 关键词高亮显示
   - 搜索历史记录

4. **权限管理**
   - 空间级权限（所有者/管理员/编辑者/查看者）
   - 文档级权限
   - 公开/私有空间

5. **其他功能**
   - 回收站与文档恢复
   - 文档导出（Markdown格式）
   - 评论系统

## 快速开始

### 1. 数据库初始化

确保MySQL服务已启动，然后执行数据库脚本：

```bash
# Windows
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < database\init.sql

# Linux/Mac
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < database/init.sql
```

默认配置：
- 数据库名: `knowledge_base_wiki`
- 用户名: `root`
- 密码: `123456`
- 端口: `3306`

### 2. 启动后端服务

```bash
cd backend

# 使用Maven编译运行
mvn clean install
mvn spring-boot:run
```

后端服务将在 `http://localhost:8080/api` 启动

API文档地址: `http://localhost:8080/api/doc.html` (Knife4j)

### 3. 启动前端服务

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm start
```

前端服务将在 `http://localhost:3000` 启动

## 数据库设计

### 主要数据表

1. **users** - 用户表
2. **spaces** - 知识空间表
3. **space_members** - 空间成员表
4. **documents** - 文档表
5. **document_versions** - 文档版本表
6. **comments** - 评论表
7. **document_permissions** - 文档权限表
8. **search_history** - 搜索历史表

### 树形结构设计

- 使用 `parent_id` 自关联实现树形结构
- `path` 字段存储完整路径，方便快速查询
- `depth` 字段记录层级深度
- `sort_order` 字段用于排序

## 默认测试账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |
| demo | demo123 | 普通用户 |

## API接口示例

### 文档相关

- `GET /api/documents/tree/{spaceId}` - 获取文档树
- `GET /api/documents/{id}` - 获取文档详情
- `POST /api/documents` - 创建文档
- `PUT /api/documents/{id}` - 更新文档
- `DELETE /api/documents/{id}` - 删除文档
- `GET /api/documents/search?keyword=xxx` - 搜索文档
- `GET /api/documents/{id}/versions` - 获取版本历史

### 空间相关

- `GET /api/spaces/my` - 获取我的空间
- `GET /api/spaces/public` - 获取公开空间
- `POST /api/spaces` - 创建空间
- `PUT /api/spaces/{id}` - 更新空间

## 注意事项

1. 确保MySQL服务和Redis服务已启动
2. 如需修改数据库配置，请编辑 `backend/src/main/resources/application.yml`
3. 前端开发环境已配置代理，API请求会自动转发到后端8080端口
4. 生产环境部署时需要配置Nginx反向代理

## 开发说明

### 后端开发

- 实体类使用Lombok简化代码
- Repository层继承JpaRepository
- Service层处理业务逻辑
- Controller层统一返回格式: `{code: 200, message: "success", data: {}}`

### 前端开发

- 使用Ant Design组件库
- API调用统一封装在 `src/services/api.js`
- 页面组件放在 `src/pages/` 目录
- 公共组件放在 `src/components/` 目录

## License

MIT
