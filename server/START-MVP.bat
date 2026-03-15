@echo off
setlocal

set "ROOT=%~dp0"

echo [Dealsense] Starting MVP (backend + dashboard)...
echo [Dealsense] This window can stay open. Close it to stop.
echo.

echo [Dealsense] Guarding MVP integrity...
powershell -NoProfile -ExecutionPolicy Bypass -Command "cd '%ROOT%'; npm run -s guard:mvp" 
if errorlevel 1 (
  echo.
  echo [Dealsense] MVP guard failed. Auto-restoring stable snapshot...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "cd '%ROOT%'; $env:RESTORE_CONFIRM='YES'; npm run -s restore:mvp"
  echo.
  echo [Dealsense] Re-checking MVP integrity after restore...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "cd '%ROOT%'; npm run -s guard:mvp"
  if errorlevel 1 (
    echo.
    echo [Dealsense] ERROR: Guard still failing after restore. Aborting start.
    pause >nul
    exit /b 1
  )
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%run-mvp-top3.ps1"

echo.
echo [Dealsense] MVP script finished. Press any key to close.
pause >nul
