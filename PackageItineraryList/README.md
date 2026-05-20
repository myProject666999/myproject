# 🎒 行程清单打包应用

出差/旅行前根据天数和场景生成打包清单的全栈应用。

## ✨ 功能特性

- **场景模板**：内置商务出差、海岛度假、滑雪旅行、城市旅游等模板
- **模板继承**：支持基于现有模板创建自定义版本
- **自定义物品**：可自由添加、删除清单物品
- **勾选完成**：可视化进度追踪，完成度一目了然
- **共享功能**：一键生成共享链接，同行人可协同打包

## 🛠️ 技术栈

### 后端
- Spring Boot 2.7.18
- MyBatis Plus 3.5.3.1
- Spring Security + JWT
- MySQL 8.0

### 前端
- Vue 3 + Vite
- Element Plus
- Pinia 状态管理
- Vue Router

## 📁 项目结构

```
PackageItineraryList/
├── backend/                    # 后端项目
│   ├── src/
│   │   └── main/
│   │       ├── java/com/itinerary/
│   │       │   ├── controller/  # 控制层
│   │       │   ├── service/     # 服务层
│   │       │   ├── mapper/      # 数据访问层
│   │       │   ├── entity/      # 实体类
│   │       │   ├── dto/         # 数据传输对象
│   │       │   ├── common/      # 通用类
│   │       │   ├── util/        # 工具类
│   │       │   └── config/      # 配置类
│   │       └── resources/
│   │           └── application.yml
│   └── pom.xml
├── frontend/                   # 前端项目
│   ├── src/
│   │   ├── views/              # 页面组件
│   │   ├── store/              # Pinia 状态
│   │   ├── router/             # 路由配置
│   │   ├── api/                # API 接口
│   │   ├── utils/              # 工具函数
│   │   └── styles/             # 全局样式
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── db/                         # 数据库脚本
│   └── itinerary.sql
└── README.md
```

## 🚀 快速开始

### 前置要求
- JDK 8+
- Node.js 16+
- MySQL 8.0+
- Maven 3.6+

### 1. 初始化数据库

```bash
# 执行数据库脚本
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < db/itinerary.sql
```

数据库配置：
- 地址：127.0.0.1:3306
- 用户名：root
- 密码：123456
- 数据库名：itinerary_list

### 2. 启动后端

```bash
cd backend
mvn spring-boot:run
```

后端服务将在 http://localhost:8080/api 启动

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端服务将在 http://localhost:3000 启动

## 💡 使用说明

### 演示账号
- 用户名：demo
- 密码：demo123

### 核心流程
1. **登录/注册**：使用演示账号或注册新账号
2. **选择模板**：在「场景模板」页面选择适合的模板
3. **创建行程**：基于模板创建行程清单，设置天数、目的地等
4. **管理物品**：勾选已准备的物品，添加自定义物品
5. **共享清单**：生成共享链接，邀请同行人协同

## 📊 数据库设计

### 核心表
- `user` - 用户表
- `template` - 场景模板表（支持parent_id继承）
- `template_item` - 模板物品表
- `itinerary` - 行程清单表
- `itinerary_item` - 清单项表
- `share` - 共享表
- `share_participant` - 共享参与者表
- `category` - 物品分类表

### 模板继承机制
模板通过 `parent_id` 字段实现继承，子模板会复制父模板的所有物品项，用户可在此基础上自定义修改。

## 🔧 API 接口

### 用户模块
- `POST /api/user/login` - 登录
- `POST /api/user/register` - 注册

### 模板模块
- `GET /api/template/public` - 获取公共模板
- `GET /api/template/my` - 获取我的模板
- `GET /api/template/{id}/items` - 获取模板物品
- `POST /api/template` - 创建模板
- `POST /api/template/{parentId}/inherit` - 继承模板

### 行程模块
- `GET /api/itinerary/my` - 获取我的行程
- `POST /api/itinerary` - 创建行程
- `GET /api/itinerary/{id}/items` - 获取行程物品
- `POST /api/itinerary/{id}/items` - 添加自定义物品
- `PUT /api/itinerary/items/{itemId}/check` - 勾选物品
- `DELETE /api/itinerary/items/{itemId}` - 删除物品

### 共享模块
- `POST /api/share` - 创建共享
- `GET /api/share/{code}` - 获取共享信息
- `POST /api/share/join` - 加入共享

## 📝 License

MIT
