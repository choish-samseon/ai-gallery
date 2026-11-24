@echo off
rem ============================================
rem  Local preview server for the gallery site
rem  Double-click this file, then the browser
rem  opens http://localhost:8000 automatically.
rem  Close this window to stop the server.
rem ============================================
cd /d "%~dp0"
echo.
echo  Starting local preview at http://localhost:8000
echo  (Close this window to stop)
echo.
start "" http://localhost:8000
py -m http.server 8000 2>nul
if errorlevel 1 python -m http.server 8000
if errorlevel 1 (
  echo.
  echo  [ERROR] Python not found on this PC.
  echo  Install Python from python.org or use VSCode Live Server instead.
  pause
)
