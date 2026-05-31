@echo off
echo ========================================
echo 数据库Schema变更评审与发布平台 - 启动脚本
echo ========================================
echo.

echo [1/2] 启动后端服务...
cd backend
start "后端服务" cmd /k "mvn spring-boot:run"
cd ..

timeout /t 5 /nobreak

echo [2/2] 启动前端服务...
cd frontend
start "前端服务" cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo 服务启动中，请等待...
echo 后端地址: http://localhost:8080/api
echo 前端地址: http://localhost:3000
echo ========================================
pause
