# 网页转PDF (Webpage to PDF)

基于 Gin + Vue + chromedp 开发的网页转PDF应用，支持样式选择、分页、目录生成和批量转换。

## 功能特性

- ✅ URL输入转换
- 🎨 多种样式选择（默认、简洁、深色、电子书）
- 📄 灵活分页格式（A4、A3、A5、Letter、Legal）
- 📑 自动提取标题生成目录
- 🔄 批量转换支持
- 📜 转换历史记录管理

## 技术栈

### 后端
- **Gin** - Web框架
- **chromedp** - Chrome DevTools Protocol，用于网页渲染和PDF生成
- **GORM** - ORM框架
- **MySQL** - 数据库

### 前端
- **Vue 3** - 前端框架
- **Element Plus** - UI组件库
- **Axios** - HTTP客户端
- **Vite** - 构建工具

## 项目结构

```
ConvertWebpage2PDF/
├── backend/                 # 后端Go项目
│   ├── config/             # 配置文件
│   ├── controllers/        # 控制器
│   ├── models/             # 数据模型
│   ├── services/           # 业务服务
│   ├── output/             # PDF输出目录（自动创建）
│   ├── .env                # 环境变量
│   ├── go.mod              # Go依赖
│   └── main.go             # 入口文件
├── frontend/               # 前端Vue项目
│   ├── src/
│   │   ├── views/          # 页面组件
│   │   ├── router/         # 路由配置
│   │   ├── App.vue         # 根组件
│   │   └── main.js         # 入口文件
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── database/               # 数据库脚本
│   └── init.sql            # 初始化脚本
└── README.md
```

## 快速开始

### 1. 导入数据库

#### 方式一：使用MySQL命令行
```bash
# Windows (在MySQL安装目录的bin目录下执行)
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < database\init.sql

# 或进入MySQL后执行
source d:/data/Workspace/myproject/ConvertWebpage2PDF/database/init.sql
```

#### 方式二：使用Navicat等工具
1. 连接本地MySQL (127.0.0.1:3306, root/123456)
2. 打开并执行 `database/init.sql`

### 2. 启动后端服务

```bash
cd backend

# 下载依赖
go mod download

# 启动服务
go run main.go
```

后端服务将在 `http://localhost:8080` 启动

### 3. 启动前端服务

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务将在 `http://localhost:3000` 启动

## API接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/convert | 创建转换任务 |
| GET | /api/job/:id | 获取任务状态 |
| GET | /api/download/:id | 下载PDF文件 |
| GET | /api/history | 获取转换历史 |
| DELETE | /api/job/:id | 删除任务 |
| POST | /api/batch | 创建批量转换任务 |
| GET | /api/batch/:id | 获取批量任务状态 |

## 核心功能说明

### 样式选择

1. **默认样式** - 保留网页原有样式
2. **简洁模式** - 移除导航、广告等，聚焦内容
3. **深色模式** - 深色背景护眼模式
4. **电子书模式** - 优化阅读体验，适合长篇文章

### 目录生成

自动提取页面中的 h1-h4 标题生成带层级的目录页面，支持点击跳转。

### 分页格式

支持 A4、A3、A5、Letter、Legal 多种纸张格式，自动处理分页和页眉页脚。

### 批量转换

支持一次输入多个URL，后台逐个转换，可在历史记录查看结果。

## 配置说明

编辑 `backend/.env` 文件修改配置：

```env
DB_HOST=127.0.0.1        # 数据库地址
DB_PORT=3306             # 数据库端口
DB_USER=root             # 数据库用户名
DB_PASSWORD=123456       # 数据库密码
DB_NAME=web2pdf          # 数据库名
SERVER_PORT=8080         # 服务端口
PDF_OUTPUT_DIR=./output  # PDF输出目录
CHROME_PATH=             # Chrome可执行文件路径（可选）
```

## 注意事项

1. 系统需安装 Chrome/Chromium 浏览器，chromedp 会自动检测
2. 首次运行会自动下载 Chrome Driver
3. PDF 文件保存在 `backend/output` 目录
4. 建议使用 Chrome 浏览器访问前端获得最佳体验

## License

MIT
