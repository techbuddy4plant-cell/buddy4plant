@echo off
title buddy4plant dev server
cd /d "%~dp0"
echo Starting buddy4plant at http://localhost:3000 ...
call npm run dev
pause
