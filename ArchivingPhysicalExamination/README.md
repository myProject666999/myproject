# 体检报告归档系统

## 项目简介

体检报告归档系统，用于管理和跟踪年度体检报告，支持报告上传、指标录入、趋势分析、异常提醒和年度对比等功能。

## 技术栈

- 后端：Spring Boot 2.7 + MyBatis-Plus + MySQL
- 前端：Vue 2 + Element UI + ECharts

## 数据库配置

数据库连接信息（已配置）：
- 地址：127.0.0.1
- 端口：3306
- 数据库：physical_examination
- 用户名：root
- 密码：123456

数据库脚本已自动导入，无需手动执行。

## 项目结构

```
ArchivingPhysicalExamination/
├── backend/                    # 后端项目
│   ├── src/main/java/com/health/physical/
│   │   ├── common/            # 公共类
│   │   ├── config/            # 配置类
│   │   ├── controller/        # 控制器
│   │   ├── entity/          # 实体类
│   │   ├── mapper/          # Mapper接口
│   │   ├── service/         # 服务层
│   │   │   └── impl/      # 服务实现
│   │   └── vo/              # 视图对象
│   ├── src/main/resources/
│   │   └── application.yml   # 配置文件
│   └── pom.xml
├── frontend/                   # 前端项目
│   ├── src/
│   │   ├── api/               # API接口
│   │   ├── assets/            # 静态资源
│   │   ├── components/      # 组件
│   │   ├── router/           # 路由配置
│   │   ├── utils/            # 工具类
│   │   └── views/            # 页面
│   ├── public/
│   └── package.json
└── sql/
    └── init.sql               # 数据库脚本
```

## 启动方式

### 启动后端：

```bash
cd backend
mvn spring-boot:run
```

后端服务启动在：http://localhost:8080

### 启动前端：

```bash
cd frontend
npm install
npm run serve
```

前端服务启动在：http://localhost:3000

## 功能模块

### 1. 报告列表
- 查看所有体检报告
- 显示报告基本信息
- 显示异常指标数量
- 支持查看详情和删除

### 2. 新增报告
- 录入报告基本信息
- 上传报告文件
- 录入体检指标数据
- 自动检测异常指标

### 3. 报告详情
- 查看报告基本信息
- 按类别查看指标
- 异常指标提醒
- 显示异常描述和建议

### 4. 指标趋势
- 选择指标查看历史趋势
- 图表展示变化情况
- 显示正常范围参考线

### 5. 年度对比
- 选择两个年份进行对比
- 显示指标变化值和变化率

### 6. 异常规则配置
- 配置指标正常范围
- 配置警告级别
- 启用/禁用规则

## 数据库表结构

- user: 用户表
- exam_report: 体检报告表
- exam_indicator: 体检指标表
- indicator_category: 指标类别表
- abnormal_rule: 异常规则配置表
