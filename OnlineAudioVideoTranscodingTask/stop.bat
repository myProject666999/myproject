@echo off
chcp 65001 >nul
echo 正在停止后端服务...
taskkill /f /im server.exe 2>nul
echo 正在停止前端服务...
taskkill /f /fi "windowtitle eq Transcoding Frontend" 2>nul
echo 服务已停止
pause
