@echo off
echo Starting Offline Downloader Backend...
cd /d "%~dp0backend"
go run main.go
pause
