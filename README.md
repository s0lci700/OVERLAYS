# DADOS & RISAS — Real-Time D&D Overlay System

> A custom-built, production-ready overlay system for live D&D streaming. Control character HP and dice rolls from your phone. Watch it update in OBS instantly.

![Status](https://img.shields.io/badge/status-MVP%20COMPLETE-brightgreen)
![Stack](https://img.shields.io/badge/stack-Node.js%20%2B%20Svelte%20%2B%20Socket.io-blue)
![Latency](https://img.shields.io/badge/latency-%3C100ms-success)
![Built in](https://img.shields.io/badge/built%20in-2%20days-orange)

---

## What It Does

Roll dice on your phone. A animated popup appears on OBS in under a second. Hit someone for damage. The HP bar updates, turns orange, starts pulsing red. No refresh. No lag. No plugins.

**Everything that works right now:**

| Feature | Status |
|---|---|
| HP bars update in real-time | ✅ Working |
| Dice roll popup (d4–d20) | ✅ Working |
| Nat 20 → **¡CRÍTICO!** glow | ✅ Working |
| Nat 1 → **¡PIFIA!** red glow | ✅ Working |
| Color-coded health states | ✅ Working |
| Phone control panel | ✅ Working |
| Multiple clients synced | ✅ Working |
| OBS-ready transparent overlays | ✅ Working |

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

### 2. Configure your local IP

Both `server.js` and `control-panel/src/lib/socket.js` have the server IP hardcoded. Find your local IP and update it:

```bash
# Windows
ipconfig

# macOS / Linux
ifconfig | grep inet
```

Replace `192.168.1.82` in these two files:

```
server.js → const serverPort = 'http://YOUR_IP:3000'
control-panel/src/lib/socket.js → const serverPort = 'http://YOUR_IP:3000'
```

### 3. Start everything

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

### 4. Add overlays in OBS

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
│
├── public/                        # OBS overlay files (vanilla HTML/CSS/JS)
│   ├── overlay-hp.html            # HP bars — always visible
│   └── overlay-dice.html          # Dice popup — appears on roll, auto-hides
│
├── control-panel/                 # Svelte + Vite control panel
│   ├── src/
│   │   ├── App.svelte             # Root: character list + dice roller
│   │   ├── lib/
│   │   │   ├── socket.js          # Socket.io singleton + Svelte stores
│   │   │   ├── CharacterCard.svelte  # HP controls (Damage / Heal)
│   │   │   └── DiceRoller.svelte     # d4/d6/d8/d10/d12/d20 buttons
│   │   └── app.css
│   ├── vite.config.js
│   └── package.json
│
└── ROADMAPS/                      # Project planning docs
```

---

## API Reference

### `GET /api/characters`

Returns the full character list.

```json
[
  { "id": "char1", "name": "El verdadero", "player": "Lucas", "hp_current": 28, "hp_max": 35 },
  { "id": "char2", "name": "B12",          "player": "Sol",   "hp_current": 30, "hp_max": 30 }
]
```

### `PUT /api/characters/:id/hp`

Updates a character's current HP and broadcasts `hp_updated` to all connected clients.

```http
PUT /api/characters/char1/hp
Content-Type: application/json

{ "hp_current": 15 }
```

**Response:** the updated character object.

### `POST /api/rolls`

Logs a dice roll and broadcasts `dice_rolled` to all connected clients.

```http
POST /api/rolls
Content-Type: application/json

{ "charId": "char1", "result": 18, "modifier": 0, "sides": 20 }
```

**Response:**
```json
{ "charId": "char1", "rollResult": 18, "sides": 20 }
```

---

## Socket.io Events

| Event | Direction | Payload |
|---|---|---|
| `initialData` | Server → Client | `{ characters[], rolls[] }` — sent on connect |
| `hp_updated` | Server → All | `{ character, hp_current }` |
| `dice_rolled` | Server → All | `{ charId, result, modifier, rollResult, sides }` |

---

## Overlay Details

### HP Overlay (`overlay-hp.html`)

Positioned top-right, 1920×1080, transparent background.

| HP % | Color | Effect |
|---|---|---|
| > 60% | Green | Healthy |
| 30–60% | Orange | Injured |
| < 30% | Red | Critical — pulse animation |

HP bars animate smoothly on every update (0.5s CSS transition). A status message fades in and out when HP changes.

### Dice Overlay (`overlay-dice.html`)

Centered at bottom, hidden by default. Appears with a pop-in animation when a roll comes in, auto-hides after 4 seconds.

| Roll | Effect |
|---|---|
| Natural 20 | **¡CRÍTICO!** — green glow |
| Natural 1  | **¡PIFIA!** — red glow |
| Everything else | Shows total with fade-out |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js 18, Express 5, Socket.io 4.8 |
| Control Panel | Svelte 5, Vite 7 |
| Overlays | Vanilla HTML/CSS/JS (Socket.io via CDN) |
| Data | In-memory (demo) |
| Communication | WebSocket via Socket.io |

No database required for the demo. Characters reset when the server restarts — which is fine for a live session.

---

## Debugging

| Problem | Fix |
|---|---|
| Overlay not connecting | Check that `server.js` is running on port 3000 |
| Phone can't reach server | Update IP in `socket.js` and restart Vite with `--host` |
| OBS overlay blank | Right-click Browser Source → Interact → check console (F12) |
| HP not updating | Verify the `PUT` request in Network tab, check server logs |

Quick API test:

```bash
# Verify server is up
curl http://localhost:3000/api/characters

# Manual HP update
curl -X PUT http://localhost:3000/api/characters/char1/hp \
  -H "Content-Type: application/json" \
  -d '{"hp_current": 10}'
```

---

## Demo Script

**30 seconds. Phone in hand. OBS visible on second screen.**

1. Open control panel on phone — show it to camera
2. Hit "Damage" on El verdadero — watch OBS bar drop and turn orange
3. Hit it again — bar turns red, starts pulsing
4. Roll a d20 — dice popup flies in on OBS
5. If Nat 20: "¡CRÍTICO!" in green
6. Say: *"Este es solo el MVP — puedo agregar lo que necesiten."*

---

## Roadmap

### Done
- [x] Express + Socket.io server
- [x] REST API (characters, HP, rolls)
- [x] HP overlay with health state animations
- [x] Dice roll overlay with crit/fail detection
- [x] Svelte control panel (phone-ready)
- [x] Real-time sync across all clients

### Day 3 (Polish)
- [ ] Tailwind CSS styling on control panel
- [ ] Record 2–3 min demo video
- [ ] Screenshots for pitch email

### Post-Pitch (If Greenlit)
- [ ] SQLite persistence (survive server restarts)
- [ ] Character creation UI
- [ ] Tonybet odds tracker overlay
- [ ] Initiative tracker
- [ ] Combat log / history
- [ ] Sound effects
- [ ] Custom Chilean branding / theme

---

## vs. Generic Overlay Tools

| | overlays.uno | DADOS & RISAS |
|---|---|---|
| HP tracking | No | Yes |
| Dice integration | No | Yes |
| Mobile control | No | Yes |
| Custom branding | Limited | 100% |
| D&D game state | No | Full |
| One-time cost | Monthly fee | Custom build |

---

## Team

- **Sol** — Developer, Technical Lead
- **Lucas** — Dungeon Master, Creative Lead
- **Salvador** — Technical Assistant
- **Kuminak** — D&D Expert, Workshop Lead

---

## Pitch

**Target:** ESDH (El Show de Héctor)
**Email deadline:** Friday Feb 21, 2026
**Meeting:** Monday Feb 24, 2026

---

<div align="center">

Built for D&D, streaming, and Chilean content creators.

[Report a bug](https://github.com/s0lci700/OVERLAYS/issues) · [Request a feature](https://github.com/s0lci700/OVERLAYS/issues)

</div>
