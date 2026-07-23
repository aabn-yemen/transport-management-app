@echo off
cd /d C:\u_b_app\backend
echo ====================================
echo   SUTMS Backend - Starting...
echo   Port: 3500
echo ====================================
npx -y ts-node src/index.ts
