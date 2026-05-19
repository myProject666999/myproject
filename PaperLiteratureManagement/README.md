# 论文文献管理系统

一个类似 Zotero 的论文文献管理系统，支持 PDF 上传、元数据提取、标签管理、笔记记录和参考文献导出。

## 技术栈

- **后端**: Spring Boot 3.2.0 + JPA + MySQL
- **前端**: Vue 3 + Vite + Element Plus
- **PDF处理**: Apache PDFBox
- **数据导出**: BibTeX 格式

## 功能特性

- ✅ PDF 文件上传与元数据自动提取
- ✅ 文献信息手动录入与编辑
- ✅ 标签分类管理
- ✅ 阅读笔记记录
- ✅ 按标题/作者搜索
- ✅ 按标签筛选
- ✅ BibTeX 格式参考文献导出（单篇/批量）
- ✅ 响应式设计，支持多端访问

## 数据库配置

数据库连接信息已配置在 `backend/src/main/resources/application.yml`:

```yaml
url: jdbc:mysql://127.0.0.1:3306/paper_management?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
username: root
password: "123456"
```

## 数据库初始化

### 方法一：手动执行 SQL 脚本

1. 确保 MySQL 服务已启动
2. 连接到 MySQL 服务器：
   ```bash
   mysql -h 127.0.0.1 -P 3306 -u root -p123456
   ```
3. 执行数据库脚本：
   ```sql
   source d:/Workspace/myproject/PaperLiteratureManagement/database/schema.sql
   ```

### 方法二：自动创建（推荐）

Spring Boot 配置了 `ddl-auto: update`，启动后端时会自动创建表结构。初始标签数据会通过 `DataInitializer` 自动插入。

**注意**: 需要先手动创建数据库：
```sql
CREATE DATABASE IF NOT EXISTS paper_management DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 快速开始

### 1. 启动后端服务

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

后端服务将在 `http://localhost:8080/api` 启动

### 2. 启动前端服务

```bash
cd frontend
npm install
npm run dev
```

前端服务将在 `http://localhost:5173` 启动

## 项目结构

```
PaperLiteratureManagement/
├── backend/                    # Spring Boot 后端
│   ├── src/main/java/com/paper/
│   │   ├── PaperManagementApplication.java    # 启动类
│   │   ├── config/              # 配置类（CORS、异常处理、数据初始化）
│   │   ├── controller/          # 控制器（REST API）
│   │   ├── dto/                 # 数据传输对象
│   │   ├── entity/              # 实体类
│   │   ├── repository/          # 数据访问层
│   │   └── service/             # 业务逻辑层（含PDF提取、BibTeX导出）
│   ├── src/main/resources/
│   │   └── application.yml      # 应用配置
│   └── pom.xml                  # Maven 依赖
├── frontend/                    # Vue 前端
│   ├── src/
│   │   ├── api/                 # API 调用封装
│   │   ├── assets/              # 静态资源
│   │   ├── router/              # 路由配置
│   │   ├── views/               # 页面组件
│   │   │   ├── PaperList.vue    # 文献库列表
│   │   │   ├── PaperDetail.vue  # 论文详情
│   │   │   ├── Tags.vue         # 标签管理
│   │   │   └── Notes.vue        # 所有笔记
│   │   ├── App.vue              # 根组件
│   │   └── main.js              # 入口文件
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── database/
    └── schema.sql               # 数据库脚本
```

## API 接口

### 论文管理
- `GET /api/papers` - 获取论文列表（支持搜索、标签筛选、分页）
- `GET /api/papers/{id}` - 获取论文详情
- `POST /api/papers` - 手动创建论文
- `POST /api/papers/upload` - 上传 PDF 并自动提取元数据
- `PUT /api/papers/{id}` - 更新论文信息
- `DELETE /api/papers/{id}` - 删除论文
- `GET /api/papers/{id}/bibtex` - 导出单篇 BibTeX
- `POST /api/papers/bibtex/export` - 批量导出 BibTeX

### 标签管理
- `GET /api/tags` - 获取所有标签
- `POST /api/tags` - 创建标签
- `PUT /api/tags/{id}` - 更新标签
- `DELETE /api/tags/{id}` - 删除标签

### 笔记管理
- `GET /api/notes` - 获取所有笔记
- `GET /api/notes/paper/{paperId}` - 获取论文的所有笔记
- `GET /api/notes/{id}` - 获取笔记详情
- `POST /api/notes` - 创建笔记
- `PUT /api/notes/{id}` - 更新笔记
- `DELETE /api/notes/{id}` - 删除笔记

## 数据库表结构

### papers（论文表）
- id, title, authors, abstract_text, keywords, publication_year, journal, volume, issue, pages, doi, file_path, file_name, file_size, created_at, updated_at

### tags（标签表）
- id, name, color, created_at

### paper_tags（论文-标签关联表）
- paper_id, tag_id, created_at

### notes（笔记表）
- id, paper_id, title, content, page_number, created_at, updated_at

## 默认标签

系统启动时会自动创建以下标签：
- 机器学习、深度学习、自然语言处理、计算机视觉、强化学习
- 数据挖掘、推荐系统、待读、已读、重要

## 使用说明

1. **上传论文**: 点击"上传PDF"按钮，选择PDF文件，系统会自动提取标题、作者、年份等元数据
2. **手动添加**: 点击"手动添加"按钮，手动录入论文信息
3. **编辑论文**: 在文献列表中点击"编辑"，修改论文详情
4. **添加标签**: 在标签管理页面创建标签，然后在编辑论文时关联标签
5. **添加笔记**: 进入论文详情页，点击"添加笔记"记录阅读心得
6. **导出引用**: 勾选多篇论文，点击"导出BibTeX"批量导出参考文献
