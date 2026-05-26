@echo off
echo ========================================
echo 健康问诊预约系统 - 数据库导入脚本
echo ========================================
echo.
echo 请确保MySQL服务已启动，然后按任意键继续...
pause > nul

echo.
echo 正在导入数据库...
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < health_appointment.sql

if %errorlevel% == 0 (
    echo.
    echo ========================================
    echo 数据库导入成功！
    echo ========================================
) else (
    echo.
    echo ========================================
    echo 数据库导入失败，请检查：
    echo 1. MySQL服务是否已启动
    echo 2. 用户名密码是否正确（root/123456）
    echo 3. MySQL是否已添加到系统PATH
    echo ========================================
)

echo.
pause
