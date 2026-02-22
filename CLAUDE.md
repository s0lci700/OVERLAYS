# DADOS & RISAS - Overlay System

## Project Overview
Real-time D&D session management system with OBS overlays for a streaming/recording pitch to ESDH (Hector).

**Pitch deadline:** Email Monday Feb 24 at 8am, Meeting Monday Feb 24

## Goal
Build a working MVP demo proving technical capability to build custom production solutions. Prioritize: working > reliable > fast > beautiful.

## Architecture

```
Server (Node.js + Express + Socket.io) :3000
  ├── REST API (CRUD operations)
  ├── WebSocket (real-time broadcasts)
  └── SQLite (persistence) / in-memory for demo

Control Panel (Svelte + Vite) :5173
  └── Mobile-first, connects to server via Socket.io

OBS Overlays (vanilla HTML/CSS/JS)
  ├── public/overlay-hp.html       — HP bars (always visible)
  └── public/overlay-dice.html     — Dice result popup (working ✅)
```

## Tech Stack
- **Backend:** Node.js 18+, Express 4.x, Socket.io 4.x, SQLite3, cors
- **Frontend:** Svelte 4.x, Vite, socket.io-client
- **Overlays:** Vanilla JS/HTML/CSS, socket.io CDN, OBS Browser Source

## Socket.io Events
| Event | Direction | Payload |
|---|---|---|
| `connection` | server→client | — |
| `initialData` | server→client | `{ characters, rolls }` |
| `hp_updated` | server→all | `{ character, hp_current }` |
| `dice_rolled` | server→all | `{ charId, result, modifier, rollResult, sides }` |

## API Endpoints
- `GET  /api/characters` — return all characters
- `PUT  /api/characters/:id/hp` — update hp_current, emit Socket.io
- `POST /api/rolls` — log roll, emit Socket.io

## In-Memory Demo Characters
```js
let characters = [
  { id: 'CH001', name: 'El Pato', player: 'Panqueque', hp_current: 28, hp_max: 35 },
  { id: 'CH002', name: 'Rosa',    player: 'Player2',   hp_current: 30, hp_max: 30 }
];
```

## OBS Overlay Setup
- Add Source > Browser > Local File
- Width: 1920, Height: 1080
- Disable "Shutdown source when not visible"
- Enable "Refresh browser when scene becomes active"
- `body { background: transparent; }` — required for overlay transparency

## MVP Priorities (Demo Only)
- No need for: perfect UI, all 3 overlays, full DB persistence, error handling, Chilean branding, mobile optimization
- Must have: server running, HP updates from phone, ONE overlay live in OBS, real-time WebSocket sync

## Demo Script
1. Show control panel on phone
2. Update a character's HP
3. Show OBS — bar updates in real-time
4. Roll dice on phone, show result
5. Close: "Este es solo el MVP, puedo agregar lo que necesiten"

## Directory Structure
```
OVERLAYS/
├── CLAUDE.md
├── ROADMAPS/
│   ├── COMPLETE_DEVELOPMENT_ROADMAP.docx
│   └── CRASH_COURSE_3_DAY_DEMO.docx
├── server.js
├── package.json
├── public/
│   ├── overlay-hp.html
│   └── overlay-dice.html
└── control-panel/
    └── src/
        ├── App.svelte
        ├── main.js
        └── lib/
            ├── socket.js           ← hardcoded server IP here
            ├── CharacterCard.svelte
            └── DiceRoller.svelte
```

## Common Debug Steps
1. Check server terminal output
2. Browser console F12
3. Network tab > WS for WebSocket frames
4. Test API directly: `curl http://localhost:3000/api/characters`
5. OBS: right-click Browser Source > Interact > console errors

## Key Reminders
- Socket.io client in overlays uses CDN: `<script src="https://cdn.socket.io/4.x.x/socket.io.min.js">`
- Use `data-char-id` attributes on HP bar elements for easy DOM targeting
- For phone testing: use `--host` flag with Vite, connect to server IP not localhost
- PRAGMA foreign_keys=ON if using SQLite

## Actual Implementation (as-built — differs from spec above)
- Server event on connection: `initialData` (not `initial_state`)
- Characters in code: `El verdadero` (CH001, Lucas) / `B12` (CH002, Sol) — not El Pato / Rosa
- Socket.io CDN version in use: `4.8.3` (in `overlay-hp.html`, `overlay-dice.html`)
- Server IP hardcoded in `control-panel/src/lib/socket.js`: update to match your `ipconfig` IPv4

## Running the Project
- Install deps (first time): `npm install` in root, then `npm install` in `control-panel/`
- Server: `node server.js` (port 3000)
- Control panel: `npm run dev -- --host` from `control-panel/` (port 5173)
- Get local IP on Windows: `ipconfig` → IPv4 Address → update `control-panel/src/lib/socket.js`
- Both overlays working: `public/overlay-hp.html`, `public/overlay-dice.html`



