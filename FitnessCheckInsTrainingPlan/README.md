# 健身打卡与训练计划

一个帮助健身爱好者记录训练、跟踪进度并坚持打卡习惯的全栈应用。

## 技术栈

- **后端**: Golang + Gin
- **前端**: Vue3 + Vite
- **数据库**: SQLite
- **UI**: Tailwind CSS (移动端优先响应式设计)

## 核心功能

- 📋 **训练计划制定**: 动作库、组数/次数/重量配置
- ✅ **每日打卡**: 训练日志记录
- 📊 **身体数据追踪**: 体重/围度记录与曲线展示
- 🏆 **成就系统**: 连续打卡天数与成就徽章
- 📅 **打卡日历**: 可视化展示训练记录

## 项目结构

```
FitnessCheckInsTrainingPlan/
├── backend/          # Golang 后端
├── frontend/         # Vue3 前端
└── README.md
```

## 快速开始

### 后端启动

```bash
cd backend
go mod download
go run main.go
```

### 前端启动

```bash
cd frontend
npm install
npm run dev
```
