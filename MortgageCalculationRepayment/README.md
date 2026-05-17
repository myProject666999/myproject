# 房贷计算与还款规划系统

## 项目简介

一个功能完整的房贷计算与还款规划系统，支持等额本息/等额本金计算、提前还款模拟、利率变化模拟、还款进度跟踪等核心功能。

## 技术栈

- **后端**: Spring Boot 3.2.0 + MyBatis Plus + MySQL
- **前端**: Vue 3 + Vite + Element Plus + ECharts
- **数据库**: MySQL 8.0+

## 数据库配置

### 连接信息

- 地址: 127.0.0.1
- 端口: 3306
- 用户名: root
- 密码: 123456
- 数据库名: mortgage_calculator

### 导入数据库脚本

方法一：使用 MySQL 命令行

```bash
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < database/mortgage_calculator.sql
```

方法二：使用 PowerShell

```powershell
Get-Content "database\mortgage_calculator.sql" | & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -h 127.0.0.1 -P 3306 -u root -p123456
```

方法三：使用 Navicat/DBeaver 等图形化工具

1. 连接到本地 MySQL 数据库
2. 新建查询，执行 `database/mortgage_calculator.sql` 文件内容

### 数据库表结构

- `loan_scheme`: 贷款方案表
- `repayment_plan`: 还款计划表
- `prepayment_record`: 提前还款记录表
- `interest_rate_adjustment`: 利率调整记录表

## 项目结构

```
MortgageCalculationRepayment/
├── database/                    # 数据库脚本
│   └── mortgage_calculator.sql
├── backend/                     # Spring Boot 后端
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/mortgage/
│       │   ├── MortgageCalculatorApplication.java
│       │   ├── common/          # 通用响应类
│       │   ├── controller/      # 控制器
│       │   ├── dto/             # 数据传输对象
│       │   ├── entity/          # 实体类
│       │   ├── enums/           # 枚举类
│       │   ├── mapper/          # 数据访问层
│       │   ├── service/         # 业务逻辑层
│       │   └── vo/              # 视图对象
│       └── resources/
│           └── application.yml  # 配置文件
└── frontend/                    # Vue 前端
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.js
        ├── App.vue
        ├── router/              # 路由配置
        ├── api/                 # API 接口
        └── views/               # 页面组件
            ├── Calculator.vue   # 贷款计算器
            ├── Schemes.vue      # 方案对比
            ├── Calendar.vue     # 还款日历
            └── Statistics.vue   # 统计概览
```

## 快速开始

### 启动后端

```bash
cd backend
mvn spring-boot:run
```

后端服务将在 http://localhost:8080 启动

### 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端服务将在 http://localhost:5173 启动

## 核心功能

### 1. 贷款计算器
- 支持等额本息和等额本金两种还款方式
- 实时计算月供、总利息、还款总额
- 可视化展示本金与利息构成
- 支持保存计算方案

### 2. 方案对比
- 多方案并排对比
- 详细的还款进度展示
- 提前还款模拟
  - **减期策略**: 月供不变，缩短还款期限
  - **减额策略**: 期限不变，减少每月月供
- 对比两种策略节省的利息

### 3. 还款日历
- 日历视图展示每月还款计划
- 区分已还/待还状态
- 本月还款明细列表

### 4. 统计概览
- 全局贷款统计（贷款总额、已还本金、已付利息等）
- 贷款构成饼图分析
- 还款进度可视化
- 剩余利息提醒

## 贷款计算公式

### 等额本息

月供 = 贷款本金 × [月利率 × (1+月利率)^还款月数] ÷ [(1+月利率)^还款月数 - 1]

### 等额本金

月供 = (贷款本金 ÷ 还款月数) + (贷款本金 - 已归还本金累计额) × 月利率

## API 接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/calculator/calculate | 贷款计算 |
| POST | /api/calculator/prepayment | 提前还款模拟 |
| GET | /api/loan-schemes | 获取方案列表 |
| POST | /api/loan-schemes | 新增方案 |
| GET | /api/loan-schemes/{id}/detail | 获取方案详情 |
| GET | /api/loan-schemes/statistics | 获取统计数据 |
| GET | /api/repayment-plans/scheme/{schemeId} | 获取还款计划 |
