@echo off
title NutriTrack — Smart Diet & Nutrition Tracking System Launcher
echo ======================================================================
echo    NutriTrack - Smart Diet ^& Nutrition Tracking System
echo    Amal Jyothi College of Engineering Autonomous, Kanjirappally
echo    Student: Richan Jose (AJC24MCA-I048, Roll 46)
echo ======================================================================
echo.

echo [1/2] Starting Backend REST API Server (Port 5000)...
start "NutriTrack Backend" cmd /k "cd backend && npm start"

timeout /t 2 /nobreak >nul

echo [2/2] Starting React 19 Frontend Vite Server (Port 3000)...
start "NutriTrack Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ======================================================================
echo NutriTrack is running!
echo Access the React Application in your browser:
echo -> http://localhost:3000
echo ======================================================================
pause
