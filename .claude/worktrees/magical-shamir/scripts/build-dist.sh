#!/usr/bin/env bash
# DADOS & RISAS — Build de distribución con Bun
# Compila el servidor a un ejecutable standalone (no requiere Node.js)
#
# Requisito: Bun instalado — https://bun.sh
#   curl -fsSL https://bun.sh/install | bash
#
# Uso:
#   bash scripts/build-dist.sh
#
# Output en dist/:
#   servidor-mac        (macOS Apple Silicon — arm64)
#   servidor-mac-intel  (macOS Intel — x64)
#   servidor-win.exe    (Windows x64, cross-compilado)
#   assets/             (fotos de personajes)
#   public/             (overlays + landing page)
#   .env                (configuración default)

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST="$ROOT_DIR/dist"

echo ""
echo "  📦 DADOS & RISAS — Build de distribución"
echo ""

# ── 1. Pre-build del control panel ──────────────────────────────────────────
echo "  → Compilando control panel (SvelteKit)..."
cd "$ROOT_DIR/control-panel"
bun run build
cd "$ROOT_DIR"
echo "  ✓  Control panel compilado en control-panel/build/"

# ── 2. Crear carpeta dist ────────────────────────────────────────────────────
rm -rf "$DIST"
mkdir -p "$DIST"

# ── 3. Compilar servidor con Bun ─────────────────────────────────────────────
echo ""
echo "  → Compilando servidor (Bun)..."

# macOS Apple Silicon (M1/M2/M3)
bun build --compile --target bun-darwin-arm64 \
  "$ROOT_DIR/server.js" --outfile "$DIST/servidor-mac"
echo "  ✓  dist/servidor-mac  (macOS Apple Silicon)"

# macOS Intel
bun build --compile --target bun-darwin-x64 \
  "$ROOT_DIR/server.js" --outfile "$DIST/servidor-mac-intel"
echo "  ✓  dist/servidor-mac-intel  (macOS Intel)"

# Windows x64 (cross-compile desde Mac/Linux)
bun build --compile --target bun-windows-x64 \
  "$ROOT_DIR/server.js" --outfile "$DIST/servidor-win.exe"
echo "  ✓  dist/servidor-win.exe  (Windows)"

# ── 4. Copiar assets estáticos ───────────────────────────────────────────────
echo ""
echo "  → Copiando archivos estáticos..."
cp -r "$ROOT_DIR/assets"  "$DIST/assets"
cp -r "$ROOT_DIR/public"  "$DIST/public"
cp -r "$ROOT_DIR/control-panel/build" "$DIST/panel-build"

# Crear .env con defaults para el ejecutable
cat > "$DIST/.env" << 'EOF'
PORT=3000
CONTROL_PANEL_ORIGIN=http://localhost:5173
EOF

# ── 5. Crear launchers en dist/ ───────────────────────────────────────────────
echo "  → Creando scripts de inicio..."

# Mac/Linux launcher
cat > "$DIST/iniciar.sh" << 'LAUNCHER'
#!/usr/bin/env bash
echo ""
echo "  🎲 DADOS & RISAS"
echo ""
OS="$(uname -s)"
if [ "$OS" = "Darwin" ]; then
  ARCH="$(uname -m)"
  if [ "$ARCH" = "arm64" ]; then
    SERVIDOR="./servidor-mac"
  else
    SERVIDOR="./servidor-mac-intel"
  fi
else
  echo "  Para Windows usar INICIAR.bat"
  exit 1
fi
chmod +x "$SERVIDOR"
"$SERVIDOR" &
SRV_PID=$!
echo "  ✓  Servidor en http://localhost:3000  (PID $SRV_PID)"
sleep 2
bun panel-build/index.js &
PANEL_PID=$!
echo "  ✓  Panel en http://localhost:5173  (PID $PANEL_PID)"
sleep 3
open "http://localhost:3000"
echo ""
echo "  Abrí http://localhost:3000 en el celular (misma Wi-Fi)"
echo "  Para cerrar: kill $SRV_PID $PANEL_PID"
echo ""
wait
LAUNCHER
chmod +x "$DIST/iniciar.sh"

# Windows launcher
cat > "$DIST/INICIAR.bat" << 'LAUNCHER'
@echo off
title DADOS & RISAS
echo.
echo   DADOS ^& RISAS — Iniciando...
echo.
start "Servidor" cmd /k "servidor-win.exe"
timeout /t 3 /nobreak >nul
start "Panel" cmd /k "bun panel-build\index.js"
timeout /t 5 /nobreak >nul
start "" "http://localhost:3000"
echo   ✓  Servidor:  http://localhost:3000
echo   ✓  Panel:     http://localhost:5173
echo.
echo   Abri http://localhost:3000 en el celular (misma Wi-Fi)
echo.
pause
LAUNCHER

# ── 6. Resumen ────────────────────────────────────────────────────────────────
echo ""
echo "  ✅ Distribución lista en dist/"
echo ""
echo "  dist/"
echo "  ├── servidor-mac          (~60MB — macOS Apple Silicon)"
echo "  ├── servidor-mac-intel    (~60MB — macOS Intel)"
echo "  ├── servidor-win.exe      (~60MB — Windows)"
echo "  ├── panel-build/          (control panel pre-compilado)"
echo "  ├── assets/               (fotos de personajes)"
echo "  ├── public/               (overlays + landing page)"
echo "  ├── .env                  (configuración)"
echo "  ├── iniciar.sh            (Mac/Linux)"
echo "  └── INICIAR.bat           (Windows)"
echo ""
echo "  Para crear el ZIP:"
echo "  cd dist && zip -r ../dados-risas-demo.zip . && cd .."
echo ""
