# CodeIntellect Platform Launcher for Windows PowerShell
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   Starting CodeIntellect Engineering Platform" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

Write-Host "[1/3] Starting Isolated Code Runner on port 8001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$host.UI.RawUI.WindowTitle='CodeIntellect Runner (8001)'; `$env:PYTHONPATH='backend;.'; .\.venv\Scripts\uvicorn.exe code_runner.server:app --host 127.0.0.1 --port 8001 --reload"

Start-Sleep -Seconds 2

Write-Host "[2/3] Starting FastAPI Backend on port 8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$host.UI.RawUI.WindowTitle='CodeIntellect Backend (8000)'; `$env:PYTHONPATH='backend;.'; .\.venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload"

Start-Sleep -Seconds 2

Write-Host "[3/3] Starting Vite Frontend on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$host.UI.RawUI.WindowTitle='CodeIntellect Frontend (5173)'; cd frontend; npm.cmd run dev"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "   All 3 services launched successfully!" -ForegroundColor Green
Write-Host "   - Web App:      http://localhost:5173" -ForegroundColor White
Write-Host "   - Backend API:  http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "   - Code Runner:  http://127.0.0.1:8001/health" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Green
