# 离线下载器

一个基于 Gin + Vue + aria2 的离线下载器，支持 HTTP 和磁力链下载。

## 功能特性

- ✅ 支持 HTTP/HTTPS 链接下载
- ✅ 支持磁力链（Magnet）下载
- ✅ 下载队列管理（暂停、继续、删除）
- ✅ 文件库浏览与管理
- ✅ 音视频在线播放
- ✅ 文件下载与清理
- ✅ 自动扫描下载目录
- ✅ 实时下载进度更新

## 技术栈

### 后端
- Go 1.20+
- Gin Web 框架
- GORM ORM
- MySQL 数据库
- aria2 下载引擎

### 前端
- Vue 3 + Vite
- Element Plus UI 组件库
- Vue Router
- Axios HTTP 客户端

## 项目结构

```
OfflineDownloader/
├── backend/                    # 后端代码
│   ├── app/
│   │   ├── controllers/        # 控制器
│   │   ├── models/             # 数据模型
│   │   ├── services/           # 业务服务
│   │   ├── middleware/         # 中间件
│   │   └── routes/             # 路由定义
│   ├── config/                 # 配置管理
│   ├── database/               # 数据库相关
│   │   └── scripts/            # SQL 脚本
│   ├── utils/                  # 工具函数
│   ├── aria2/                  # aria2 配置
│   ├── uploads/                # 上传目录
│   ├── downloads/              # 下载目录
│   ├── .env                    # 环境配置
│   ├── main.go                 # 程序入口
│   └── go.mod
├── frontend/                   # 前端代码
│   ├── src/
│   │   ├── api/                 # API 接口
│   │   ├── views/               # 页面组件
│   │   ├── router/              # 路由配置
│   │   ├── components/          # 公共组件
│   │   └── main.js              # 入口文件
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 快速开始

### 环境要求

- MySQL 5.7+
- Go 1.20+
- Node.js 16+
- aria2（需安装并运行）

### 数据库配置

数据库已自动初始化，配置信息如下：
- 主机：127.0.0.1
- 端口：3306
- 用户名：root
- 密码：123456
- 数据库名：offline_downloader

数据库脚本位于 `backend/database/scripts/init.sql`

### 安装 aria2

**Windows:**
```bash
# 下载 aria2 并添加到 PATH
# 或使用 choco 安装
choco install aria2
```

**Linux:**
```bash
sudo apt install aria2
# 或
sudo yum install aria2
```

**macOS:**
```bash
brew install aria2
```

### 启动 aria2

```bash
cd backend
aria2c --conf-path=./aria2/aria2.conf
```

### 后端启动

```bash
cd backend

# 初始化数据库（首次运行）
go run ./tools/init_db.go

# 安装依赖
go mod tidy

# 构建并运行
go build -o offlinedownloader.exe .
./offlinedownloader.exe

# 或直接运行
go run main.go
```

后端服务将在 `http://127.0.0.1:8080` 启动

### 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build
```

前端开发服务将在 `http://127.0.0.1:3000` 启动

## API 接口文档

### 下载任务接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/tasks | 添加下载任务 |
| GET | /api/tasks | 获取任务列表 |
| GET | /api/tasks/:id | 获取任务详情 |
| PUT | /api/tasks/:id/pause | 暂停任务 |
| PUT | /api/tasks/:id/resume | 继续任务 |
| DELETE | /api/tasks/:id | 删除任务 |
| PUT | /api/tasks/pause-all | 暂停全部 |
| PUT | /api/tasks/resume-all | 继续全部 |
| DELETE | /api/tasks/clear-completed | 清空已完成 |

### 文件管理接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/files | 获取文件列表 |
| GET | /api/files/:id | 获取文件详情 |
| DELETE | /api/files/:id | 删除文件 |
| GET | /api/files/:id/play | 播放文件 |
| GET | /api/files/:id/download | 下载文件 |
| GET | /api/files/:id/thumbnail | 获取缩略图 |
| GET | /api/files/task/:task_id | 获取任务关联文件 |
| POST | /api/files/scan | 扫描下载目录 |
| GET | /api/files/statistics | 获取文件统计 |

### 其他接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/statistics | 获取系统统计 |
| GET | /health | 健康检查 |

## 页面说明

### 任务页面
- 添加下载任务（支持 HTTP/磁力链）
- 查看下载队列
- 实时显示下载进度、速度
- 任务管理（暂停、继续、删除）
- 按状态筛选任务

### 文件库页面
- 查看已下载文件
- 按类型筛选（视频、音频、图片）
- 搜索文件名
- 在线播放音视频
- 文件下载与删除
- 下载目录扫描
- 统计信息展示

## 配置说明

### 后端配置（.env）

```env
# 服务配置
SERVER_HOST=0.0.0.0
SERVER_PORT=8080

# 数据库配置
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=offline_downloader

# aria2 配置
ARIA2_RPC_URL=http://127.0.0.1:6800/jsonrpc
ARIA2_RPC_SECRET=

# 下载配置
DOWNLOAD_PATH=./downloads
MAX_CONCURRENT=5
```

### aria2 配置（aria2/aria2.conf）

```conf
dir=./downloads
max-concurrent-downloads=5
max-connection-per-server=16
split=16
min-split-size=10M
continue=true
enable-rpc=true
rpc-listen-all=true
rpc-listen-port=6800
rpc-allow-origin-all=true
rpc-secret=
seed-ratio=1.0
seed-time=60
```

## 磁力链支持说明

磁力链下载依赖 aria2 的 BT 功能，需要确保：
1. aria2 已正确安装并启用 DHT
2. 防火墙已开放相应端口
3. 网络环境支持 P2P 连接

## 注意事项

1. 首次运行请先启动 aria2，再启动后端服务
2. 下载目录需要有读写权限
3. 磁力链下载可能需要较长时间连接 peers
4. 建议使用绝对路径配置下载目录
5. 定期清理已完成的任务和不需要的文件

## 常见问题

**Q: 后端启动失败，提示无法连接数据库？**
A: 请确保 MySQL 服务已启动，并且配置信息正确。首次运行请执行 `go run ./tools/init_db.go` 初始化数据库。

**Q: 任务一直处于等待中？**
A: 请检查 aria2 是否正常运行，RPC 地址和端口是否正确。

**Q: 磁力链下载速度慢？**
A: 磁力链需要连接 peers 才能下载，可以等待一段时间或尝试使用热门资源。

**Q: 文件播放失败？**
A: 请检查文件是否已下载完成，以及浏览器是否支持该视频格式。

## License

MIT
