#!/usr/bin/env bash
echo "  DADOS ^& RISAS"
ARCH="$(uname -m)"
if [ "$ARCH" = "arm64" ]; then
  SERVIDOR="./servidor-mac"
else
  SERVIDOR="./servidor-mac-intel"
fi
chmod +x "$SERVIDOR"
"$SERVIDOR" & SRV=$!
sleep 2
node panel-build/index.js & PAN=$!
sleep 3
open "http://localhost:3001"
echo "Abri http://localhost:3001 en el celular"
wait
