#!/usr/bin/env bash
# DADOS & RISAS — Demo launcher (Mac / Linux)
# Usage: bash start-demo.sh

set -e

echo ""
echo "  🎲 DADOS & RISAS — Iniciando demo..."
echo ""

# Start backend server
bun server.js &
SERVER_PID=$!
echo "  ✓  Servidor en http://localhost:3000  (PID $SERVER_PID)"
sleep 2

# Start control panel with --host so phones on the LAN can reach it
cd control-panel && bun run dev -- --host &
PANEL_PID=$!
cd ..
echo "  ✓  Panel de control en http://localhost:5173  (PID $PANEL_PID)"
sleep 5

# Open landing page (shows real LAN IP and all overlay URLs)
if command -v open &>/dev/null; then
  open "http://localhost:3000"        # macOS
elif command -v xdg-open &>/dev/null; then
  xdg-open "http://localhost:3000"    # Linux
fi

echo ""
echo "  Landing page abierta — muestra los links con la IP de red."
echo "  Abrí ese link en el celular (misma Wi-Fi) para ver el panel."
echo ""
echo "  Para detener todo:  kill $SERVER_PID $PANEL_PID"
echo ""

# Keep script alive until Ctrl+C
wait
