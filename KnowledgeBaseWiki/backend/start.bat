@echo off
echo ========================================
echo 知识库Wiki系统 - 后端服务启动
echo ========================================
echo.

echo 检查Maven...
mvn -version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Maven未找到，请确保Maven已安装并添加到系统PATH
    pause
    exit /b 1
)

echo.
echo 编译项目...
mvn clean compile -DskipTests
if errorlevel 1 (
    echo [ERROR] 编译失败！
    pause
    exit /b 1
)

echo.
echo ========================================
echo 启动后端服务...
echo 服务地址: http://localhost:8080/api
echo API文档: http://localhost:8080/api/doc.html
echo ========================================
echo.

mvn spring-boot:run
