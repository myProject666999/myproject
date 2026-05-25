@echo off
echo ============================================
echo 在线测验小游戏 - 前端启动脚本
echo ============================================
echo.

cd frontend

echo 正在安装依赖...
call npm install

echo.
echo 正在启动前端服务...
echo 服务地址: http://localhost:3000
echo.

call npm run dev

pause
