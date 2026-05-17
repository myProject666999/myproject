# 家庭共享账本 Family Shared Ledger

一个基于 Spring Boot + Vue + MySQL 的家庭共享账本系统，支持多人记账、自动分摊、智能结算。

## 项目结构

```
FamilySharedLedger/
├── database/              # 数据库脚本
│   └── family_ledger.sql
├── backend/               # Spring Boot 后端
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/family/ledger/
│       └── resources/
│           └── application.yml
└── frontend/              # Vue 前端
    ├── package.json
    ├── vue.config.js
    └── src/
```

## 数据库配置

### 连接信息
- 主机: 127.0.0.1
- 端口: 3306
- 用户名: root
- 密码: 123456
- 数据库名: family_ledger

### 导入数据库脚本

**方式一：使用 MySQL 命令行**
```bash
# 1. 连接 MySQL
mysql -h 127.0.0.1 -P 3306 -u root -p123456

# 2. 执行脚本（在 MySQL 命令行中）
source C:/Workspace/myproject/FamilySharedLedger/database/family_ledger.sql

# 或者直接在命令行执行
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < C:/Workspace/myproject/FamilySharedLedger/database/family_ledger.sql
```

**方式二：使用 Navicat / DBeaver / HeidiSQL 等图形化工具**
1. 连接到 MySQL 服务器 (127.0.0.1:3306, root/123456)
2. 右键 -> 执行 SQL 文件
3. 选择 `database/family_ledger.sql`
4. 点击执行

**方式三：使用 MySQL Workbench**
1. 打开 MySQL Workbench，连接到本地数据库
2. 点击 File -> Open SQL Script
3. 选择 `database/family_ledger.sql`
4. 点击闪电图标执行脚本

### 验证导入
```sql
-- 查看数据库
SHOW DATABASES;

-- 使用数据库
USE family_ledger;

-- 查看所有表
SHOW TABLES;

-- 查询测试数据
SELECT * FROM sys_user;
SELECT * FROM family_group;
SELECT * FROM bill;
```

## 数据库表设计

| 表名 | 说明 | 核心字段 |
|------|------|----------|
| sys_user | 用户表 | id, username, password, nickname |
| family_group | 家庭组表 | id, name, owner_id |
| family_member | 家庭成员表 | id, family_id, user_id, role |
| family_invite | 邀请表 | id, family_id, invitee_email, status |
| bill | 账单表 | id, family_id, amount, payer_id, split_type |
| bill_split | 账单分摊明细表 | id, bill_id, user_id, amount |
| settlement | 结算记录表 | id, family_id, start_date, end_date, status |
| transfer | 转账记录表 | id, settle_id, from_user_id, to_user_id, amount |
| user_balance | 用户余额表 | id, family_id, user_id, balance |

## 后端启动

### 环境要求
- JDK 1.8+
- Maven 3.6+

### 启动步骤
```bash
cd backend

# 编译项目
mvn clean package

# 运行项目
mvn spring-boot:run

# 或者运行打包后的 jar
java -jar target/family-ledger-1.0.0.jar
```

后端服务启动后访问: http://localhost:8080/api

### 后端配置文件
`backend/src/main/resources/application.yml` 已配置好数据库连接：
```yaml
spring:
  datasource:
    url: jdbc:mysql://127.0.0.1:3306/family_ledger?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: 123456
```

## 前端启动

### 环境要求
- Node.js 14+
- npm 或 yarn

### 启动步骤
```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run serve
```

前端服务启动后访问: http://localhost:8081

## 测试账号

| 用户名 | 密码 | 说明 |
|--------|------|------|
| zhangsan | 123456 | 张三，两个家庭组的管理员 |
| lisi | 123456 | 李四 |
| wangwu | 123456 | 王五，合租房客 |
| zhaoliu | 123456 | 赵六，合租房客 |

## 核心功能

### 1. 家庭组管理
- 创建/解散家庭组
- 成员邀请（邮件邀请）
- 角色管理（管理员/普通成员）

### 2. 共享账单
- 记录支出/收入
- 支持多种分类（餐饮、交通、购物、住房、娱乐）
- 三种分摊方式：AA制、比例分摊、自定义

### 3. 智能结算
- **最少转账次数算法**：采用贪心算法，自动计算最优转账方案
- 支持按月/自定义周期结算
- 生成结算单和转账清单

### 4. 个人欠款
- 实时计算用户余额（应收/应付）
- 转账记录管理
- 收款确认机制

## 核心算法说明

### 最少转账次数算法
```
问题：N个人之间有债务关系，如何用最少的转账次数结清所有债务？

算法思路（贪心算法）：
1. 计算每个人的净余额（总支付 - 总应分摊）
2. 将人分为两组：债务人（余额<0）和债权人（余额>0）
3. 每次让最大的债务人给最大的债权人转账
4. 每次转账后更新余额，去掉已结清的人
5. 重复直到所有债务结清

时间复杂度：O(n log n)，主要来自排序
转账次数：最多 n-1 次，最少 1 次
```

## 多用户权限隔离

- 数据按家庭组隔离
- 每个用户只能看到自己所属家庭组的数据
- 账单创建人/家庭管理员可编辑账单
- 结算需要管理员确认

## 技术栈

**后端：**
- Spring Boot 2.7.18
- MyBatis Plus 3.5.5
- MySQL 8.0
- JWT (JJWT 0.11.5)
- Lombok

**前端：**
- Vue 2.6.14
- Vue Router 3.5.1
- Vuex 3.6.2
- Element UI 2.15.14
- Axios 1.6.0
- ECharts 5.4.3
