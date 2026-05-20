# 观影记录系统

一个用于记录看过的电影、电视剧，写短评的Web应用。

## 功能特性

- 🎬 **影库管理**: 搜索、浏览、添加影视条目（电影/电视剧）
- 📝 **观影记录**: 标记想看/在看/看过状态，评分，写短评
- 🏆 **年度榜单**: 每年的Top10影视榜单
- 🔍 **搜索去重**: 基于标题+年份+类型、豆瓣ID、IMDb ID自动去重

## 技术栈

### 后端
- Spring Boot 2.7.18
- Spring Data JPA
- MySQL 8.0+
- Lombok

### 前端
- Vue 2.6.14
- Element UI 2.15.14
- Vue Router 3.x
- Vuex 3.x
- Axios

## 数据库配置

### 连接信息
- 主机: 127.0.0.1
- 端口: 3306
- 用户名: root
- 密码: 123456
- 数据库名: movie_viewing_record

### 数据库导入

#### 方式一：使用批处理脚本（推荐）
直接双击运行 `import_db.bat` 即可完成数据库导入。

#### 方式二：手动导入
```bash
# 1. 创建数据库和表
mysql -h127.0.0.1 -P3306 -uroot -p123456 < backend/src/main/resources/sql/schema.sql

# 2. 导入示例数据
mysql -h127.0.0.1 -P3306 -uroot -p123456 < backend/src/main/resources/sql/data.sql
```

## 项目运行

### 后端启动
```bash
cd backend
mvn spring-boot:run
```
后端服务地址: http://localhost:8080

### 前端启动
```bash
cd frontend
npm install
npm run serve
```
前端服务地址: http://localhost:3000

## API 接口

### 影视相关
- `GET /api/movies` - 搜索影视列表（支持关键词、类型、年份筛选）
- `GET /api/movies/{id}` - 获取影视详情
- `POST /api/movies` - 添加影视（自动去重）
- `PUT /api/movies/{id}` - 更新影视信息
- `DELETE /api/movies/{id}` - 删除影视

### 观影记录相关
- `GET /api/records` - 获取用户观影记录列表
- `GET /api/records/{id}` - 获取单条记录详情
- `GET /api/records/movie/{movieId}` - 获取某影视的观影记录
- `POST /api/records` - 添加/更新观影记录
- `PUT /api/records/{id}` - 更新观影记录
- `DELETE /api/records/{id}` - 删除观影记录

### 年度榜单相关
- `GET /api/year-top/{year}` - 获取某年度Top10
- `GET /api/year-top/years` - 获取有榜单的年份列表
- `POST /api/year-top` - 添加到年度榜单
- `DELETE /api/year-top/{id}` - 从榜单移除
- `DELETE /api/year-top/clear/{year}` - 清空某年度榜单

## 数据库表结构

### movie - 影视表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| title | VARCHAR(255) | 标题 |
| original_title | VARCHAR(255) | 原名 |
| type | VARCHAR(20) | 类型（movie/tv） |
| year | INT | 年份 |
| poster | VARCHAR(500) | 海报链接 |
| description | TEXT | 简介 |
| director | VARCHAR(255) | 导演 |
| actors | VARCHAR(500) | 主演 |
| genre | VARCHAR(255) | 类型标签 |
| duration | INT | 时长（分钟） |
| imdb_id | VARCHAR(50) | IMDb ID（唯一） |
| douban_id | VARCHAR(50) | 豆瓣ID（唯一） |

### viewing_record - 观影记录表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| user_id | BIGINT | 用户ID |
| movie_id | BIGINT | 影视ID |
| status | VARCHAR(20) | 状态（want/watching/watched） |
| rating | DECIMAL(3,1) | 评分（0-10） |
| review | TEXT | 短评 |
| watch_date | DATE | 观看日期 |

### year_top - 年度Top10表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| user_id | BIGINT | 用户ID |
| year | INT | 年份 |
| movie_id | BIGINT | 影视ID |
| rank | INT | 排名（1-10） |

## 搜索去重机制

系统在添加影视时会自动进行去重检查，优先级如下：
1. 标题 + 年份 + 类型 组合唯一
2. 豆瓣ID唯一
3. IMDb ID唯一

如果检测到重复条目，系统会返回已存在的记录而不是创建新记录。

## 默认账号

- 用户名: admin
- 密码: 123456
