# 企业内部公告/OA通知系统

## 项目简介

企业内部公告发布与已读跟踪系统，支持公告发布、分类管理、已读统计、部门定向推送等功能。

## 技术栈

- **后端**: Java 8 + Spring Boot 2.7 + MyBatis Plus
- **前端**: Vue 3 + Vite + Element Plus
- **数据库**: MySQL 5.7+
- **缓存**: Redis（未读计数）

## 项目结构

```
InternalCorporateNotification/
├── backend/                    # 后端项目
│   ├── src/
│   │   └── main/
│   │       ├── java/com/notification/
│   │       │   ├── controller/      # 控制层
│   │       │   ├── service/         # 服务层
│   │       │   ├── mapper/          # 数据访问层
│   │       │   ├── entity/          # 实体类
│   │       │   ├── config/          # 配置类
│   │       │   ├── interceptor/     # 拦截器
│   │       │   └── utils/           # 工具类
│   │       └── resources/
│   │           └── application.yml  # 配置文件
│   └── pom.xml
├── frontend/                   # 前端项目
│   ├── src/
│   │   ├── views/                   # 页面组件
│   │   ├── api/                     # API接口
│   │   ├── store/                   # 状态管理
│   │   ├── router/                  # 路由配置
│   │   └── utils/                   # 工具函数
│   └── package.json
└── sql/                        # 数据库脚本
    └── notification_system.sql
```

## 核心功能

- ✅ **公告管理**: 发布、编辑、删除公告
- ✅ **分类管理**: 公告分类维护
- ✅ **置顶功能**: 重要公告置顶显示
- ✅ **已读跟踪**: 实时记录用户已读状态
- ✅ **未读计数**: Redis缓存未读数量
- ✅ **附件管理**: 支持附件上传下载
- ✅ **评论功能**: 公告评论互动
- ✅ **定向推送**: 按部门推送公告
- ✅ **统计分析**: 已读率统计与图表展示

## 快速开始

### 环境要求

- JDK 1.8+
- Node.js 16+
- MySQL 5.7+
- Redis 5.0+

### 数据库配置

数据库已创建，配置信息：
- 地址: 127.0.0.1:3306
- 数据库: notification_system
- 用户名: root
- 密码: 123456

### 后端启动

```bash
cd backend
# Maven打包
mvn clean package -DskipTests
# 运行
java -jar target/notification-system-1.0.0.jar
```

或直接运行主类：`NotificationApplication.java`

后端服务地址: http://127.0.0.1:8080

### 前端启动

```bash
cd frontend
# 安装依赖
npm install
# 开发模式
npm run dev
# 打包
npm run build
```

前端服务地址: http://127.0.0.1:5173

### Redis配置

确保Redis服务在 127.0.0.1:6379 运行

## 测试账号

| 账号 | 密码 | 角色 |
|------|------|------|
| admin | 123456 | 管理员 |
| zhangsan | 123456 | 普通员工 |
| lisi | 123456 | 普通员工 |

## 关键页面

1. **公告列表页**: `/announcements` - 查看公告列表，支持分类筛选
2. **公告详情页**: `/announcements/:id` - 查看详情、下载附件、发表评论
3. **发布公告页**: `/publish` - 发布新公告（管理员）
4. **已读统计页**: `/statistics` - 公告阅读率统计（管理员）
5. **后台管理页**: `/admin` - 公告、分类、部门管理（管理员）
6. **个人中心**: `/profile` - 个人信息与阅读记录

## 注意事项

1. **已读状态记录**: 访问公告详情页自动记录已读
2. **部门权限定向**: 支持按部门推送，目标部门成员可见
3. **附件安全下载**: 文件重命名存储，避免路径遍历
4. **Redis未读计数**: 缓存未读数量，1小时自动过期

## 代码引用

- 数据库脚本: [notification_system.sql](file:///d:/data/Workspace/myproject/InternalCorporateNotification/sql/notification_system.sql)
- 后端主启动类: [NotificationApplication.java](file:///d:/data/Workspace/myproject/InternalCorporateNotification/backend/src/main/java/com/notification/NotificationApplication.java)
- 公告服务类: [AnnouncementService.java](file:///d:/data/Workspace/myproject/InternalCorporateNotification/backend/src/main/java/com/notification/service/AnnouncementService.java)
- 前端入口: [main.js](file:///d:/data/Workspace/myproject/InternalCorporateNotification/frontend/src/main.js)
- 公告列表页: [AnnouncementList.vue](file:///d:/data/Workspace/myproject/InternalCorporateNotification/frontend/src/views/AnnouncementList.vue)
