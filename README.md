# DADOS & RISAS — Real-Time D&D Overlay System

> A custom-built, production-ready overlay system for live D&D streaming. Control character HP and dice rolls from your phone. Watch it update in OBS instantly.

![Status](https://img.shields.io/badge/status-MVP%20COMPLETE-brightgreen)
![Stack](https://img.shields.io/badge/stack-Node.js%20%2B%20Svelte%20%2B%20Socket.io-blue)
![Latency](https://img.shields.io/badge/latency-%3C100ms-success)
![Built in](https://img.shields.io/badge/built%20in-2%20days-orange)

Quick navigation: see [docs/INDEX.md](docs/INDEX.md).

---

## What It Does

Roll dice on your phone. A animated popup appears on OBS in under a second. Hit someone for damage. The HP bar updates, turns orange, starts pulsing red. No refresh. No lag. No plugins.

**Everything that works right now:**

| Feature                            | Status     |
| ---------------------------------- | ---------- |
| HP bars update in real-time        | ✅ Working |
| Dice roll popup (d4–d20)           | ✅ Working |
| Nat 20 → **¡CRÍTICO!** glow        | ✅ Working |
| Nat 1 → **¡PIFIA!** red glow       | ✅ Working |
| Color-coded health states          | ✅ Working |
| Phone control panel                | ✅ Working |
| Multiple clients synced            | ✅ Working |
| OBS-ready transparent overlays     | ✅ Working |
| Character creation & management    | ✅ Working |
| Status condition tracking          | ✅ Working |
| Resource pools (Rage, Ki, etc.)    | ✅ Working |
| Short / long rest restoration      | ✅ Working |
| Live dashboard view                | ✅ Working |

---

## Architecture

```
Phone / Tablet
  └── Control Panel (Svelte) :5173
        │
        │  HTTP PUT + POST
        ▼
  Node.js Server (Express + Socket.io) :3000
        │
        │  WebSocket broadcast (< 100ms)
        ├──────────────────────┐
        ▼                      ▼
  overlay-hp.html         overlay-dice.html
  (OBS Browser Source)    (OBS Browser Source)
```

One server. Everything connects to it. When you update HP from your phone, the server fires a Socket.io event to every connected client — the OBS overlay updates before you put the phone down.

---

## Quick Start

### Prerequisites

- Node.js 18+ — [nodejs.org](https://nodejs.org)
- OBS Studio (for overlays) — optional for testing

### 1. Install dependencies

```bash
# Root (backend)
npm install

# Control panel (frontend)
cd control-panel && npm install
```

### 2. Configure environment

Auto-detect your IP and generate both `.env` files:

```bash
npm run setup-ip
```

Manual alternative:

```bash
cp .env.example .env
cp control-panel/.env.example control-panel/.env
```

Root `.env`:

| Variable               | Default                 | Description                                        |
| ---------------------- | ----------------------- | -------------------------------------------------- |
| `PORT`                 | `3000`                  | Server port                                        |
| `CONTROL_PANEL_ORIGIN` | `http://localhost:5173` | CORS origin for the control panel                  |
| `CHARACTERS_TEMPLATE`  | `template-characters`   | Character seed file in `data/` (without extension) |

Control panel `control-panel/.env`:

| Variable          | Default                 | Description             |
| ----------------- | ----------------------- | ----------------------- |
| `VITE_SERVER_URL` | `http://localhost:3000` | Backend server base URL |
| `VITE_PORT`       | `5173`                  | Vite dev server port    |

### 3. Configure overlay server URL

Overlays read the server URL from a query string. Pass the backend URL when adding the
Browser Source in OBS (or when testing in a browser):

```
overlay-hp.html?server=http://YOUR_IP:3000
overlay-dice.html?server=http://YOUR_IP:3000
```

If you omit the parameter, overlays default to `http://localhost:3000`.

Find your IP if you need to build the URL manually:

```bash
# Windows
ipconfig

# macOS / Linux
ifconfig | grep inet
```

### 4. Start everything

**Terminal 1 — Backend:**

```bash
node server.js
# → Server is running on port 3000
```

**Terminal 2 — Control panel (with LAN access for phone):**

```bash
cd control-panel
npm run dev -- --host
# → Local:   http://localhost:5173/
# → Network: http://192.168.x.x:5173/   ← open this on your phone
```

Optional shortcut (runs `setup-ip` + `vite dev --host`):

```bash
cd control-panel
npm run dev:auto
```

### 5. Add overlays in OBS

1. Add Source → **Browser**
2. Check **"Local file"**
3. Browse to `public/overlay-hp.html`
4. Width: **1920**, Height: **1080**
5. Enable **"Refresh browser when scene becomes active"**
6. Disable **"Shutdown source when not visible"**

Repeat for `public/overlay-dice.html`.

---

## Project Structure

```
OVERLAYS/
├── server.js                      # Express + Socket.io backend
├── package.json
├── .env.example                   # Environment variable template
│
├── data/                          # In-memory data modules
│   ├── characters.js              # Character state + CRUD + template loader
│   ├── rolls.js                   # Roll history logger
│   ├── photos.js                  # Photo assignment utility
│   ├── id.js                      # Short ID generator
│   ├── template-characters.json   # Default swappable character template
│   └── test_characters.js         # Legacy template (unused)
│
├── public/                        # OBS overlay files (vanilla HTML/CSS/JS)
│   ├── overlay-hp.html            # HP bars — always visible
│   ├── overlay-hp.css             # HP overlay styles
│   ├── overlay-dice.html          # Dice popup — appears on roll, auto-hides
│   └── overlay-dice.css           # Dice overlay styles
│
├── control-panel/                 # SvelteKit + Vite control panel
│   ├── src/
│   │   ├── routes/                # SvelteKit file-based routes
│   │   │   ├── +layout.svelte         # App shell: header, sidebar, nav
│   │   │   ├── +page.svelte           # Redirects / → /control/characters
│   │   │   ├── control/               # Control tabs
│   │   │   │   ├── +layout.svelte     # Characters / Dice bottom nav
│   │   │   │   ├── characters/        # /control/characters
│   │   │   │   └── dice/              # /control/dice
│   │   │   ├── management/            # Management tabs
│   │   │   │   ├── +layout.svelte     # Create / Manage bottom nav
│   │   │   │   ├── create/            # /management/create
│   │   │   │   └── manage/            # /management/manage
│   │   │   └── dashboard/             # /dashboard — live read-only view
│   │   ├── lib/
│   │   │   ├── socket.js              # Socket.io singleton + Svelte stores
│   │   │   ├── dashboardStore.js      # Activity history, pending actions
│   │   │   ├── router.js              # Hash-based router helpers
│   │   │   ├── CharacterCard.svelte   # HP, conditions, resources, rest
│   │   │   ├── CharacterCard.css
│   │   │   ├── CharacterCreationForm.svelte  # New character form
│   │   │   ├── CharacterCreationForm.css
│   │   │   ├── CharacterManagement.svelte    # Photo/data edit + bulk controls
│   │   │   ├── CharacterManagement.css
│   │   │   ├── CharacterBulkControls.css
│   │   │   ├── PhotoSourcePicker.svelte      # URL / file photo picker
│   │   │   ├── PhotoSourcePicker.css
│   │   │   ├── DashboardCard.svelte          # Per-character dashboard tile
│   │   │   ├── DashboardCard.css
│   │   │   ├── Dashboard.css
│   │   │   ├── DiceRoller.svelte      # d4/d6/d8/d10/d12/d20 buttons
│   │   │   └── DiceRoller.css
│   │   ├── app.css                # Design tokens + shared bases
│   │   └── app.html               # SvelteKit HTML template
│   ├── vite.config.js
│   └── package.json
│
├── scripts/                       # Local tooling
│   └── setup-ip.js                # Auto-detect IP and write .env files
│
└── docs/                          # Technical reference docs
    ├── INDEX.md                   # Quick navigation guide
    ├── ARCHITECTURE.md            # Codebase navigation + data-flow diagrams
    ├── ENVIRONMENT.md             # .env setup, IP configuration, overlay URLs
    ├── SOCKET-EVENTS.md           # Complete Socket.io event reference
    ├── DESIGN-SYSTEM.md           # CSS tokens, typography, component guide
    └── testing.md                 # Playwright E2E + k6 stress test guide
```

---

## API Reference

### `GET /api/characters`

Returns the full character list (including HP, conditions, and resources).

```json
[
  {
    "id": "CH101",
    "name": "Kael",
    "player": "Mara",
    "hp_current": 12,
    "hp_max": 12,
    "conditions": [],
    "resources": []
  },
  {
    "id": "CH102",
    "name": "Lyra",
    "player": "Nico",
    "hp_current": 8,
    "hp_max": 8,
    "conditions": [],
    "resources": []
  }
]
```

### `POST /api/characters`

Creates a new character and broadcasts `character_created` to all clients.

```http
POST /api/characters
Content-Type: application/json

{
  "name": "Theron",
  "player": "Alex",
  "hp_max": 14,
  "hp_current": 14,
  "armor_class": 15,
  "speed_walk": 30
}
```

**Response (201):** the created character object.

### `PUT /api/characters/:id`

Updates editable character fields (name, player, hp_max, hp_current, armor_class, speed_walk, class_primary, background, species, languages, alignment, proficiencies, equipment) and broadcasts `character_updated`.

```http
PUT /api/characters/CH101
Content-Type: application/json

{ "name": "Kael the Bold", "armor_class": 16 }
```

**Response:** the updated character object.

### `PUT /api/characters/:id/photo`

Updates a character's photo (URL string or base64 data URI) and broadcasts `character_updated`.

```http
PUT /api/characters/CH101/photo
Content-Type: application/json

{ "photo": "https://example.com/kael.png" }
```

**Response:** the updated character object.

### `PUT /api/characters/:id/hp`

Updates a character's current HP (clamped to `[0, hp_max]`) and broadcasts `hp_updated` to all clients.

```http
PUT /api/characters/CH101/hp
Content-Type: application/json

{ "hp_current": 15 }
```

**Response:** the updated character object.

### `POST /api/characters/:id/conditions`

Adds a status condition to a character and broadcasts `condition_added`.

```http
POST /api/characters/CH101/conditions
Content-Type: application/json

{ "condition_name": "Poisoned", "intensity_level": 1 }
```

**Response:** the new condition object `{ id, condition_name, intensity_level, applied_at }`.

### `DELETE /api/characters/:id/conditions/:condId`

Removes a condition by 5-character ID and broadcasts `condition_removed`.

**Response:** `{ "ok": true }`.

### `PUT /api/characters/:id/resources/:rid`

Updates a resource pool (e.g. Rage charges) and broadcasts `resource_updated`.

```http
PUT /api/characters/CH101/resources/RS201
Content-Type: application/json

{ "pool_current": 2 }
```

**Response:** the updated resource object.

### `POST /api/characters/:id/rest`

Applies a short or long rest, restores matching resource pools, and broadcasts `rest_taken`.

```http
POST /api/characters/CH101/rest
Content-Type: application/json

{ "type": "short" }
```

**Response:** `{ "restored": ["RAGE"] }`.

### `POST /api/rolls`

Logs a dice roll and broadcasts `dice_rolled` to all connected clients.

```http
POST /api/rolls
Content-Type: application/json

{ "charId": "CH101", "result": 18, "modifier": 0, "sides": 20 }
```

**Response:** the full roll record `{ id, charId, characterName, result, modifier, rollResult, sides, timestamp }`.

---

## Socket.io Events

| Event               | Direction                  | Payload                                                                         |
| ------------------- | -------------------------- | ------------------------------------------------------------------------------- |
| `initialData`       | Server → connecting client | `{ characters[], rolls[] }` — sent on connect                                   |
| `hp_updated`        | Server → All               | `{ character, hp_current }`                                                     |
| `character_created` | Server → All               | `{ character }`                                                                 |
| `character_updated` | Server → All               | `{ character }`                                                                 |
| `condition_added`   | Server → All               | `{ charId, condition }`                                                         |
| `condition_removed` | Server → All               | `{ charId, conditionId }`                                                       |
| `resource_updated`  | Server → All               | `{ charId, resource }`                                                          |
| `rest_taken`        | Server → All               | `{ charId, type, restored[], character }`                                       |
| `dice_rolled`       | Server → All               | `{ id, charId, characterName, result, modifier, rollResult, sides, timestamp }` |

See [`docs/SOCKET-EVENTS.md`](docs/SOCKET-EVENTS.md) for full payload shapes and type definitions.

---

## Overlay Details

### HP Overlay (`overlay-hp.html`)

Positioned top-right, 1920×1080, transparent background.

| HP %   | Color  | Effect                     |
| ------ | ------ | -------------------------- |
| > 60%  | Green  | Healthy                    |
| 30–60% | Orange | Injured                    |
| < 30%  | Red    | Critical — pulse animation |

HP bars animate smoothly on every update (0.5s CSS transition). A status message fades in and out when HP changes.

### Dice Overlay (`overlay-dice.html`)

Centered at bottom, hidden by default. Appears with a pop-in animation when a roll comes in, auto-hides after 4 seconds.

| Roll            | Effect                     |
| --------------- | -------------------------- |
| Natural 20      | **¡CRÍTICO!** — green glow |
| Natural 1       | **¡PIFIA!** — red glow     |
| Everything else | Shows total with fade-out  |

## Tech Stack

| Layer         | Technology                              |
| ------------- | --------------------------------------- |
| Backend       | Node.js 18, Express 5, Socket.io 4.8    |
| Control Panel | Svelte 5, Vite 7                        |
| Overlays      | Vanilla HTML/CSS/JS (Socket.io via CDN) |
| Data          | In-memory (demo)                        |
| Communication | WebSocket via Socket.io                 |

No database required for the demo. Characters reset when the server restarts — which is fine for a live session.

---

## Debugging

| Problem                  | Fix                                                                                          |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| Overlay not connecting   | Check that `server.js` is running on port 3000                                               |
| Phone can't reach server | Run `npm run setup-ip`, ensure `VITE_SERVER_URL` matches your IP, restart Vite with `--host` |
| OBS overlay blank        | Right-click Browser Source → Interact → check console (F12)                                  |
| HP not updating          | Verify the `PUT` request in Network tab, check server logs                                   |

Quick API test:

```bash
# Verify server is up
curl http://localhost:3000/api/characters

# Manual HP update
curl -X PUT http://localhost:3000/api/characters/CH101/hp \
  -H "Content-Type: application/json" \
  -d '{"hp_current": 10}'
```

---

## Demo Script

**30 seconds. Phone in hand. OBS visible on second screen.**

1. Open control panel on phone — show it to camera
2. Hit "Damage" on Kael — watch OBS bar drop and turn orange
3. Hit it again — bar turns red, starts pulsing
4. Roll a d20 — dice popup flies in on OBS
5. If Nat 20: "¡CRÍTICO!" in green
6. Say: _"Este es solo el MVP — puedo agregar lo que necesiten."_

---

## Roadmap

### Done

- [x] Express + Socket.io server
- [x] REST API (characters, HP, conditions, resources, rest, rolls)
- [x] HP overlay with health state animations
- [x] Dice roll overlay with crit/fail detection
- [x] Svelte control panel (phone-ready, SvelteKit routing)
- [x] Real-time sync across all clients
- [x] Condition management (add/remove status effects)
- [x] Resource pool system (short/long rest restoration)
- [x] Character creation & management UI
- [x] Photo upload/URL support per character
- [x] Live dashboard view

### Post-Pitch (If Greenlit)

- [ ] SQLite persistence (survive server restarts)
- [ ] Character creation UI
- [ ] Tonybet odds tracker overlay
- [ ] Initiative tracker
- [ ] Combat log / history
- [ ] Sound effects
- [ ] Custom Chilean branding / theme

## vs. Generic Overlay Tools

|                  | overlays.uno | DADOS & RISAS |
| ---------------- | ------------ | ------------- |
| HP tracking      | No           | Yes           |
| Dice integration | No           | Yes           |
| Mobile control   | No           | Yes           |
| Custom branding  | Limited      | 100%          |
| D&D game state   | No           | Full          |
| One-time cost    | Monthly fee  | Custom build  |

---

## Team

- **Sol** — Developer, Technical Lead
- **Lucas** — Dungeon Master, Creative Lead
- **Salvador** — Technical Assistant
- **Kuminak** — D&D Expert, Workshop Lead

---

## Pitch

**Target:** ESDH (El Show de Héctor)
**Email deadline:** Monday Feb 24, 2026 at 8am
**Meeting:** Monday Feb 24, 2026

---

<div align="center">

Built for D&D, streaming, and Chilean content creators.

[Report a bug](https://github.com/s0lci700/OVERLAYS/issues) · [Request a feature](https://github.com/s0lci700/OVERLAYS/issues)

</div>
