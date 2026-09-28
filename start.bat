@echo off
echo.
echo  ████████████████████████████████████████████████████████████
echo  ██  CardioSense AI — IoTRICITY S3 Development Environment  ██
echo  ████████████████████████████████████████████████████████████
echo.
echo  Integrated: HarmonicX_IoTRICITY_S03 dataset
echo.
echo  Starting all services...
echo.

start "CardioSense Backend" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 2 /nobreak > nul

start "CardioSense ML Service" cmd /k "cd /d %~dp0ml && python main.py"
timeout /t 2 /nobreak > nul

start "CardioSense Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo  Services starting in separate windows:
echo    Backend:   http://localhost:5000
echo    ML:        http://localhost:8000
echo    Frontend:  http://localhost:5173
echo.
echo  New routes (HarmonicX dataset):
echo    GET  /api/harmonicx/summary
echo    GET  /api/harmonicx/beats
echo    GET  /api/harmonicx/beat/:index
echo    GET  /api/harmonicx/waveform
echo    POST /api/ml/predict-beat
echo.
echo  Press any key to exit this launcher...
pause > nul
