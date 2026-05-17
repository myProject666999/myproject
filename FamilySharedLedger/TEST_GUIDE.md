# 家庭共享账本 - 功能测试指南

## 🚀 启动项目

### 1. 启动数据库
确保MySQL服务已启动，数据库已导入：
```bash
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < database/family_ledger.sql
```

### 2. 启动后端
```bash
cd backend
mvn clean compile
mvn spring-boot:run
```
后端地址：http://localhost:8080

### 3. 启动前端
```bash
cd frontend
npm install
npm run serve
```
前端地址：http://localhost:8081

---

## 🧪 测试账号

| 用户名 | 密码 | 说明 |
|--------|------|------|
| zhangsan | 123456 | 张三（管理员） |
| lisi | 123456 | 李四 |
| wangwu | 123456 | 王五 |
| zhaoliu | 123456 | 赵六 |

---

## 📋 功能测试清单

### 1. 登录功能 ✅
- 打开 http://localhost:8081
- 使用 zhangsan / 123456 登录
- 预期：登录成功，跳转到首页

### 2. 家庭设置 ✅
**2.1 创建家庭**
- 点击左侧菜单「家庭设置」
- 点击「创建家庭」按钮
- 输入家庭名称："测试家庭"，描述："功能测试"
- 点击创建
- 预期：提示创建成功，家庭列表显示新创建的家庭

**2.2 查看家庭列表**
- 预期：显示当前用户所属的所有家庭，包含成员列表

**2.3 邀请成员**
- 点击家庭卡片上的「邀请成员」
- 输入邮箱：lisi@example.com，姓名：李四
- 点击发送邀请
- 预期：提示邀请已发送

### 3. 共享账单 ✅
**3.1 添加账单**
- 点击左侧菜单「共享账单」
- 点击「记一笔」按钮
- 填写信息：
  - 标题：超市购物
  - 金额：200
  - 分类：购物
  - 家庭：选择刚才创建的家庭
  - 支付人：张三
  - 分摊方式：AA制
  - 日期：今天
- 点击保存
- 预期：提示添加成功，账单列表显示新账单

**3.2 查看账单详情**
- 点击账单操作列的「详情」
- 预期：弹出详情弹窗，显示账单完整信息

**3.3 编辑账单**
- 点击账单操作列的「编辑」
- 修改标题为"超市购物-周末"
- 点击保存
- 预期：提示更新成功，列表显示更新后的标题

**3.4 删除账单**
- 点击账单操作列的「删除」
- 确认删除
- 预期：提示删除成功，账单从列表消失

### 4. 结算中心 ✅
**4.1 预览结算**
- 点击左侧菜单「结算中心」
- 点击「创建结算」
- 填写：
  - 名称：5月结算
  - 开始日期：本月1号
  - 结束日期：今天
- 点击「预览」
- 预期：显示余额明细和转账方案

**4.2 创建结算**
- 预览后点击「创建结算」
- 预期：提示创建成功，历史结算列表显示新结算

**4.3 查看结算详情**
- 点击结算记录的「查看」
- 预期：显示结算详情和转账记录

**4.4 确认结算**
- 点击待确认结算的「确认」
- 确认操作
- 预期：状态变为已完成

### 5. 个人欠款 ✅
**5.1 查看欠款概览**
- 点击左侧菜单「个人欠款」
- 预期：显示"我欠别人"和"别人欠我"的总金额

**5.2 标记转账**
- 在"待我付款"列表中，点击「去转账」
- 填写备注（可选）
- 点击「确认已转账」
- 预期：状态变为"待确认"，记录移到转账历史

**5.3 确认收款**
- 切换到 lisi 账号登录
- 在"待我收款"列表中，点击「确认收款」
- 确认操作
- 预期：状态变为"已完成"

---

## 🔍 API 测试（可选）

### 登录接口
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"zhangsan","password":"123456"}'
```

### 获取家庭列表
```bash
curl http://localhost:8080/api/family/my \
  -H "Authorization: Bearer {token}"
```

### 创建家庭
```bash
curl -X POST http://localhost:8080/api/family \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"name":"测试家庭","description":"API测试"}'
```

### 获取账单列表
```bash
curl http://localhost:8080/api/bills/family/{familyId} \
  -H "Authorization: Bearer {token}"
```

### 添加账单
```bash
curl -X POST http://localhost:8080/api/bills \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "title":"测试账单",
    "amount":100,
    "category":"餐饮",
    "familyId":1,
    "payerId":1,
    "splitType":1,
    "billDate":"2026-05-17",
    "remark":"测试"
  }'
```

---

## 🐛 常见问题排查

### 1. 后端启动失败
- 检查MySQL服务是否启动
- 检查数据库连接配置（application.yml）
- 确保数据库已正确导入

### 2. 前端无法连接后端
- 检查后端是否启动在8080端口
- 检查前端vue.config.js中的代理配置

### 3. 登录失败
- 检查数据库中sys_user表是否有测试数据
- 确认密码加密方式是否正确

### 4. 创建家庭后列表不显示
- 刷新页面
- 检查浏览器控制台是否有错误
- 查看后端日志确认接口调用成功
