# 快速启动指南

## 🔧 已修复的问题

### 1. pom.xml 依赖问题
**问题**: `mysql-connector-java` 缺少版本号
**修复**: 添加了 `<version>8.0.33</version>`

### 2. BigDecimal 弃用API问题
**问题**: `BigDecimal.ROUND_HALF_UP` 在Java 9+中已弃用
**修复**: 改用 `RoundingMode.HALF_UP`

### 3. 密码验证问题
**问题**: 登录时使用明文比较密码
**修复**: 集成 BCrypt 密码加密，添加 `PasswordUtil` 工具类

### 4. 新增依赖
- `spring-security-crypto`: 用于 BCrypt 密码加密

---

## 🚀 启动步骤

### 第一步：导入数据库

**确保MySQL服务已启动**，然后执行：

```bash
# 方式1：命令行导入
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < database/family_ledger.sql

# 方式2：在MySQL客户端执行
source C:/Workspace/myproject/FamilySharedLedger/database/family_ledger.sql
```

**验证**:
```sql
USE family_ledger;
SHOW TABLES;
SELECT * FROM sys_user;
```

### 第二步：启动后端

```bash
cd backend

# 编译项目
mvn clean compile

# 启动服务
mvn spring-boot:run
```

后端服务地址: http://localhost:8080/api

**测试健康检查**:
```bash
curl http://localhost:8080/api/health
```

**测试登录**:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"zhangsan","password":"123456"}'
```

### 第三步：启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run serve
```

前端服务地址: http://localhost:8081

---

## 🧪 测试账号

所有测试账号密码均为: **123456**

| 用户名 | 昵称 | 说明 |
|--------|------|------|
| zhangsan | 张三 | 家庭组管理员 |
| lisi | 李四 | 家庭成员 |
| wangwu | 王五 | 合租房客 |
| zhaoliu | 赵六 | 合租房客 |

---

## 📁 项目文件清单

### 后端核心文件
```
backend/
├── pom.xml                                    # 已修复mysql版本
└── src/main/java/com/family/ledger/
    ├── FamilyLedgerApplication.java           # 启动类
    ├── common/Result.java                     # 统一响应
    ├── config/CorsConfig.java                 # 跨域配置
    ├── controller/
    │   ├── AuthController.java                # 认证接口（已修复密码加密）
    │   ├── BillController.java                # 账单接口
    │   └── HealthController.java              # 健康检查
    ├── entity/
    │   ├── User.java
    │   ├── Bill.java
    │   └── Transfer.java
    ├── mapper/
    │   ├── UserMapper.java
    │   └── BillMapper.java
    └── util/
        ├── JwtUtil.java                       # JWT工具
        ├── PasswordUtil.java                  # 密码加密工具
        └── SettlementUtil.java                # 最少转账算法（已修复）
```

### 前端核心文件
```
frontend/
├── package.json
├── vue.config.js
└── src/
    ├── main.js
    ├── App.vue
    ├── router/index.js                        # 路由配置
    ├── store/index.js                         # 状态管理
    └── views/
        ├── Login.vue                          # 登录页
        ├── Layout.vue                         # 主布局
        ├── Dashboard.vue                      # 首页概览
        ├── Family.vue                         # 家庭设置
        ├── Bills.vue                          # 共享账单
        ├── Settlement.vue                     # 结算中心
        └── Balance.vue                        # 个人欠款
```

---

## 🔍 常见问题排查

### 1. Maven 编译失败
**错误**: `'dependencies.dependency.version' for mysql:mysql-connector-java:jar is missing`
**解决**: 已修复，确保使用最新的 pom.xml

### 2. 密码验证失败
**错误**: 输入正确密码但提示"密码错误"
**解决**: 确保数据库中密码字段存储的是BCrypt哈希值，测试数据已正确配置

### 3. 数据库连接失败
**错误**: `Communications link failure`
**解决**: 
- 检查MySQL服务是否启动
- 确认端口3306是否被占用
- 检查用户名密码是否正确 (root/123456)

### 4. 前端跨域问题
**解决**: 已配置CORS和代理，前端请求 `/api` 会自动代理到后端 `http://localhost:8080`

---

## 📊 核心算法验证

最少转账次数算法测试（可手动运行）:

```java
// 测试场景：4人合租
// 张三应收: 285元
// 李四应付: 15元
// 王五应付: 135元
// 赵六应付: 135元

// 算法输出（最多3次转账）:
// 李四 → 张三: 15元
// 王五 → 张三: 135元
// 赵六 → 张三: 135元
```

时间复杂度: O(n log n)
转账次数: 最多 n-1 次
