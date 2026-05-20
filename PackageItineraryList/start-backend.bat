@echo off
echo ========================================
echo    行程清单打包 - 后端启动
echo ========================================
echo.
cd backend
echo 正在启动Spring Boot应用...
echo 服务地址: http://localhost:8080/api
echo.
mvn spring-boot:run
pause
