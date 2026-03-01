@echo off
title DADOS & RISAS — Iniciando demo...
color 0B

echo.
echo  ██████  █████  ██████   ██████  ███████     ^&  ██████  ██ ███████  █████  ███████
echo  ^                                                                              ^
echo     DADOS ^& RISAS — Sistema de overlays D^&D en tiempo real
echo.

:: Start backend server in a labeled window
start "DADOS ^& RISAS — Backend :3000" cmd /k "bun server.js"
timeout /t 2 /nobreak >nul

:: Start control panel (Vite with --host for LAN access on phone)
start "DADOS ^& RISAS — Panel :5173" cmd /k "cd control-panel && bun run dev -- --host"
timeout /t 5 /nobreak >nul

:: Open landing page in browser (shows all overlay URLs with real LAN IP)
start "" "http://localhost:3000"

echo.
echo  ✓  Servidor:       http://localhost:3000
echo  ✓  Panel:          http://localhost:5173
echo  ✓  Landing page:   http://localhost:3000  (muestra IP de red)
echo.
echo  Abri http://localhost:3000 en el celular para ver los links con tu IP.
echo.
pause
