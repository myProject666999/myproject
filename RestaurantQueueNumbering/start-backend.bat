@echo off
echo ========================================
echo  餐厅排队叫号系统 - 后端启动
echo ========================================
echo.

cd /d "%~dp0backend"

echo [1/3] 检查Go依赖...
go mod download
if errorlevel 1 (
    echo 依赖下载失败，请检查网络连接
    pause
    exit /b 1
)

echo.
echo [2/3] 检查配置文件...
if not exist ".env" (
    echo 警告: .env 文件不存在，将使用默认配置
)

echo.
echo [3/3] 启动后端服务 (端口 8080)...
echo 服务地址: http://127.0.0.1:8080
echo API文档: http://127.0.0.1:8080/api/
echo WebSocket: ws://127.0.0.1:8080/ws
echo.
echo 按 Ctrl+C 停止服务
echo ========================================
echo.

go run main.go

pause
