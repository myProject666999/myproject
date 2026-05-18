@echo off
echo ========================================
echo  数字名片夹 - 数据库导入脚本
echo ========================================
echo.

set MYSQL_PATH=

where mysql >nul 2>nul
if %errorlevel%==0 (
    set MYSQL_PATH=mysql
) else (
    echo 正在查找 MySQL 命令行工具...
    for /f "delims=" %%i in ('dir /s /b "C:\Program Files\MySQL\mysql.exe" 2^>nul') do (
        set MYSQL_PATH=%%i
        goto :found
    )
    for /f "delims=" %%i in ('dir /s /b "C:\Program Files (x86)\MySQL\mysql.exe" 2^>nul') do (
        set MYSQL_PATH=%%i
        goto :found
    )
    for /f "delims=" %%i in ('dir /s /b "D:\Program Files\MySQL\mysql.exe" 2^>nul') do (
        set MYSQL_PATH=%%i
        goto :found
    )
)

:found
if "%MYSQL_PATH%"=="" (
    echo.
    echo [错误] 未找到 MySQL 命令行工具！
    echo 请手动执行以下步骤：
    echo 1. 打开 Navicat 或其他 MySQL 管理工具
    echo 2. 连接到 127.0.0.1:3306，密码：123456
    echo 3. 执行 sql\init.sql 脚本
    echo.
    pause
    exit /b 1
)

echo 找到 MySQL: %MYSQL_PATH%
echo.
echo 正在导入数据库...
echo 数据库地址: 127.0.0.1:3306
echo 用户名: root
echo.

"%MYSQL_PATH%" -h 127.0.0.1 -P 3306 -u root -p123456 < "%~dp0sql\init.sql"

if %errorlevel%==0 (
    echo.
    echo [成功] 数据库导入完成！
) else (
    echo.
    echo [失败] 数据库导入失败，请检查 MySQL 服务是否启动，密码是否正确。
    echo 手动执行命令：
    echo mysql -h 127.0.0.1 -P 3306 -u root -p123456 ^< sql\init.sql
)

echo.
pause
