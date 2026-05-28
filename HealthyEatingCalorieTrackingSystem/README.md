# 健康饮食与卡路里追踪系统

一款帮助用户管理日常饮食、记录运动消耗、追踪体重变化的健康管理应用。通过科学的热量计算和营养分析，帮助用户实现健康管理目标。

## 功能特性

### 🔐 用户认证
- 用户注册/登录
- JWT 身份认证
- 个人信息管理

### 📊 数据仪表盘
- 今日热量概览（摄入/消耗/剩余）
- 环形进度图展示热量目标完成度
- 营养成分分析（蛋白质/脂肪/碳水）
- 近7天热量趋势图
- 体重变化趋势图
- 今日饮食/运动记录快速预览

### 🍽️ 饮食记录
- 按餐次（早餐/午餐/晚餐/加餐）分组显示
- 食物搜索（支持关键词和分类筛选）
- 自动计算热量和营养成分
- 添加/编辑/删除记录
- 36种常见食物营养数据

### 🏃 运动记录
- 20种运动类型选择
- 自动计算消耗热量
- 添加/编辑/删除记录
- 运动时长和消耗统计

### 🍎 食物库
- 按分类浏览（主食/肉类/蔬菜/水果/乳制品/零食/饮料）
- 搜索功能
- 食物营养详情查看

### 👤 个人中心
- 基本信息管理（身高/体重/年龄/性别/活动水平）
- 目标设置（每日热量目标/目标体重/目标类型）
- BMR 和 TDEE 自动计算
- 个性化热量建议

## 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite 6
- **UI 组件库**: Ant Design 5
- **样式**: Tailwind CSS 3
- **图表**: Recharts 2
- **路由**: React Router 7
- **状态管理**: Zustand
- **HTTP 客户端**: Axios
- **图标**: Lucide React
- **日期处理**: Day.js

### 后端
- **运行环境**: Node.js 18+
- **Web 框架**: Express 4
- **身份认证**: JWT (jsonwebtoken)
- **密码加密**: bcryptjs
- **ORM**: Sequelize 6
- **数据库**: MySQL 8.0

### 数据库
- 用户表
- 食物库表（50+ 种食物）
- 饮食记录表
- 运动记录表
- 运动类型表（20 种）
- 体重记录表
- 用户目标设置表
- 每日统计表

## 计算公式

### BMR (基础代谢率)
**Mifflin-St Jeor 公式：**
- 男性: `BMR = 10 × 体重(kg) + 6.25 × 身高(cm) - 5 × 年龄 + 5`
- 女性: `BMR = 10 × 体重(kg) + 6.25 × 身高(cm) - 5 × 年龄 - 161`

### TDEE (总能量消耗)
`TDEE = BMR × 活动系数`

| 活动水平 | 活动系数 |
|----------|----------|
| 久坐 | 1.2 |
| 轻度活动 | 1.375 |
| 中度活动 | 1.55 |
| 高度活动 | 1.725 |
| 极高活动 | 1.9 |

### 每日热量目标
- **减脂**: `目标 = TDEE - 400 kcal`
- **维持**: `目标 = TDEE`
- **增肌**: `目标 = TDEE + 400 kcal`

## 快速开始

### 演示模式（推荐）

项目已内置 Mock 数据，无需数据库即可直接运行体验：

1. **安装依赖**
```bash
npm install
```

2. **启动开发服务器**
```bash
npm run dev
```

3. **访问应用**
打开浏览器访问 `http://localhost:5175`

4. **登录演示账号**
- 用户名: `demo`
- 密码: 任意密码

### 连接真实数据库

1. **初始化数据库**
```bash
# 在 MySQL 中执行初始化脚本
mysql -u root -p < database/init.sql
```

