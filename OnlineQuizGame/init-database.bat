@echo off
echo ============================================
echo 在线测验小游戏 - 数据库初始化脚本
echo ============================================
echo.

echo 请输入MySQL用户名 (默认: root):
set /p MYSQL_USER=

echo 请输入MySQL密码:
set /p MYSQL_PASS=

echo.
echo 正在导入数据库脚本...
echo.

mysql -h 127.0.0.1 -P 3306 -u %MYSQL_USER% -p%MYSQL_PASS% < database\init.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo 数据库初始化成功!
    echo ============================================
) else (
    echo.
    echo ============================================
    echo 数据库初始化失败，请检查MySQL连接信息
    echo ============================================
)

echo.
pause
