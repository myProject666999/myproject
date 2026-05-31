# 数据库Schema变更评审与发布平台

## 项目简介

线上改表风险高，DBA 手工审 SQL 易出错，需要一个提交变更、自动检测风险、评审通过后受控发布的平台。

## 技术栈

- **后端**: Java 8 + Spring Boot 2.7 + MyBatis Plus + MySQL + Redis
- **前端**: Vue 3 + Vite + Element Plus + Vue Router + Pinia

## 核心功能

1. **变更工单提交** - 支持DDL/DML/DCL变更，多SQL拆分执行
2. **SQL风险检测** - 自动检测大表变更、锁表、缺少WHERE、全表扫描等风险
3. **评审流程** - 多级审批，按风险等级配置评审规则
4. **灰度/分批执行** - 支持暂停、恢复、中止执行
5. **回滚预案** - 预置回滚SQL，支持一键回滚
6. **变更审计** - 全程操作留痕，不可篡改

## 项目结构

```
ReviewReleaseDatabaseSchemaChange/
├── backend/                 # 后端项目
│   ├── src/
│   │   └── main/
│   │       ├── java/com/db/schema/review/
│   │       │   ├── common/       # 通用类
│   │       │   ├── config/       # 配置类
│   │       │   ├── controller/   # 控制器
│   │       │   ├── entity/       # 实体类
│   │       │   ├── mapper/       # 数据访问层
│   │       │   └── service/      # 业务逻辑层
│   │       └── resources/
│   │           └── application.yml
│   └── pom.xml
├── frontend/                # 前端项目
│   ├── src/
│   │   ├── api/              # API接口
│   │   ├── views/            # 页面组件
│   │   ├── router/           # 路由配置
│   │   ├── utils/            # 工具类
│   │   └── styles/           # 样式
│   ├── package.json
│   └── vite.config.js
├── sql/                     # 数据库脚本
│   └── init_schema.sql
└── README.md
```

## 快速开始

### 环境要求

- JDK 1.8+
- Node.js 16+
- MySQL 5.7+
- Redis 5.0+

### 数据库配置

已自动创建数据库 `db_schema_review`，包含以下表：
- `sys_user` - 用户表
- `db_environment` - 数据库环境配置
- `schema_order` - 变更工单
- `schema_order_sql` - 工单SQL明细
- `risk_detection` - 风险检测结果
- `review_record` - 评审记录
- `review_config` - 评审配置
- `execution_record` - 执行记录
- `execution_progress` - 执行进度
- `audit_log` - 审计日志
- `risk_rule` - 风险规则配置

### 后端启动

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

后端服务地址: http://localhost:8080/api

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

前端服务地址: http://localhost:3000

## 默认账号

| 用户名 | 角色 | 说明 |
|--------|------|------|
| admin | admin | 超级管理员 |
| developer1 | developer | 开发人员 |
| reviewer1 | reviewer | 评审人员 |
| dba1 | dba | DBA |

## 风险检测规则

系统内置以下风险检测规则：

1. **大表ALTER操作** - 100万行以上表执行DDL
2. **缺少WHERE条件** - UPDATE/DELETE无WHERE
3. **全表扫描风险** - 执行计划显示ALL
4. **删除表操作** - DROP TABLE检测
5. **重命名表操作** - RENAME TABLE检测
6. **新增字段无索引** - ALTER ADD COLUMN建议索引
7. **批量操作无LIMIT** - 大数量DML建议分批
8. **SELECT加锁操作** - SELECT ... FOR UPDATE检测

## API接口

### 工单管理

- `POST /api/order/create` - 创建工单
- `POST /api/order/update` - 更新工单
- `POST /api/order/submit/{orderId}` - 提交评审
- `POST /api/order/cancel/{orderId}` - 取消工单
- `GET /api/order/list` - 工单列表
- `GET /api/order/{orderId}` - 工单详情
- `GET /api/order/{orderId}/sql` - 工单SQL列表
- `GET /api/order/{orderId}/risks` - 风险检测结果

### 评审管理

- `GET /api/review/pending` - 待评审列表
- `POST /api/review/review` - 提交评审
- `GET /api/review/records/{orderId}` - 评审记录

### 执行管理

- `POST /api/execution/start/{orderId}` - 开始执行
- `POST /api/execution/stop/{executionId}` - 中止执行
- `POST /api/execution/pause/{executionId}` - 暂停执行
- `POST /api/execution/resume/{executionId}` - 恢复执行
- `POST /api/execution/rollback/{orderId}` - 执行回滚
- `GET /api/execution/{executionId}` - 执行详情

### 审计日志

- `GET /api/audit/list` - 审计日志列表
