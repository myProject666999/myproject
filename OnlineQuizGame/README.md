# 在线测验小游戏（知识竞赛）

一个功能完整的在线知识竞赛游戏，支持答题、计分、排行榜等功能。

## 项目特性

- 🎯 **题目分类**：支持科学、历史、地理、文学、体育、生活等多个分类
- ⏱️ **限时答题**：每题30秒限时，超时自动判错
- 🔥 **连击奖励**：连续答对可获得额外加分
- 🏆 **排行榜**：支持日榜、周榜、总榜（基于Redis ZSet实现）
- 📊 **答题历史**：查看历史答题记录和详细解析
- 🔒 **防作弊**：服务端计时校验，防止客户端作弊

## 技术栈

### 后端
- **语言**: Golang 1.21
- **框架**: Gin
- **数据库**: MySQL 8.0
- **缓存**: Redis 7.0（排行榜）
- **ORM**: GORM

### 前端
- **框架**: Vue 3
- **构建工具**: Vite
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router

## 项目结构

```
OnlineQuizGame/
├── backend/                    # 后端Go项目
│   ├── config/                 # 配置文件
│   ├── database/               # 数据库连接
│   ├── handlers/               # 请求处理
│   ├── middleware/             # 中间件
│   ├── models/                 # 数据模型
│   ├── main.go                 # 入口文件
│   └── go.mod                  # 依赖管理
├── frontend/                   # 前端Vue3项目
│   ├── src/
│   │   ├── api/                # API接口
│   │   ├── router/             # 路由配置
│   │   ├── store/              # 状态管理
│   │   ├── styles/             # 样式文件
│   │   └── views/              # 页面组件
│   ├── index.html              # HTML模板
│   ├── package.json            # 依赖配置
│   └── vite.config.js          # Vite配置
├── database/
│   └── init.sql                # 数据库初始化脚本
├── init-database.bat           # 数据库初始化脚本
├── start-backend.bat           # 后端启动脚本
└── start-frontend.bat          # 前端启动脚本
```

## 快速开始

### 1. 环境要求

- Go 1.21+
- Node.js 18+
- MySQL 8.0+
- Redis 7.0+

### 2. 数据库初始化

#### 方式一：使用初始化脚本

双击运行 `init-database.bat`，按提示输入MySQL用户名和密码。

#### 方式二：手动导入

```bash
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < database/init.sql
```

### 3. 启动后端

```bash
cd backend
go mod download
go run main.go
```

或双击运行 `start-backend.bat`

后端服务地址: http://localhost:8080

### 4. 启动前端

```bash
cd frontend
npm install
npm run dev
```

或双击运行 `start-frontend.bat`

前端服务地址: http://localhost:3000

## API接口

### 用户相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/login` | 用户登录/注册 |

### 分类相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/categories` | 获取题目分类 |

### 答题相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/quiz/start` | 开始答题 |
| POST | `/api/quiz/submit` | 提交答案 |
| POST | `/api/quiz/finish` | 结束答题 |

### 排行榜相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/leaderboard` | 获取排行榜 |
| GET | `/api/user/rank` | 获取用户排名 |

### 历史记录

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/history` | 获取答题历史 |
| GET | `/api/game/detail` | 获取答题详情 |

### 题目管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/questions` | 获取题目列表 |
| POST | `/api/questions` | 添加题目 |
| PUT | `/api/questions/:id` | 更新题目 |
| DELETE | `/api/questions/:id` | 删除题目 |

## 数据库设计

### users 用户表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| username | VARCHAR(50) | 用户名（唯一） |
| nickname | VARCHAR(50) | 昵称 |
| avatar | VARCHAR(255) | 头像 |
| total_score | INT | 总得分 |
| total_games | INT | 总游戏数 |

### categories 分类表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| name | VARCHAR(50) | 分类名称 |
| icon | VARCHAR(255) | 图标 |
| description | VARCHAR(255) | 描述 |

### questions 题目表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| category_id | INT | 分类ID |
| question_text | TEXT | 题目内容 |
| option_a/b/c/d | VARCHAR(500) | 四个选项 |
| correct_answer | CHAR(1) | 正确答案 |
| explanation | TEXT | 答案解析 |
| difficulty | TINYINT | 难度（1-3） |

### game_records 游戏记录表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| user_id | BIGINT | 用户ID |
| category_id | INT | 分类ID |
| total_questions | INT | 总题数 |
| correct_count | INT | 正确数 |
| score | INT | 得分 |
| max_combo | INT | 最高连击 |

### answer_details 答题详情表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| game_record_id | BIGINT | 游戏记录ID |
| question_id | BIGINT | 题目ID |
| user_answer | CHAR(1) | 用户答案 |
| is_correct | TINYINT | 是否正确 |
| time_spent | INT | 答题耗时（秒） |

## Redis Key设计

| Key | 类型 | 说明 |
|-----|------|------|
| `leaderboard:daily` | ZSet | 日榜 |
| `leaderboard:weekly` | ZSet | 周榜 |
| `leaderboard:total` | ZSet | 总榜 |
| `quiz_session:{gameId}` | String | 答题会话 |

## 页面说明

1. **开始页 (/)**：用户登录、选择分类和题目数量
2. **答题页 (/quiz)**：显示题目、选项、倒计时和答案反馈
3. **结算页 (/result)**：显示得分、正确率、最高连击等统计
4. **排行榜页 (/leaderboard)**：展示日榜、周榜、总榜前三名和列表
5. **解析页 (/analysis)**：查看本轮答题的详细解析
6. **历史页 (/history)**：查看历史答题记录和详情

## 配置说明

后端配置文件: `backend/.env`

```env
SERVER_PORT=:8080           # 服务器端口
MYSQL_DSN=...               # MySQL连接串
REDIS_ADDR=127.0.0.1:6379   # Redis地址
REDIS_PASS=                 # Redis密码
REDIS_DB=0                  # Redis数据库索引
QUIZ_TIME=30                # 每题限时（秒）
COMBO_BONUS=50              # 连击奖励分数
```

## License

MIT
