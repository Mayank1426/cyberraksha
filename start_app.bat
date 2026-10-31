@echo off
title CyberRakshak AI - Full-Stack Security Server & Groq Chatbot
echo ===================================================
echo   CyberRakshak AI -- AI Security Assistant
echo   Connected to Groq Cloud API & Live ML Models
echo ===================================================
echo.
echo [*] Starting Python backend server on http://localhost:8080 ...
start "" http://localhost:8080
python server.py
pause
