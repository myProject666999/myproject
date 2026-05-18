# 数字名片夹

基于 Spring Boot + Vue + MySQL 的数字名片夹管理系统。

## 功能特性

- 📸 拍照上传名片，OCR 自动识别
- 👥 名片分组管理
- 🔍 支持姓名、公司、电话等多维度搜索
- ⭐ 收藏重要名片
- 📤 导出 vCard 格式
- 📱 移动端友好界面

## 技术栈

### 后端
- Spring Boot 2.7.18
- MyBatis Plus 3.5.3.1
- MySQL 8.0
- 百度 OCR API
- JJWT

### 前端
- Vue 3
- Vant 4 (移动端 UI)
- Vue Router
- Vuex
- Axios

## 项目结构

```
DigitalCardHolder/
├── backend/                # Spring Boot 后端
│   ├── src/main/java/com/digitalcard/
│   │   ├── common/        # 公共类
│   │   ├── config/        # 配置类
│   │   ├── controller/    # 控制器
│   │   ├── dto/           # 数据传输对象
│   │   ├── entity/        # 实体类
│   │   ├── mapper/        # MyBatis Mapper
│   │   └── service/       # 业务逻辑
│   └── src/main/resources/
│       └── application.yml
├── frontend/              # Vue 前端
│   └── src/
│       ├── api/           # API 接口
│       ├── router/        # 路由
│       ├── store/         # Vuex
│       ├── styles/        # 样式
│       ├── utils/         # 工具类
│       └── views/         # 页面组件
└── sql/
    └── init.sql           # 数据库初始化脚本
```

## 快速开始

### 1. 导入数据库

**方式一：使用 MySQL 命令行**
```bash
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < sql/init.sql
```

**方式二：使用图形化工具（Navicat/DBeaver 等）**
1. 连接到 MySQL 服务器（127.0.0.1:3306，密码 123456）
2. 新建数据库 `digital_card_holder`，字符集选择 utf8mb4
3. 执行 `sql/init.sql` 脚本

**方式三：执行以下 SQL 命令**
```sql
CREATE DATABASE IF NOT EXISTS digital_card_holder DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE digital_card_holder;
-- 然后执行 init.sql 文件中的建表语句
```

### 2. 配置百度 OCR（可选）

编辑 `backend/src/main/resources/application.yml`：
```yaml
baidu:
  ocr:
    app-id: your-app-id
    api-key: your-api-key
    secret-key: your-secret-key
```

获取百度 OCR API Key：https://console.bce.baidu.com/ai/

### 3. 启动后端服务

```bash
cd backend
mvn spring-boot:run
```

后端服务将在 http://localhost:8080/api 启动

### 4. 启动前端服务

```bash
cd frontend
npm install
npm run serve
```

前端服务将在 http://localhost:8081 启动

## API 接口

### 名片管理
- `GET /api/cards` - 获取名片列表（支持分页、分组、搜索）
- `GET /api/cards/all` - 获取所有名片
- `GET /api/cards/{id}` - 获取名片详情
- `POST /api/cards` - 新增名片
- `PUT /api/cards` - 更新名片
- `DELETE /api/cards/{id}` - 删除名片
- `PUT /api/cards/{id}/favorite` - 切换收藏状态

### 分组管理
- `GET /api/groups` - 获取分组列表
- `POST /api/groups` - 新增分组
- `PUT /api/groups` - 更新分组
- `DELETE /api/groups/{id}` - 删除分组

### OCR 识别
- `POST /api/ocr/recognize` - 识别名片（不保存）
- `POST /api/ocr/recognize-and-save` - 识别并保存名片

### vCard 导出
- `GET /api/vcard/{id}` - 导出名片为 vCard
- `GET /api/vcard/export-all` - 导出所有名片

## 数据库表结构

### user 用户表
- id, username, password, nickname, avatar, created_at, updated_at

### card_group 分组表
- id, user_id, name, sort_order, created_at, updated_at

### card 名片表
- id, user_id, group_id, name, title, company, department
- mobile, phone, email, website, address, fax, wechat, qq
- remark, front_image, back_image, is_favorite, created_at, updated_at

## 默认账号

- 用户名：admin
- 密码：123456

## 注意事项

1. **OCR 字段对齐**：百度 OCR 返回的字段名需要与数据库字段对应，当前映射关系：
   - NAME → name
   - POSITION → title
   - COMPANY → company
   - DEPARTMENT → department
   - MOBILE → mobile
   - TEL → phone
   - EMAIL → email
   - URL → website
   - ADDR → address
   - FAX → fax

2. 识别结果可能不准确，建议用户确认后再保存。

3. 图片上传大小限制为 10MB。
