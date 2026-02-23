# DADOS & RISAS 🎲

**Sistema de producción en tiempo real para campañas de D&D en streaming.**

Controlá personajes, puntos de vida y tiradas de dado desde el celular. Los overlays en OBS se actualizan al instante — sin recargar, sin delay, sin plugins.

![Status](https://img.shields.io/badge/estado-MVP%20COMPLETO-brightgreen)
![Stack](https://img.shields.io/badge/stack-Node.js%20%2B%20Svelte%20%2B%20Socket.io-blue)
![Latency](https://img.shields.io/badge/latencia-%3C100ms-success)
![Built in](https://img.shields.io/badge/construido%20en-2%20días-orange)

[![Latest Release](https://img.shields.io/github/v/release/s0lci700/OVERLAYS?label=descargar&logo=github)](https://github.com/s0lci700/OVERLAYS/releases/latest)

---

## Demo en vivo

> Abrí **`http://IP-DEL-SERVIDOR:3001`** desde cualquier dispositivo en la misma red — te muestra todos los links de overlays y el panel de control con las URLs ya configuradas.

**Flujo del demo:**

1. Abrir el panel en el celular → modificar el PV de Kael → la barra en OBS se anima sola
2. Tirar un d20 → resultado animado aparece en pantalla → nat 20 activa flash **¡CRÍTICO!**
3. Aplicar condición "Envenenado" → badge rojo aparece en el overlay y en el tracker
4. *"Esto es solo el MVP — puedo agregar lo que necesiten"*

---

## ¿Qué hace?

| Función | Estado |
| ------- | ------ |
| Barras de PV en tiempo real (colores por estado) | ✅ Funcionando |
| Avatar del personaje + clase + nivel + CA en overlay | ✅ Funcionando |
| Popup de tirada de dado (d4–d20) con animación | ✅ Funcionando |
| Nat 20 → **¡CRÍTICO!** — flash cyan, número gigante | ✅ Funcionando |
| Nat 1 → **¡PIFIA!** — flash rojo + shake | ✅ Funcionando |
| Condiciones activas en tiempo real (Envenenado, Aturdido…) | ✅ Funcionando |
| Tracker de recursos (Inspiración, Canalizar Divinidad…) | ✅ Funcionando |
| Panel de control mobile-first desde el celular | ✅ Funcionando |
| Múltiples clientes sincronizados (varios teléfonos a la vez) | ✅ Funcionando |
| Overlays servidos por red — sin archivos locales en OBS | ✅ Funcionando |
| Creación y gestión de personajes | ✅ Funcionando |
| Descanso corto/largo con restauración de recursos | ✅ Funcionando |
| Dashboard en vivo (lectura) | ✅ Funcionando |

---

## Architecture

```
Phone / Tablet
  └── Control Panel (Svelte) :5173
        │
        │  HTTP PUT + POST
        ▼
  Node.js Server (Express + Socket.io) :3001
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
| `PORT`                 | `3001`                  | Server port                                        |
| `CONTROL_PANEL_ORIGIN` | `http://localhost:5173` | CORS origin for the control panel                  |
| `CHARACTERS_TEMPLATE`  | `template-characters`   | Character seed file in `data/` (without extension) |

Control panel `control-panel/.env`:

| Variable          | Default                 | Description             |
| ----------------- | ----------------------- | ----------------------- |
| `VITE_SERVER_URL` | `http://localhost:3001` | Backend server base URL |
| `VITE_PORT`       | `5173`                  | Vite dev server port    |

### 3. Configure overlay server URL

Overlays read the server URL from a query string. Pass the backend URL when adding the
Browser Source in OBS (or when testing in a browser):

```
overlay-hp.html?server=http://YOUR_IP:3001
overlay-dice.html?server=http://YOUR_IP:3001
```

If you omit the parameter, overlays default to `http://localhost:3001`.

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
# → Server is running on port 3001
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

### 5. Agregar overlays en OBS

El servidor sirve los overlays por red — no necesitás navegar archivos locales en OBS.

1. En OBS: **Fuentes → + → Navegador**
2. En "URL" pegá la dirección que se muestra en `http://localhost:3001`
3. Dimensiones: **1920 × 1080**
4. Activar **"Actualizar navegador cuando la escena se active"**
5. Desactivar **"Apagar fuente cuando no esté visible"**

| Overlay | URL (reemplazar `IP` con la dirección del servidor) |
|---------|-----------------------------------------------------|
| HP Bars | `http://IP:3001/overlay-hp.html?server=http://IP:3001` |
| Dados | `http://IP:3001/overlay-dice.html?server=http://IP:3001` |
| Condiciones | `http://IP:3001/overlay-conditions.html?server=http://IP:3001` |

> Las URLs exactas con tu IP real se muestran en `http://localhost:3001` (copiar y pegar directo).

Repetir para cada overlay como capa separada en la misma escena.

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
├── public/                        # OBS overlay files + landing page (servidos por red desde :3001)
│   ├── index.html                 # Panel de inicio — muestra URLs con IP real
│   ├── overlay-hp.html            # Barras de PV con avatares y condiciones
│   ├── overlay-hp.css
│   ├── overlay-dice.html          # Popup de tirada con flash crit/pifia
│   ├── overlay-dice.css
│   ├── overlay-conditions.html    # Panel de condiciones activas y recursos agotados
│   └── tokens.css                 # Design tokens compartidos
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

## Overlays

### HP (`overlay-hp.html`) — top-right, siempre visible

Muestra una tarjeta por personaje con: avatar (foto o iniciales), clase + nivel, Clase de Armadura, barra de PV animada, PV temporal y badges de condiciones activas.

| PV %   | Color    | Efecto                       |
| ------ | -------- | ---------------------------- |
| > 60%  | Verde    | Saludable                    |
| 30–60% | Naranja  | Herido                       |
| < 30%  | Rojo     | Crítico — animación pulsante |

### Dados (`overlay-dice.html`) — centro inferior, popup

Aparece con animación al tirar, se oculta solo después de 4s (6s en crítico).

| Tirada     | Efecto                                      |
| ---------- | ------------------------------------------- |
| Natural 20 | Flash cyan, **¡CRÍTICO!**, número 100px     |
| Natural 1  | Flash rojo, shake, **¡PIFIA!**              |
| Resto      | Muestra resultado con desglose + fade-out   |

### Condiciones (`overlay-conditions.html`) — esquina inferior izquierda

Panel que aparece automáticamente cuando algún personaje tiene condiciones activas o recursos agotados. Se oculta solo cuando todo está limpio.

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
| Overlay not connecting   | Check that `server.js` is running on port 3001                                               |
| Phone can't reach server | Run `npm run setup-ip`, ensure `VITE_SERVER_URL` matches your IP, restart Vite with `--host` |
| OBS overlay blank        | Right-click Browser Source → Interact → check console (F12)                                  |
| HP not updating          | Verify the `PUT` request in Network tab, check server logs                                   |

Quick API test:

```bash
# Verify server is up
curl http://localhost:3001/api/characters

# Manual HP update
curl -X PUT http://localhost:3001/api/characters/CH101/hp \
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
- [x] Conditions & resources overlay (auto-show/hide)
- [x] Svelte control panel (phone-ready, SvelteKit routing)
- [x] Real-time sync across all clients
- [x] Condition management (add/remove status effects)
- [x] Resource pool system (short/long rest restoration)
- [x] Character creation & management UI
- [x] Photo upload/URL support per character
- [x] Live dashboard view

### Post-Pitch (If Greenlit)

- [ ] SQLite persistence (survive server restarts)
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
**Meeting:** TBD (rescheduled)

---

<div align="center">

Built for D&D, streaming, and Chilean content creators.

[Report a bug](https://github.com/s0lci700/OVERLAYS/issues) · [Request a feature](https://github.com/s0lci700/OVERLAYS/issues)

</div>
