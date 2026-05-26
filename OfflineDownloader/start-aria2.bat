@echo off
echo Starting aria2...
cd /d "%~dp0backend"
aria2c --conf-path=./aria2/aria2.conf
pause
