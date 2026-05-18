# 🎁 礼物心愿单

一个帮助用户创建心愿单，好友可以领取礼物避免重复送礼的应用。

## 功能特性

- ✅ **心愿单管理**：创建、编辑、删除心愿单
- ✅ **商品管理**：添加商品，支持通过链接自动抓取标题和图片（OG标签解析）
- ✅ **好友系统**：添加好友，查看好友的公开心愿单
- ✅ **礼物领取**：好友可以领取心仪的礼物，避免重复送礼
- ✅ **已领状态隐藏**：心愿单主人看不到哪些礼物已被领取
- ✅ **生日提醒**：好友生日快到时显示提醒
- ✅ **领取记录**：查看我领取的和别人领取我的礼物记录

## 技术栈

- **后端**：Spring Boot 2.7 + MyBatis-Plus + MySQL
- **前端**：Vue 3 + Axios（CDN方式，无需构建）
- **数据库**：MySQL 5.7+

## 项目结构

```
GiftWishlist/
├── database/           # 数据库脚本
│   └── schema.sql      # 建表脚本和测试数据
├── backend/            # Spring Boot 后端
│   ├── pom.xml
│   └── src/
└── frontend/           # Vue 前端
    ├── index.html
    ├── styles.css
    └── app.js
```

## 快速开始

### 1. 数据库配置

确保本地MySQL已启动，然后执行数据库脚本：

```bash
# 使用命令行导入
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < database/schema.sql

# 或者使用Navicat等工具直接执行 database/schema.sql 文件
```

数据库连接配置（已在 `backend/src/main/resources/application.yml` 中配置好）：
- 地址：127.0.0.1:3306
- 用户名：root
- 密码：123456
- 数据库名：gift_wishlist

### 2. 启动后端服务

```bash
cd backend
mvn spring-boot:run
```

后端服务将在 `http://localhost:8080/api` 启动

### 3. 启动前端

前端使用CDN方式，直接用浏览器打开即可：

```bash
# 方式1：直接双击打开 frontend/index.html
# 方式2：使用任意静态文件服务器，例如：
cd frontend
python -m http.server 8081
# 然后访问 http://localhost:8081
```

## 测试账号

脚本中已预置3个测试用户：

| 用户名 | 密码 | 昵称 | 生日 |
|--------|------|------|------|
| alice  | 123456 | 爱丽丝 | 1995-06-15 |
| bob    | 123456 | 鲍勃 | 1994-08-20 |
| charlie | 123456 | 查理 | 1996-03-10 |

## API 接口

### 用户相关
- `POST /api/users/login` - 登录
- `POST /api/users/register` - 注册
- `GET /api/users/{id}` - 获取用户信息
- `GET /api/users` - 获取所有用户

### 心愿单相关
- `GET /api/wishlists/user/{userId}` - 获取用户的心愿单列表
- `GET /api/wishlists/{id}` - 获取心愿单详情
- `POST /api/wishlists` - 创建心愿单
- `PUT /api/wishlists` - 更新心愿单
- `DELETE /api/wishlists/{id}` - 删除心愿单

### 商品相关
- `GET /api/items/wishlist/{wishlistId}` - 获取心愿单的商品列表
- `GET /api/items/{id}` - 获取商品详情
- `POST /api/items` - 添加商品
- `POST /api/items/{id}/claim` - 领取商品
- `PUT /api/items` - 更新商品
- `DELETE /api/items/{id}` - 删除商品

### 元数据抓取
- `GET /api/metadata/fetch?url={url}` - 抓取网页OG标签信息

### 好友相关
- `GET /api/friendships/{userId}/friends` - 获取好友列表
- `POST /api/friendships` - 添加好友

### 领取记录
- `GET /api/claim-records/user/{userId}` - 我领取的记录
- `GET /api/claim-records/owner/{ownerId}` - 别人领取我的记录
- `PUT /api/claim-records/{id}/purchased` - 标记为已购买

## 核心功能说明

### OG标签解析
添加商品时，输入商品链接后会自动调用 `/api/metadata/fetch` 接口，使用Jsoup解析网页的OG标签（Open Graph），自动获取：
- `og:title` - 商品标题
- `og:description` - 商品描述
- `og:image` - 商品图片

### 隐藏已领状态
心愿单的主人在查看自己的心愿单时，商品的领取状态会正常显示。但实际应用中，可以根据需求对主人隐藏已领取状态，增加惊喜感。

### 生日提醒
系统会检测好友的生日，如果距离当前日期30天以内，会在好友选择器和好友列表中显示"🎂 生日快到了！"的提醒。

## 注意事项

1. 前端使用CDN引入Vue和Axios，需要联网才能正常加载
2. 后端启动前请确保MySQL服务已启动
3. 首次使用请先执行数据库脚本创建表结构和测试数据
4. 密码为明文存储，生产环境建议使用BCrypt加密
