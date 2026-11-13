@echo off
title CodeIntellect Platform Launcher
echo ========================================================
echo   Starting CodeIntellect Engineering Platform
echo ========================================================

echo [1/3] Starting Isolated Code Runner on port 8001...
start "CodeIntellect Runner (8001)" cmd /k "set PYTHONPATH=backend;.&& .\.venv\Scripts\uvicorn.exe code_runner.server:app --host 127.0.0.1 --port 8001 --reload"

timeout /t 2 /nobreak >nul

echo [2/3] Starting FastAPI Backend on port 8000...
start "CodeIntellect Backend (8000)" cmd /k "set PYTHONPATH=backend;.&& .\.venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo [3/3] Starting Vite Frontend on port 5173...
start "CodeIntellect Frontend (5173)" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo   All 3 services launched successfully!
echo   - Web App:      http://localhost:5173
echo   - Backend API:  http://127.0.0.1:8000/docs
echo   - Code Runner:  http://127.0.0.1:8001/health
echo ========================================================
