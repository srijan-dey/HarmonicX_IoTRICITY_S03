#!/usr/bin/env pwsh
# CardioSense AI - PowerShell launcher

Write-Host "`n🫀 CardioSense AI — Starting Development Environment`n" -ForegroundColor Cyan

# Backend
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\backend'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 1

# ML Service
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\ml'; python main.py" -WindowStyle Normal

Start-Sleep -Seconds 1

# Frontend
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\frontend'; npm run dev" -WindowStyle Normal

Write-Host "Services launching in new windows:" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor Yellow
Write-Host "  ML:       http://localhost:8000" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "`nOpen http://localhost:5173 in your browser.`n" -ForegroundColor Cyan
