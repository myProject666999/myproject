@echo off
echo ========================================
echo    行程清单打包 - 前端启动
echo ========================================
echo.
cd frontend
echo 检查依赖...
if not exist node_modules (
    echo 正在安装依赖...
    npm install
)
echo.
echo 正在启动Vue应用...
echo 服务地址: http://localhost:3000
echo.
npm run dev
pause
