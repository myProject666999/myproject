#!/bin/bash
echo "========================================"
echo "   个人作品集网站 - 快速启动脚本"
echo "========================================"
echo ""

echo "[1/2 启动后端服务..."
cd backend && go mod download && go run main.go &
BACKEND_PID=$!

echo "[2/2 启动前端服务..."
cd ../frontend && npm install && npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "服务启动中，请等待..."
echo "后台地址: http://localhost:3000"
echo "后台管理: http://localhost:3000/admin"
echo "默认账号: admin / admin123"
echo "========================================"

trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
