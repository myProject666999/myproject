# Excel 在线查看器

无需 Office，在线查看 Excel 文件。

## 功能特性

- 📤 **Excel 文件上传** - 支持 .xlsx, .xls 格式
- 📑 **Sheet 切换** - 快速切换不同工作表
- 🔢 **公式显示** - 查看单元格公式和计算结果
- 📥 **导出 CSV** - 将当前 Sheet 导出为 CSV 文件
- 🔗 **分享功能** - 生成分享链接，支持有效期设置

## 技术栈

- **后端**: Gin (Go) + excelize + GORM + MySQL
- **前端**: Vue 3 + Element Plus + Axios
- **数据库**: MySQL

## 项目结构

```
ViewExcelOnline/
├── backend/                 # 后端项目
│   ├── config/             # 配置文件
│   ├── controllers/        # 控制器
│   ├── models/             # 数据模型
│   ├── routes/             # 路由配置
│   ├── utils/              # 工具函数
│   ├── uploads/            # 上传文件目录
│   ├── main.go             # 入口文件
│   └── go.mod              # Go 依赖
├── frontend/               # 前端项目
│   ├── src/
│   │   ├── views/          # 页面组件
│   │   ├── router/         # 路由配置
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── database.sql            # 数据库脚本
```

## 快速开始

### 1. 数据库配置

确保 MySQL 服务已启动，然后执行数据库脚本：

```bash
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < database.sql
```

### 2. 启动后端服务

```bash
cd backend
go run main.go
```

后端服务将在 `http://localhost:8080` 启动

### 3. 启动前端服务

```bash
cd frontend
npm install
npm run dev
```

前端服务将在 `http://localhost:3000` 启动

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/upload | 上传 Excel 文件 |
| GET | /api/excel/:id | 获取文件信息 |
| GET | /api/excel/:id/sheet | 获取 Sheet 数据 |
| GET | /api/excel/:id/export | 导出 CSV |
| POST | /api/excel/:id/share | 创建分享链接 |
| GET | /api/share/:token | 获取分享文件数据 |

## 使用说明

1. 打开浏览器访问 `http://localhost:3000`
2. 上传 Excel 文件
3. 在查看页面可以：
   - 切换不同的 Sheet
   - 点击"显示公式"查看单元格公式
   - 点击"导出CSV"下载当前工作表
   - 点击"分享"生成分享链接

## 注意事项

- 确保 MySQL 服务正常运行，用户名 root，密码 123456
- 上传的文件将保存在 backend/uploads 目录
- 公式显示支持 excelize 库支持的所有公式类型
