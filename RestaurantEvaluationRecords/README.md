# 餐厅评价记录系统

一个基于 Spring Boot + Vue 3 + MySQL 的私密餐厅评价记录系统，适用于个人或小圈子使用。

## 功能特性

- 🏪 **餐厅库管理** - 添加、搜索、查看餐厅信息
- ⭐ **多维度评分** - 口味、环境、服务三维度打分，自动计算综合分
- 🍽️ **推荐菜品** - 记录每次用餐的推荐菜品
- 🔄 **复购意愿** - 标记是否愿意再次光顾
- 👥 **好友评价** - 查看好友们的评价记录
- 📊 **评分聚合** - 自动计算餐厅的多维度平均评分

## 技术栈

### 后端
- Spring Boot 2.7.18
- Spring Data JPA
- MySQL 8.0
- Lombok

### 前端
- Vue 3
- Vue Router 4
- Element Plus
- Axios
- Vite

## 项目结构

```
RestaurantEvaluationRecords/
├── backend/                    # 后端项目
│   ├── src/main/java/com/restaurant/
│   │   ├── common/            # 通用类
│   │   ├── config/            # 配置类
│   │   ├── controller/        # 控制器
│   │   ├── entity/            # 实体类
│   │   ├── repository/        # 数据访问层
│   │   └── service/           # 业务逻辑层
│   ├── src/main/resources/
│   │   └── application.yml    # 配置文件
│   └── pom.xml
├── frontend/                   # 前端项目
│   ├── src/
│   │   ├── api/               # API 接口
│   │   ├── utils/             # 工具类
│   │   ├── views/             # 页面组件
│   │   ├── router/            # 路由配置
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── restaurant_evaluation.sql   # 数据库脚本
```

## 快速开始

### 1. 导入数据库

```bash
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < restaurant_evaluation.sql
```

### 2. 启动后端

```bash
cd backend
mvn spring-boot:run
```

后端服务将运行在 http://localhost:8080

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端服务将运行在 http://localhost:3000

## 测试账号

| 用户名 | 密码 | 昵称 |
|--------|------|------|
| zhangsan | 123456 | 张三 |
| lisi | 123456 | 李四 |
| wangwu | 123456 | 王五 |

## 数据库设计

### 主要表结构

- **user** - 用户表
- **friend_relation** - 好友关系表
- **restaurant** - 餐厅表（包含聚合评分）
- **restaurant_review** - 餐厅评价表
- **recommended_dish** - 推荐菜表

### 评分聚合机制

每次添加/修改/删除评价时，系统会自动更新餐厅表中的：
- avg_taste_score - 平均口味评分
- avg_env_score - 平均环境评分
- avg_service_score - 平均服务评分
- avg_overall_score - 综合平均分
- review_count - 评价数量

## API 接口

### 餐厅相关
- `GET /api/restaurants` - 获取餐厅列表
- `GET /api/restaurants/{id}` - 获取餐厅详情
- `POST /api/restaurants` - 添加餐厅
- `PUT /api/restaurants/{id}` - 更新餐厅
- `DELETE /api/restaurants/{id}` - 删除餐厅
- `GET /api/restaurants/search?name={name}` - 搜索餐厅

### 评价相关
- `GET /api/reviews/restaurant/{restaurantId}` - 获取餐厅评价
- `GET /api/reviews/user/{userId}` - 获取用户评价
- `GET /api/reviews/friends/{userId}` - 获取好友评价
- `POST /api/reviews` - 创建评价
- `PUT /api/reviews/{id}` - 更新评价
- `DELETE /api/reviews/{id}` - 删除评价

### 用户相关
- `POST /api/users/login` - 用户登录
- `GET /api/users/{id}` - 获取用户信息

### 好友相关
- `GET /api/friends/{userId}` - 获取好友列表
- `POST /api/friends` - 添加好友
- `DELETE /api/friends` - 移除好友