2. **配置环境变量**
复制 `.env.example` 为 `.env` 并修改数据库配置：
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=healthy_eating_db
```

3. **关闭 Mock 模式**
修改 `src/api/request.ts` 中的 `USE_MOCK` 为 `false`

4. **启动服务**
```bash
npm run dev
```

## 项目结构

```
HealthyEatingCalorieTrackingSystem/
├── api/                          # 后端代码
│   ├── config/                   # 配置文件
│   │   ├── database.ts          # 数据库配置
│   │   └── jwt.ts               # JWT 配置
│   ├── controllers/              # 控制器
│   ├── middleware/               # 中间件
│   │   ├── auth.ts              # JWT 认证中间件
│   │   ├── mockData.ts          # Mock 数据中间件
│   │   └── errorHandler.ts      # 错误处理中间件
│   ├── models/                   # 数据模型
│   ├── routes/                   # 路由
│   ├── utils/                    # 工具函数
│   │   ├── bmrCalculator.ts     # BMR 计算器
│   │   └── calorieCalculator.ts # 卡路里计算器
│   ├── app.ts                   # Express 应用
│   └── server.ts                # 服务器入口
├── database/                     # 数据库
│   └── init.sql                 # 初始化脚本
├── shared/                       # 共享类型定义
│   └── types.ts
├── src/                          # 前端代码
│   ├── api/                      # API 接口
│   │   ├── request.ts           # 请求封装
│   │   ├── auth.ts
│   │   ├── foods.ts
│   │   ├── meals.ts
│   │   ├── exercises.ts
│   │   ├── weights.ts
│   │   ├── goals.ts
│   │   └── stats.ts
│   ├── components/               # 公共组件
│   │   ├── Layout/
│   │   │   └── MainLayout.tsx   # 主布局
│   │   └── Charts/              # 图表组件
│   │       ├── CalorieRing.tsx
│   │       ├── NutrientBar.tsx
│   │       └── TrendLine.tsx
│   ├── pages/                    # 页面组件
│   │   ├── Login/
│   │   ├── Register/
│   │   ├── Dashboard/
│   │   ├── Meals/
│   │   ├── Exercises/
│   │   ├── FoodLibrary/
│   │   └── Profile/
│   ├── store/                    # 状态管理
│   │   ├── useAuthStore.ts
│   │   └── useDataStore.ts
│   ├── types/                    # TypeScript 类型
│   ├── utils/                    # 工具函数
│   │   ├── formatters.ts
│   │   └── mockServer.ts        # Mock 服务器
│   ├── router/                   # 路由配置
│   ├── App.tsx
│   └── main.tsx
├── .env                          # 环境变量
├── .env.example                  # 环境变量示例
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## API 接口

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息
- `PUT /api/auth/profile` - 更新用户信息

### 食物接口
- `GET /api/foods` - 获取食物列表
- `GET /api/foods/:id` - 获取食物详情

### 饮食记录接口
- `GET /api/meals` - 获取饮食记录
- `POST /api/meals` - 添加饮食记录
- `PUT /api/meals/:id` - 更新饮食记录
- `DELETE /api/meals/:id` - 删除饮食记录

### 运动记录接口
- `GET /api/exercises/types` - 获取运动类型
- `GET /api/exercises` - 获取运动记录
- `POST /api/exercises` - 添加运动记录
- `PUT /api/exercises/:id` - 更新运动记录
- `DELETE /api/exercises/:id` - 删除运动记录

### 体重记录接口
- `GET /api/weights` - 获取体重记录
- `POST /api/weights` - 添加体重记录

### 目标设置接口
- `GET /api/goals` - 获取目标设置
- `PUT /api/goals` - 更新目标设置

### 统计接口
- `GET /api/stats/daily` - 获取每日统计
- `GET /api/stats/trend` - 获取趋势数据

## 设计规范

### 设计风格
- **主色调**: 健康绿色 (#10B981)
- **辅助色**: 橙色 (#F59E0B)、蓝色 (#3B82F6)
- **字体**: Noto Sans SC
- **布局**: 卡片式布局
- **图标**: Lucide 线性图标

### 响应式设计
- 桌面端: ≥ 1280px
- 平板端: 768px - 1279px
- 移动端: < 768px

## 开发说明

### 可用命令

```bash
# 安装依赖
npm install

# 启动开发服务器（前端 + 后端）
npm run dev

# 仅启动前端
npm run client:dev

# 仅启动后端
npm run server:dev

# 类型检查
npm run check

# 代码检查
npm run lint

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 演示账号

项目内置了演示数据，可以直接使用以下账号登录体验：
- **用户名**: `demo`
- **密码**: 任意密码（演示模式不校验）

## License

MIT
