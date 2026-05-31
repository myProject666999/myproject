@echo off
echo ========================================
echo   在线借还物品系统 - 启动脚本
echo ========================================
echo.

echo [1/2] 安装后端依赖...
cd backend
go mod tidy
if %errorlevel% neq 0 (
    echo 后端依赖安装失败!
    pause
    exit /b 1
)
echo 后端依赖安装完成!
echo.

echo [2/2] 安装前端依赖...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo 前端依赖安装失败!
    pause
    exit /b 1
)
echo 前端依赖安装完成!
echo.

echo ========================================
echo   依赖安装完成!
echo ========================================
echo.
echo 启动后端服务:
echo   cd backend
echo   go run main.go
echo.
echo 启动前端服务(新终端):
echo   cd frontend
echo   npm run dev
echo.
echo 访问地址: http://localhost:5173
echo.
pause
