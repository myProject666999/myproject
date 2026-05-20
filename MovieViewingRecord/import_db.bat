@echo off
setlocal enabledelayedexpansion

echo ========================================
echo  观影记录系统 - 数据库导入脚本
echo ========================================
echo.

set HOST=127.0.0.1
set PORT=3306
set USER=root
set PASSWORD=123456

set MYSQL_PATH=mysql
where mysql >nul 2>nul
if %errorlevel% neq 0 (
    echo 正在查找MySQL安装路径...
    if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" (
        set "MYSQL_PATH=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
    ) else if exist "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe" (
        set "MYSQL_PATH=C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe"
    ) else if exist "C:\xampp\mysql\bin\mysql.exe" (
        set "MYSQL_PATH=C:\xampp\mysql\bin\mysql.exe"
    ) else if exist "C:\wamp64\bin\mysql\mysql8.0.31\bin\mysql.exe" (
        set "MYSQL_PATH=C:\wamp64\bin\mysql\mysql8.0.31\bin\mysql.exe"
    ) else (
        echo.
        echo [错误] 未找到MySQL命令行工具！
        echo 请尝试以下方法：
        echo 1. 将MySQL的bin目录添加到系统环境变量PATH中
        echo 2. 或使用MySQL Workbench、Navicat等图形化工具手动导入
        echo 3. SQL文件位置: backend\src\main\resources\sql\
        echo.
        echo 导入步骤：
        echo   1) 先导入 schema.sql 创建数据库和表
        echo   2) 再导入 data.sql 插入示例数据
        echo.
        pause
        exit /b 1
    )
    echo 找到MySQL: !MYSQL_PATH!
)

echo.
echo [1/3] 正在创建数据库和表结构...
"!MYSQL_PATH!" -h%HOST% -P%PORT% -u%USER% -p%PASSWORD% < "backend\src\main\resources\sql\schema.sql"
if %errorlevel% neq 0 (
    echo 错误：数据库表结构导入失败！
    echo 请检查MySQL是否启动，以及密码是否正确。
    pause
    exit /b 1
)
echo 表结构导入成功！
echo.

echo [2/3] 正在导入示例数据...
"!MYSQL_PATH!" -h%HOST% -P%PORT% -u%USER% -p%PASSWORD% < "backend\src\main\resources\sql\data.sql"
if %errorlevel% neq 0 (
    echo 警告：示例数据导入失败（可能已存在重复数据）
) else (
    echo 示例数据导入成功！
)
echo.

echo [3/3] 数据库导入完成！
echo ========================================
echo  数据库信息:
echo  主机: %HOST%:%PORT%
echo  用户名: %USER%
echo  密码: %PASSWORD%
echo  数据库名: movie_viewing_record
echo ========================================
echo.
echo 示例数据包含:
echo   - 15部热门影视（电影+电视剧）
echo   - 14条观影记录
echo   - 2024年度Top10榜单
echo.
pause
