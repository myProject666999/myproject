# 家庭购物清单系统

全家共享的购物清单应用，支持清单分类、共享编辑、历史模板、价格记录和月度消费分析。

## 技术栈

- 后端：Spring Boot 2.7.18 + Spring Data JPA
- 前端：Vue 3 (CDN版本，无需构建)
- 数据库：MySQL 8.0+

## 项目结构

```
FamilyShoppingList/
├── shopping_list.sql          # 数据库脚本
├── backend/                   # Spring Boot后端
│   ├── pom.xml
│   └── src/main/
│       ├── resources/application.yml
│       └── java/com/family/shoppinglist/
│           ├── ShoppingListApplication.java
│           ├── config/CorsConfig.java
│           ├── entity/
│           │   ├── Category.java
│           │   ├── ShoppingList.java
│           │   ├── ShoppingItem.java
│           │   └── PurchaseRecord.java
│           ├── repository/
│           ├── service/
│           └── controller/
└── frontend/
    └── index.html            # 单页应用入口
```

## 快速开始

### 1. 导入数据库脚本

使用MySQL客户端执行 `shopping_list.sql`：

```bash
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < shopping_list.sql
```

或者在Navicat等工具中直接打开并执行该脚本。

### 2. 启动后端服务

```bash
cd backend
mvn spring-boot:run
```

后端服务将在 `http://localhost:8080` 启动

### 3. 打开前端

直接用浏览器打开 `frontend/index.html` 即可。

## 功能说明

### 📝 当前清单
- 添加商品，支持分类、数量设置
- 勾选已购商品，自动记录价格到消费历史
- 清除已购商品
- 保存为历史模板

### 📋 历史模板
- 创建空模板
- 应用模板到当前清单
- 编辑、删除模板

### 📊 消费统计
- 月度消费总额
- 分类消费占比饼图
- 购买记录明细
- 支持按月份查询

## API接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/categories | 获取所有分类 |
| GET | /api/lists/active | 获取当前购物清单 |
| GET | /api/lists/templates | 获取所有模板 |
| POST | /api/lists/{listId}/items | 添加商品 |
| PUT | /api/lists/items/{itemId} | 更新商品 |
| DELETE | /api/lists/items/{itemId} | 删除商品 |
| PUT | /api/lists/items/{itemId}/toggle | 切换已购状态 |
| POST | /api/lists/templates/{templateId}/apply | 应用模板 |
| POST | /api/lists/{listId}/save-as-template | 保存为模板 |
| DELETE | /api/lists/{listId}/clear-purchased | 清除已购 |
| GET | /api/records | 获取月度购买记录 |
| GET | /api/records/total | 获取月度消费总额 |
| GET | /api/records/category-summary | 获取分类消费统计 |

## 数据库配置

数据库连接配置在 `backend/src/main/resources/application.yml`：

```yaml
spring:
  datasource:
    url: jdbc:mysql://127.0.0.1:3306/family_shopping_list?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: 123456
```

## 并发同步

前端通过轮询（每5秒）自动刷新清单，实现多端同步编辑。
