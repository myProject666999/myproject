@echo off
chcp 65001 >nul
echo ========================================
echo   跑步路线收藏系统 - 数据库导入脚本
echo ========================================
echo.

REM 尝试查找MySQL客户端
set MYSQL_CMD=

REM 检查常见路径
if exist "C:\phpstudy_pro\Extensions\MySQL5.7.26\bin\mysql.exe" set MYSQL_CMD="C:\phpstudy_pro\Extensions\MySQL5.7.26\bin\mysql.exe"
if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" set MYSQL_CMD="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if exist "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe" set MYSQL_CMD="C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe"
if exist "C:\ProgramData\MySQL\MySQL Server 8.0\bin\mysql.exe" set MYSQL_CMD="C:\ProgramData\MySQL\MySQL Server 8.0\bin\mysql.exe"
if exist "C:\mysql\bin\mysql.exe" set MYSQL_CMD="C:\mysql\bin\mysql.exe"
if exist "C:\xampp\mysql\bin\mysql.exe" set MYSQL_CMD="C:\xampp\mysql\bin\mysql.exe"

REM 如果找不到，尝试使用mysql命令（假设已加入PATH）
if "%MYSQL_CMD%"=="" set MYSQL_CMD=mysql

echo [INFO] 正在使用MySQL客户端: %MYSQL_CMD%
echo [INFO] 连接数据库: 127.0.0.1:3306
echo.

REM 导入SQL脚本
%MYSQL_CMD% -h 127.0.0.1 -P 3306 -u root -p123456 < "%~dp0running_route.sql"

if %errorlevel%==0 (
    echo.
    echo ========================================
    echo   数据库导入成功！
    echo ========================================
) else (
    echo.
    echo ========================================
    echo   数据库导入失败，请检查MySQL是否启动
    echo ========================================
)

echo.
pause
