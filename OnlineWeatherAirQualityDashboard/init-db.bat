@echo off
echo ========================================
echo  空气质量看板 - 数据库初始化脚本
echo ========================================
echo.

cd /d "%~dp0backend"

echo [1/3] 下载 Go 依赖...
go mod download

echo.
echo [2/3] 初始化数据库...
go run ./cmd/initdb

echo.
echo [3/3] 数据库初始化完成！
echo.
pause
