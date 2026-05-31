@echo off
echo ========================================
echo  餐厅排队叫号系统 - 前端启动
echo ========================================
echo.

cd /d "%~dp0frontend"

echo [1/3] 检查Node.js...
node --version
if errorlevel 1 (
    echo 错误: 未检测到Node.js，请先安装Node.js
    pause
    exit /b 1
)

echo.
echo [2/3] 安装npm依赖...
if not exist "node_modules" (
    call npm install
    if errorlevel 1 (
        echo 依赖安装失败，请检查网络连接
        pause
        exit /b 1
    )
) else (
    echo 依赖已存在，跳过安装
)

echo.
echo [3/3] 启动前端开发服务器 (端口 5173)...
echo 访问地址: http://127.0.0.1:5173
echo.
echo 按 Ctrl+C 停止服务
echo ========================================
echo.

call npm run dev

pause
