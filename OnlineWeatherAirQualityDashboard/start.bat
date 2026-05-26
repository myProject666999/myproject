@echo off
echo ========================================
echo  空气质量看板 - 启动脚本
echo ========================================
echo.

echo [1/2] 启动后端服务...
cd /d "%~dp0backend"
start "后端服务 - Air Quality Dashboard" cmd /k "go run main.go"

echo.
timeout /t 3 /nobreak >nul

echo [2/2] 启动前端服务...
cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo 正在安装前端依赖...
    npm install
)
start "前端服务 - Air Quality Dashboard" cmd /k "npm run dev"

echo.
echo ========================================
echo  服务启动完成！
echo  前端地址: http://localhost:3000
echo  后端地址: http://localhost:8080
echo ========================================
echo.
pause
