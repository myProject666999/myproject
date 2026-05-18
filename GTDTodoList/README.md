# GTD待办事项管理系统

基于 Getting Things Done (GTD) 方法论的待办事项管理应用。

## 技术栈

- **后端**: Spring Boot 2.7.18 + JPA + MySQL
- **前端**: Vue 3 + Element Plus + Vue Router + Vuex
- **数据库**: MySQL 5.7+

## 核心功能

1. **收件箱 (Inbox)**: 快速收集所有待处理事项，支持拖拽排序
2. **今日待办 (Today)**: 四象限视图展示今日任务（紧急/重要矩阵），支持拖拽调整
3. **项目管理 (Projects)**: 按项目分组管理任务，支持自定义项目颜色
4. **每周回顾 (Review)**: 自动生成周回顾报告，统计任务完成情况

## 数据库配置

数据库已连接并导入完成，配置如下：

- 主机: 127.0.0.1
- 端口: 3306
- 用户名: root
- 密码: 123456
- 数据库名: gtd_todo

## 启动方式

### 后端启动

```bash
cd backend
mvn spring-boot:run
```

后端服务将在 http://localhost:8080 启动

### 前端启动

```bash
cd frontend
npm install
npm run serve
```

前端服务将在 http://localhost:3000 启动

## 项目结构

```
GTDTodoList/
├── backend/                 # Spring Boot 后端
│   ├── src/main/java/com/gtd/
│   │   ├── controller/      # 控制层
│   │   ├── entity/          # 实体类
│   │   ├── repository/      # 数据访问层
│   │   └── service/         # 业务逻辑层
│   └── pom.xml
├── frontend/                # Vue 前端
│   ├── src/
│   │   ├── api/             # API 接口
│   │   ├── views/           # 页面组件
│   │   ├── router/          # 路由配置
│   │   └── store/           # 状态管理
│   └── package.json
└── sql/                     # 数据库脚本
    └── gtd_todo.sql
```

## API 接口

- **收件箱**: `/api/inbox`
- **任务**: `/api/tasks`
- **项目**: `/api/projects`
- **上下文标签**: `/api/contexts`
- **周回顾**: `/api/reviews`

## 默认数据

系统已预置以下测试数据：
- 用户: admin
- 项目: 工作项目、个人成长、家庭生活、健康运动
- 上下文: 办公室、家里、外出、电话、电脑
- 示例任务和收件箱事项
