# 书单管理系统

一个基于 Spring Boot + Vue 3 + MySQL 的个人书单管理应用，支持 ISBN 搜索、状态切换、评分打标签、阅读时长记录和年度阅读报告。

## 功能特性

- 📚 **书架管理**: 维护想读、在读、已读三个状态的书单
- 🔍 **ISBN 搜索**: 通过 ISBN 自动获取书籍信息（集成 Google Books API）
- ⭐ **评分打标签**: 为书籍打分和添加自定义标签
- ⏱️ **阅读时长**: 记录每次阅读时长和页数
- 📊 **年度报告**: 自动聚合年度阅读数据，生成可视化报告

## 技术栈

### 后端
- Spring Boot 3.2.0
- Spring Data JPA
- MySQL 8.0+
- Lombok

### 前端
- Vue 3
- Vue Router
- Element Plus
- ECharts
- Axios

## 数据库配置

### 1. 创建数据库并导入数据

数据库连接信息：
- IP: 127.0.0.1
- Port: 3306
- 用户名: root
- 密码: 123456

执行 SQL 脚本：

```bash
# 方式一：使用 MySQL 命令行
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < sql/schema.sql

# 方式二：使用 MySQL Workbench 或其他数据库管理工具
# 打开 sql/schema.sql 文件并执行
```

脚本会自动创建：
- 数据库: `booklist_management`
- 数据表: `book`, `book_list`, `tag`, `book_tag`, `reading_record`
- 示例数据: 3 本示例书籍和一些标签

### 2. 数据库表结构

| 表名 | 说明 |
|------|------|
| book | 书籍基本信息 |
| book_list | 用户书单（包含状态、评分等） |
| tag | 标签 |
| book_tag | 书单-标签关联 |
| reading_record | 阅读记录 |

## 快速开始

### 启动后端

```bash
cd backend

# 使用 Maven 启动
mvn spring-boot:run

# 或打包后运行
mvn clean package
java -jar target/booklist-management-1.0.0.jar
```

后端服务将在 `http://localhost:8080/api` 启动

### 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务将在 `http://localhost:3000` 启动

## API 接口

### 书籍管理
- `GET /api/books` - 获取所有书籍
- `GET /api/books/{id}` - 获取书籍详情
- `GET /api/books/isbn/{isbn}` - 按 ISBN 查询
- `POST /api/books` - 创建书籍
- `PUT /api/books/{id}` - 更新书籍
- `DELETE /api/books/{id}` - 删除书籍

### 书单管理
- `GET /api/booklists` - 获取所有书单
- `GET /api/booklists/status/{status}` - 按状态获取书单
- `GET /api/booklists/{id}` - 获取书单详情
- `POST /api/booklists` - 添加书单
- `PUT /api/booklists/{id}` - 更新书单
- `PATCH /api/booklists/{id}/status?status={status}` - 切换状态
- `DELETE /api/booklists/{id}` - 删除书单

### 标签管理
- `GET /api/tags` - 获取所有标签
- `POST /api/tags` - 创建标签

### 阅读记录
- `GET /api/reading-records/booklist/{bookListId}` - 获取书单的阅读记录
- `POST /api/reading-records` - 添加阅读记录
- `DELETE /api/reading-records/{id}` - 删除阅读记录

### ISBN 搜索
- `GET /api/isbn-search/{isbn}` - 按 ISBN 搜索书籍信息

### 年度报告
- `GET /api/yearly-report` - 获取当前年度报告
- `GET /api/yearly-report/{year}` - 获取指定年度报告

## 项目结构

```
BooklistManagement/
├── backend/                    # Spring Boot 后端
│   ├── src/main/java/com/booklist/
│   │   ├── controller/         # Controller 层
│   │   ├── service/            # Service 层
│   │   ├── repository/         # Repository 层
│   │   ├── entity/             # 实体类
│   │   ├── dto/                # 数据传输对象
│   │   └── common/             # 通用类
│   └── src/main/resources/
│       └── application.yml     # 配置文件
├── frontend/                   # Vue 3 前端
│   ├── src/
│   │   ├── views/              # 页面组件
│   │   ├── router/             # 路由配置
│   │   ├── api/                # API 封装
│   │   ├── App.vue
│   │   └── main.js
│   └── package.json
└── sql/
    └── schema.sql              # 数据库脚本
```

## 使用说明

1. **添加书籍**: 点击书架页面的"添加书籍"按钮，可以输入 ISBN 自动搜索，或手动填写书籍信息
2. **状态切换**: 在书籍详情页可以切换想读、在读、已读状态
3. **添加标签**: 为书籍添加自定义标签，方便分类管理
4. **记录阅读**: 在详情页添加阅读记录，记录每次阅读的时长和页数
5. **查看报告**: 点击"年度总结"查看年度阅读数据可视化报告

## 注意事项

- ISBN 搜索功能需要网络连接，使用 Google Books API
- 年度报告统计以自然年为单位
- MySQL 服务需要在本地运行
