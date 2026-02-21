# Copilot instructions

## Build, test, and lint commands
- **Root backend** (Node.js/Express/Socket.io):
  - `npm install`
  - `node server.js` — starts an `http` + `socket.io` server on the port defined by the `serverPort` constant (currently `http://192.168.1.83:3000`).
  - `npm test` only exists as the default `echo "Error: no test specified"` script, so pick a manual HTTP call instead (`curl http://localhost:3000/api/characters` or use `test.http`).
- **Control panel (Svelte + Vite)**:
  - `cd control-panel && npm install`
  - `npm run dev -- --host` — mobile-first dev server that exposes the UI on your local network for phone/tablet control.
  - `npm run build` / `npm run preview` for production assets.
- **Linting**: no lint script yet (clean builds are enforced manually via formatting in `control-panel` files and `public` overlays).

## High-level architecture
```
Phone / Tablet
  └── control-panel (Svelte + Vite, port 5173) – Socket.io client + REST calls for HP/rolls, mobile-first UI, reuses a singleton socket store.
        │
        │  HTTP PUT /api/characters/:id/hp  (CharacterCard)  &  POST /api/rolls (DiceRoller)
        ▼
  Node.js server (Express + Socket.io, port 3000)
        │
        │  REST API + `io.emit` broadcasts (`initialData`, `hp_updated`, `dice_rolled`)
        ▼
  `public/overlay-hp.html` + `public/overlay-dice.html` (OBS Browser Sources, load Socket.io via CDN and listen for `hp_updated` / `dice_rolled` to mutate DOM by `data-char-id` attributes)
```
- The server keeps `characters` and `rolls` in-memory and seeds each socket with `initialData` on connect; every REST update broadcasts via Socket.io so overlays and the control panel stay in sync.
- The `control-panel/src/lib/socket.js` file exports the singleton `socket`, `characters` store, and `lastRoll` store so every component shares the same connection and state.
- Overlays rely on the same `serverPort` host (and Socket.io v4.8.3 via CDN) and mutate DOM nodes marked with `data-char-id` to reflect live HP/roll updates.

## Key conventions
- **IP alignment**: `server.js`, `control-panel/src/lib/socket.js`, and every `public/overlay-*.html` hard-code the local IP (`http://192.168.1.83:3000`). Before running the stack, update all of them to match your desktop’s IPv4 so browsers and phones can reach the server without CORS issues.
- **Socket flow**: `socket.on('initialData')` bootstraps `characters`. `CharacterCard` fetches `PUT /api/characters/:id/hp` and relies on the `hp_updated` broadcast to mutate the `characters` store; `DiceRoller` posts to `/api/rolls` and stores the server response in `lastRoll` for UI feedback.
- **DOM mapping**: The overlays use `data-char-id` to find existing character nodes. When `hp_updated` arrives, they only mutate the matching node instead of rerendering the entire list. Keep this attribute in sync if you add new overlays.
- **UI theming**: HP thresholds are computed in Svelte (`hpPercent`, `hpClass`) and mirrored in overlay CSS (healthy/injured/critical gradients + pulsing critical animation). Use the same breakpoint definitions when adding new visual states.
- **Manual testing helpers**: Use `test.http` at the root for quick `GET /api/characters`, `PUT /api/characters/:id/hp`, and `POST /api/rolls` requests; the file already contains working payloads for the demo characters listed in README/CLAUDE.

## Additional references
- The README and CLAUDE.md describe the demo priorities, OBS setup (1920×1080, transparent backgrounds, “refresh when scene becomes active”), and the project’s MVP checklist. Refer to them before updating the overlays or control panel UI.
- The `.github/workflows/check-progress.yml` job parses `PROGRESS.md` on every push; keep that file’s sections intact if you need the progress reporting to stay green.
