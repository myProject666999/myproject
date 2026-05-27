@echo off
echo ========================================
echo 知识库Wiki系统 - 数据库初始化脚本
echo ========================================
echo.

echo [1/2] 检查MySQL连接...
mysql -h 127.0.0.1 -P 3306 -u root -p123456 -e "SELECT VERSION();" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] MySQL连接失败！
    echo 请确保:
    echo   1. MySQL服务已启动
    echo   2. 用户名/密码正确 (root/123456)
    echo   3. MySQL命令已添加到系统PATH
    echo.
    echo 或者手动执行:
    echo   mysql -h 127.0.0.1 -P 3306 -u root -p123456 ^< database\init.sql
    echo.
    pause
    exit /b 1
)

echo [OK] MySQL连接成功
echo.

echo [2/2] 执行数据库初始化脚本...
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < database\init.sql
if errorlevel 1 (
    echo [ERROR] 数据库初始化失败！
    pause
    exit /b 1
)

echo.
echo ========================================
echo [SUCCESS] 数据库初始化完成！
echo ========================================
echo.
echo 数据库信息:
echo   - 数据库名: knowledge_base_wiki
echo   - 用户名: root
echo   - 密码: 123456
echo.
echo 下一步:
echo   1. 运行 backend\start.bat 启动后端服务
echo   2. 运行 frontend\start.bat 启动前端服务
echo.
pause
