#!/bin/sh
set -e

# Create or update superuser from env vars (idempotent — safe to run every boot)
if [ -n "$PB_MAIL" ] && [ -n "$PB_PASS" ]; then
  echo "Setting up PocketBase superuser: $PB_MAIL"
  ./pocketbase superuser upsert "$PB_MAIL" "$PB_PASS" --dir=/pb/pb_data 2>/dev/null || true
fi

# Start PocketBase — bind to all interfaces so Railway can reach it
exec ./pocketbase serve \
  --http="0.0.0.0:8090" \
  --dir=/pb/pb_data \
  --automigrate
