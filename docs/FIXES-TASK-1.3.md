# Post-Implementation Fixes (TASK-1.3)

This document tracks the issues identified and resolved after the initial build of the Character Sheet UI components.

## 1. SyntaxError: Missing export `SERVER_URL`
**Issue:** Components importing `SERVER_URL` from `$lib/services/socket` failed because `socket.svelte.ts` (which Vite prioritizes) did not export this constant, whereas the legacy `socket.js` did.
**Fix:** Added `export const SERVER_URL = socketURL;` to `control-panel/src/lib/services/socket.svelte.ts`.

## 2. PocketBase Connection Refused (CORS/Network Error)
**Issue:** When the project is configured to use a LAN IP (e.g., `192.168.1.87`), the browser fails to connect to PocketBase even if the backend server can. This is because PocketBase defaults to listening only on `127.0.0.1`.
**Fix:** 
- Updated `scripts/start-demo.js` to automatically detect the environment and bind PocketBase to `0.0.0.0:8090` if a LAN IP is detected in `.env`.
- **Manual Fix:** If running services manually, start PocketBase with:
  ```bash
  ./pocketbase serve --http=0.0.0.0:8090
  ```

## 3. OpaqueResponseBlocking (placeholder.png)
**Issue:** The UI tried to load `/assets/img/placeholder.png` from the backend. Since the file was missing, the backend returned a 404 HTML page. Browsers block "opaque" non-image responses in `<img>` tags for security.
**Fix:** Updated `control-panel/src/lib/services/utils.js` to use `dwarf.png` as a temporary fallback while a permanent placeholder is sourced.

## 4. Troubleshooting Connectivity (Step-by-Step)
If you still see `NetworkError` or `CORS request did not succeed` in the browser console:

### Option A: Stay on LAN (Mobile Testing)
If you want to access the app from your phone, you **must** bind PocketBase to your network:
1. Ensure `.env` has your LAN IP (run `bun scripts/setup-ip.js`).
2. Start PocketBase with:
   ```bash
   ./pocketbase serve --http=0.0.0.0:8090
   ```

### Option B: Local Only (Fastest Dev)
If you are only developing on your computer:
1. **Reset Config:** Run `bun scripts/setup-ip.js --local`. This writes `127.0.0.1` to your `.env` files.
2. **Start PB Normally:** `./pocketbase serve` (no extra flags needed).
3. **Auto-Bypass:** The `pocketbase.ts` service now includes logic to automatically use `localhost` if it detects your browser is on `localhost`, even if the `.env` has a LAN IP.

---
*Date: 2026-03-28*
