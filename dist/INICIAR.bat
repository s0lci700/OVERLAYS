@echo off
title DADOS & RISAS
echo.
echo   DADOS & RISAS — Iniciando...
echo.
start "Servidor" cmd /k "servidor-win.exe"
timeout /t 3 /nobreak >nul
start "Panel" cmd /k "node panel-build\index.js"
timeout /t 5 /nobreak >nul
start "" "http://localhost:3000"
echo   OK  Servidor:  http://localhost:3000
echo   OK  Panel:     http://localhost:5173
echo.
echo   Abri http://localhost:3000 en el celular (misma Wi-Fi)
echo.
pause

