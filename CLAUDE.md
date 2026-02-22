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

- **Backend:** Node.js 18+, Express 5.x, Socket.io 4.x, cors
- **Frontend:** Svelte 5.x, SvelteKit, Vite 7.x, socket.io-client
- **Overlays:** Vanilla JS/HTML/CSS, socket.io CDN, OBS Browser Source

## Socket.io Events

| Event               | Direction     | Payload                                           |
| ------------------- | ------------- | ------------------------------------------------- |
| `initialData`       | server→client | `{ characters, rolls }`                           |
| `hp_updated`        | server→all    | `{ character, hp_current }`                       |
| `character_created` | server→all    | `{ character }`                                   |
| `character_updated` | server→all    | `{ character }`                                   |
| `condition_added`   | server→all    | `{ charId, condition }`                           |
| `condition_removed` | server→all    | `{ charId, conditionId }`                         |
| `resource_updated`  | server→all    | `{ charId, resource }`                            |
| `rest_taken`        | server→all    | `{ charId, type, restored[], character }`         |
| `dice_rolled`       | server→all    | `{ charId, result, modifier, rollResult, sides }` |

## API Endpoints

- `GET  /api/characters` — return all characters
- `POST /api/characters` — create a new character, emit `character_created`
- `PUT  /api/characters/:id` — update character fields, emit `character_updated`
- `PUT  /api/characters/:id/hp` — update hp_current, emit `hp_updated`
- `PUT  /api/characters/:id/photo` — update character photo, emit `character_updated`
- `POST /api/characters/:id/conditions` — add condition, emit `condition_added`
- `DELETE /api/characters/:id/conditions/:condId` — remove condition, emit `condition_removed`
- `PUT  /api/characters/:id/resources/:rid` — update resource pool, emit `resource_updated`
- `POST /api/characters/:id/rest` — apply short/long rest, emit `rest_taken`
- `POST /api/rolls` — log roll, emit `dice_rolled`

## In-Memory Demo Characters

```js
let characters = [
  { id: "CH101", name: "Kael", player: "Mara", hp_current: 12, hp_max: 12 },
  { id: "CH102", name: "Lyra", player: "Nico", hp_current: 8, hp_max: 8 },
  { id: "CH103", name: "Brum", player: "Iris", hp_current: 9, hp_max: 9 },
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
├── server.js
├── package.json
├── .env.example
├── data/
│   ├── characters.js
│   ├── rolls.js
│   ├── photos.js
│   ├── id.js
│   └── template-characters.json
├── public/
│   ├── overlay-hp.html
│   ├── overlay-hp.css
│   ├── overlay-dice.html
│   └── overlay-dice.css
├── scripts/
│   └── setup-ip.js
└── control-panel/
    └── src/
        ├── routes/
        │   ├── +layout.svelte      ← app shell, sidebar, header
        │   ├── +page.svelte        ← redirects to /control/characters
        │   ├── control/            ← /control/characters + /control/dice
        │   ├── management/         ← /management/create + /management/manage
        │   └── dashboard/          ← /dashboard
        ├── lib/
        │   ├── socket.js           ← Socket.io singleton + stores
        │   ├── dashboardStore.js
        │   ├── CharacterCard.svelte
        │   ├── CharacterCreationForm.svelte
        │   ├── CharacterManagement.svelte
        │   ├── PhotoSourcePicker.svelte
        │   ├── DashboardCard.svelte
        │   └── DiceRoller.svelte
        └── app.css
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

## Running the Project

- Install deps (first time): `npm install` in root, then `npm install` in `control-panel/`
- Server: `node server.js` (port 3000)
- Control panel: `npm run dev -- --host` from `control-panel/` (port 5173)
- Auto-configure IPs: `npm run setup-ip` (writes root `.env` and `control-panel/.env`)
- Both overlays: `public/overlay-hp.html`, `public/overlay-dice.html`
