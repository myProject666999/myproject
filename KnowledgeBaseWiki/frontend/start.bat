@echo off
echo ========================================
echo 知识库Wiki系统 - 前端服务启动
echo ========================================
echo.

echo 检查Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js未找到，请确保Node.js已安装并添加到系统PATH
    pause
    exit /b 1
)

echo.
if not exist "node_modules" (
    echo 安装依赖...
    npm install
    if errorlevel 1 (
        echo [ERROR] 依赖安装失败！
        pause
        exit /b 1
    )
) else (
    echo 依赖已存在
)

echo.
echo ========================================
echo 启动前端服务...
echo 服务地址: http://localhost:3000
echo ========================================
echo.

npm start
