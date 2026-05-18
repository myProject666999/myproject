# 日记本（带情绪追踪）

每日写日记并记录情绪状态，形成情绪曲线。

## 技术栈

- 后端：Spring Boot 2.7.x + MyBatis-Plus + MySQL
- 前端：Vue 3 + Vite + Element Plus + ECharts + WangEditor
- 数据库：MySQL 8.x

## 项目结构

```
Diary/
├── backend/                 # Spring Boot 后端项目
│   ├── src/
│   │   └── main/
│   │       ├── java/com/diary/
│   │       │   ├── common/      # 通用响应类
│   │       │   ├── config/      # 配置类
│   │       │   ├── controller/  # 控制器
│   │       │   ├── dto/         # 数据传输对象
│   │       │   ├── entity/      # 实体类
│   │       │   ├── mapper/      # Mapper接口
│   │       │   ├── service/     # 业务逻辑层
│   │       │   └── util/        # 工具类
│   │       └── resources/
│   │           └── application.yml
│   └── pom.xml
├── frontend/                # Vue 前端项目
│   ├── src/
│   │   ├── api/             # API接口
│   │   ├── router/          # 路由配置
│   │   ├── views/           # 页面组件
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── style.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── diary.sql                # 数据库脚本
├── import_db.py             # 数据库导入脚本
└── README.md
```

## 数据库配置

数据库已自动导入，配置信息：

- 地址：127.0.0.1:3306
- 数据库名：diary_app
- 用户名：root
- 密码：123456

默认用户：test / 123456

## 后端启动

```bash
cd backend

# 使用Maven编译运行
mvn spring-boot:run

# 或打包后运行
mvn clean package
java -jar target/diary-backend-1.0.0.jar
```

后端服务地址：http://localhost:8080/api

## 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 打包构建
npm run build
```

前端服务地址：http://localhost:3000

## 核心功能

### 1. 今日日记
- 富文本编辑器编写日记内容
- 1-10分心情评分
- 自动提取情绪关键词
- 生成情绪摘要
- 内容AES加密存储

### 2. 日记列表
- 分页展示所有日记
- 预览日记内容和情绪标签
- 查看日记详情
- 删除日记

### 3. 情绪趋势
- 月度情绪曲线图（ECharts）
- 情绪分布饼图
- 统计数据：日记数、平均分、积极占比
- 按月份切换查看

## API接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/diary | 保存/更新日记 |
| GET | /api/diary/today | 获取今日日记 |
| GET | /api/diary/{id} | 获取单篇日记 |
| GET | /api/diary/list | 获取日记列表（分页） |
| GET | /api/diary/trend/monthly | 获取月度情绪趋势 |
| GET | /api/diary/statistics | 获取情绪统计数据 |
| DELETE | /api/diary/{id} | 删除日记 |

## 核心特性

- **内容加密**：日记内容使用AES加密存储，保护隐私
- **情绪提取**：基于关键词规则自动分析情绪，支持40+情绪词
- **综合评分**：用户评分（70%）+ 关键词分析（30%）= 最终情绪分
- **数据可视化**：ECharts图表展示情绪变化趋势
- **富文本编辑**：支持格式化文本、图片等丰富内容
