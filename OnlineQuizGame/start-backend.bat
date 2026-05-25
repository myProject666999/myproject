@echo off
echo ============================================
echo 在线测验小游戏 - 后端启动脚本
echo ============================================
echo.

cd backend

echo 正在下载依赖...
go mod download

echo.
echo 正在启动后端服务...
echo 服务地址: http://localhost:8080
echo.

go run main.go

pause
