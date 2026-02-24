@echo off
:: DADOS & RISAS — Build de distribución con Bun (Windows)
:: Compila el servidor a un ejecutable standalone (no requiere Node.js)
::
:: Requisito: Bun instalado — https://bun.sh/windows
:: Uso: scripts\build-dist.bat (desde la raíz del proyecto)

title DADOS & RISAS — Build de distribución
color 0B

echo.
echo   DADOS ^& RISAS — Build de distribución con Bun
echo.

:: Move to project root (in case run from scripts\ subfolder)
cd /d "%~dp0.."

:: ── 1. Pre-build del control panel ─────────────────────────────────────────
echo   --^> Compilando control panel...
cd control-panel
call bun run build
cd ..
echo   OK  Control panel compilado

:: ── 2. Limpiar y crear dist\ ────────────────────────────────────────────────
if exist dist rmdir /s /q dist
mkdir dist

:: ── 3. Compilar servidor con Bun ────────────────────────────────────────────
echo.
echo   --^> Compilando servidor con Bun...

bun build --compile --target bun-windows-x64 ^
  server.js --outfile dist\servidor-win.exe
echo   OK  dist\servidor-win.exe  (Windows x64)

bun build --compile --target bun-darwin-arm64 ^
  server.js --outfile dist\servidor-mac
echo   OK  dist\servidor-mac  (macOS Apple Silicon)

bun build --compile --target bun-darwin-x64 ^
  server.js --outfile dist\servidor-mac-intel
echo   OK  dist\servidor-mac-intel  (macOS Intel)

:: ── 4. Copiar assets estáticos ───────────────────────────────────────────────
echo.
echo   --^> Copiando archivos...
xcopy /e /i /q assets dist\assets >nul
xcopy /e /i /q public dist\public >nul
xcopy /e /i /q control-panel\build dist\panel-build >nul

:: Crear .env con defaults
(
echo PORT=3000
echo CONTROL_PANEL_ORIGIN=http://localhost:5173
) > dist\.env

:: ── 5. Crear launcher Windows ───────────────────────────────────────────────
(
echo @echo off
echo title DADOS ^& RISAS
echo echo.
echo echo   DADOS ^& RISAS — Iniciando...
echo echo.
echo start "Servidor" cmd /k "servidor-win.exe"
echo timeout /t 3 /nobreak ^>nul
echo start "Panel" cmd /k "bun panel-build\index.js"
echo timeout /t 5 /nobreak ^>nul
echo start "" "http://localhost:3000"
echo echo   OK  Servidor:  http://localhost:3000
echo echo   OK  Panel:     http://localhost:5173
echo echo.
echo echo   Abri http://localhost:3000 en el celular ^(misma Wi-Fi^)
echo echo.
echo pause
) > dist\INICIAR.bat

:: ── 6. Crear launcher Mac (texto plano) ─────────────────────────────────────
(
echo #!/usr/bin/env bash
echo echo "  DADOS ^& RISAS"
echo ARCH="$(uname -m)"
echo if [ "$ARCH" = "arm64" ]; then
echo   SERVIDOR="./servidor-mac"
echo else
echo   SERVIDOR="./servidor-mac-intel"
echo fi
echo chmod +x "$SERVIDOR"
echo "$SERVIDOR" ^& SRV=$!
echo sleep 2
echo bun panel-build/index.js ^& PAN=$!
echo sleep 3
echo open "http://localhost:3000"
echo echo "Abri http://localhost:3000 en el celular"
echo wait
) > dist\iniciar.sh

:: ── 7. Resumen ────────────────────────────────────────────────────────────────
echo.
echo   OK  Distribución lista en dist\
echo.
echo   dist\servidor-win.exe    (~60MB — Windows^)
echo   dist\servidor-mac        (~60MB — macOS Apple Silicon^)
echo   dist\servidor-mac-intel  (~60MB — macOS Intel^)
echo   dist\panel-build\        (control panel pre-compilado^)
echo   dist\INICIAR.bat         (launcher Windows^)
echo   dist\iniciar.sh          (launcher Mac^)
echo.
echo   Para comprimir: Seleccionar carpeta dist\ ^> Enviar a ^> Archivo ZIP
echo.
pause
