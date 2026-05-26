@echo off
echo Starting Offline Downloader Frontend...
cd /d "%~dp0frontend"
npm install
npm run dev
pause
