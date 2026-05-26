@echo off
chcp 65001 >nul
echo ============================================
echo   在线音视频转码系统 - 一键启动
echo ============================================
echo.

REM 设置 MySQL 路径（根据实际安装路径修改）
set MYSQL_BIN=C:\phpstudy_pro\Extensions\MySQL5.7.26\bin

echo [1/4] 检查 MySQL 服务...
"%MYSQL_BIN%\mysqladmin.exe" -u root -p123456 ping 2>nul
if %errorlevel% neq 0 (
    echo MySQL 未运行，正在启动...
    net start mysql5.7.26 2>nul || net start MySQL 2>nul
    timeout /t 3 /nobreak >nul
) else (
    echo MySQL 已运行
)

echo.
echo [2/4] 检查 Redis 服务...
redis-cli ping 2>nul
if %errorlevel% neq 0 (
    echo Redis 未运行，请手动启动 Redis 服务
    echo 如果未安装 Redis，可下载: https://github.com/tporadowski/redis/releases
) else (
    echo Redis 已运行
)

echo.
echo [3/4] 启动后端服务 (Gin :8080)...
start "Transcoding Backend" cmd /c "cd /d %~dp0backend && server.exe"
timeout /t 2 /nobreak >nul

echo.
echo [4/4] 启动前端服务 (Vue :5173)...
start "Transcoding Frontend" cmd /c "cd /d %~dp0frontend && npm run dev"

echo.
echo ============================================
echo   启动完成！
echo   前端地址: http://localhost:5173
echo   后端 API: http://localhost:8080
echo ============================================
echo.
pause
