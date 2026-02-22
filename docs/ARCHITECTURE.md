# Architecture Guide

> Quick-reference map for navigating the DADOS & RISAS codebase.

Fast lookup: see [docs/INDEX.md](docs/INDEX.md).

---

## System Overview

```
┌─────────────────────────────┐
│   Phone / Tablet / Desktop  │
│   Control Panel (Svelte 5)  │
│   :5173                     │
└──────────┬──────────────────┘
           │  REST (fetch)
           │  + Socket.io client
           ▼
┌─────────────────────────────┐
│   Node.js Server            │
│   Express + Socket.io       │
│   :3000                     │
│                             │
│   data/characters.js        │ ← in-memory character state
│   data/rolls.js             │ ← roll history log
└──────────┬──────────────────┘
           │  Socket.io broadcast
           │  (all events → all clients)
     ┌─────┴─────┐
     ▼           ▼
┌──────────┐ ┌──────────┐
│ HP       │ │ Dice     │
│ Overlay  │ │ Overlay  │
│ (OBS)    │ │ (OBS)    │
└──────────┘ └──────────┘
```

Every client connects to the same Socket.io server. When the control panel
sends a REST request (e.g., PUT HP), the server mutates in-memory state,
responds to the caller, and broadcasts a Socket.io event to **all** clients
(including overlays). Overlays never send requests — they only listen.

---

## File Map

### Backend (`/`)

| File                 | Purpose                                                        | Key exports                                                                                               |
| -------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `server.js`          | Express app, Socket.io server, all API routes                  | Listens on `:3000`                                                                                        |
| `data/characters.js` | Character fixtures + CRUD (HP, conditions, resources, rest)    | `getAll`, `findById`, `createCharacter`, `updateCharacterData`, `updateHp`, `updatePhoto`, `addCondition`, `removeCondition`, `updateResource`, `restoreResources` |
| `data/rolls.js`      | Roll history logger                                            | `getAll`, `logRoll`                                                                                       |
| `data/photos.js`     | Photo assignment utility (random fallback from `assets/img/`)  | `ensureCharactersPhotos`, `ensureCharacterPhoto`                                                          |
| `data/id.js`         | Short 5-character ID generator                                 | `createShortId`                                                                                           |
| `data/resources.js`  | **Unused** — standalone resource pool experiment               | `getActive`, `forCharacter`                                                                               |
| `data/state.js`      | **Unused** — snapshot aggregator re-exporting all data modules | `getSnapshot`                                                                                             |

### Control Panel (`/control-panel/src/`)

The control panel is a **SvelteKit** application. File-based routes live under `routes/`; reusable components and stores live under `lib/`.

#### Routes

| Route path             | File                                        | Purpose                                       |
| ---------------------- | ------------------------------------------- | --------------------------------------------- |
| `/`                    | `routes/+page.svelte`                       | Redirects to `/control/characters`            |
| (all routes)           | `routes/+layout.svelte`                     | App shell: header, sidebar, navigation        |
| `/control/characters`  | `routes/control/characters/+page.svelte`    | Character HP / conditions / resources view    |
| `/control/dice`        | `routes/control/dice/+page.svelte`          | Dice roller view                              |
| `/control` (shared)    | `routes/control/+layout.svelte`             | Characters / Dice bottom nav                  |
| `/management/create`   | `routes/management/create/+page.svelte`     | Character creation form                       |
| `/management/manage`   | `routes/management/manage/+page.svelte`     | Photo/data editing + bulk controls            |
| `/management` (shared) | `routes/management/+layout.svelte`          | Create / Manage bottom nav                    |
| `/dashboard`           | `routes/dashboard/+page.svelte`             | Live read-only dashboard (TV/monitor view)    |

#### Library (`lib/`)

| File                              | Purpose                                                          | Key exports / state                                                                                          |
| --------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `lib/socket.js`                   | Socket.io singleton + Svelte stores                              | `socket`, `characters` (writable), `lastRoll` (writable), `SERVER_URL`                                      |
| `lib/dashboardStore.js`           | Activity history, pending action queue, role state               | `history`, `pendingActions`, `isSyncing`, `currentRole`, `recordHistory`, `enqueuePending`, `dequeuePending` |
| `lib/router.js`                   | Hash-based router helpers (for App.svelte fallback)              | `parseHash`, `updateHash`, `onHashChange`                                                                    |
| `lib/CharacterCard.svelte`        | Per-character card: HP, conditions, resources, rest, damage/heal | Props: `character`                                                                                           |
| `lib/CharacterCard.css`           | Card styles: HP bar, pips, conditions, stepper                   | —                                                                                                            |
| `lib/CharacterCreationForm.svelte`| New character creation form                                      | —                                                                                                            |
| `lib/CharacterCreationForm.css`   | Creation form styles                                             | —                                                                                                            |
| `lib/CharacterManagement.svelte`  | Photo/data editing, bulk controls, character list                | —                                                                                                            |
| `lib/CharacterManagement.css`     | Management panel styles                                          | —                                                                                                            |
| `lib/CharacterBulkControls.css`   | Bulk action button styles                                        | —                                                                                                            |
| `lib/PhotoSourcePicker.svelte`    | URL / file-upload photo picker                                   | —                                                                                                            |
| `lib/PhotoSourcePicker.css`       | Photo picker styles                                              | —                                                                                                            |
| `lib/DashboardCard.svelte`        | Per-character dashboard tile (read-only)                         | Props: `character`                                                                                           |
| `lib/DashboardCard.css`           | Dashboard card styles                                            | —                                                                                                            |
| `lib/Dashboard.css`               | Dashboard shell / grid styles                                    | —                                                                                                            |
| `lib/DiceRoller.svelte`           | Dice roller: character selector, modifier, d4–d20 grid           | `selectedCharId`, `modifier`                                                                                 |
| `lib/DiceRoller.css`              | Dice grid, result card, crit/fail states                         | —                                                                                                            |

### OBS Overlays (`/public/`)

| File                | Purpose                                                           |
| ------------------- | ----------------------------------------------------------------- |
| `overlay-hp.html`   | HP bars overlay — positioned top-right, color-coded health states |
| `overlay-hp.css`    | HP overlay styles: gradients, pulse animation, status banner      |
| `overlay-dice.html` | Dice roll popup — bottom-center, anime.js bounce, auto-hide 4s    |
| `overlay-dice.css`  | Dice card styles: crit/fail states, result number                 |

### Documentation (`/docs/`)

| File               | Purpose                                          |
| ------------------ | ------------------------------------------------ |
| `ARCHITECTURE.md`  | This file — codebase navigation                  |
| `ENVIRONMENT.md`   | .env setup, IP configuration, overlay URLs       |
| `SOCKET-EVENTS.md` | Complete Socket.io event reference with payloads |
| `DESIGN-SYSTEM.md` | CSS tokens, typography, component style guide    |

### Project Management (root)

| File                                  | Purpose                                                               |
| ------------------------------------- | --------------------------------------------------------------------- |
| `README.md`                           | Setup guide, API reference, demo script                               |
| `CLAUDE.md`                           | LLM project context (architecture, conventions, running instructions) |
| `TODO.md`                             | Day-by-day task checklist                                             |
| `PROGRESS.md`                         | Development log with technical details                                |
| `TRACKER.md`                          | One-page status for teammates                                         |
| `CONTEXTO_COMPLETO_PITCH.md`          | Full pitch strategy context (Spanish)                                 |
| `DAY2_COMPLETION_REPORT.md`           | Day 2 completion summary                                              |
| `control-panel/CONTROL-STATE-PLAN.md` | Transaction manager design plan (not yet implemented)                 |

---

## Data Flow: HP Update

```
1. User taps "DAÑO" on CharacterCard.svelte
     ↓
2. CharacterCard.updateHp("damage") → fetch PUT /api/characters/:id/hp
     ↓
3. server.js receives PUT → characters.updateHp(id, hp) → clamps HP
     ↓
4. server.js responds 200 + io.emit("hp_updated", { character, hp_current })
     ↓
5. All clients receive "hp_updated":
   ├── socket.js → updates characters store → CharacterCard re-renders
   ├── dashboardStore.js → logs to activity history
   ├── overlay-hp.html → updateCharacterHP() → bar width + color transition
   └── (any other connected client)
```

## Data Flow: Dice Roll

```
1. User taps "d20" on DiceRoller.svelte
     ↓
2. DiceRoller.rollDice(20) → Math.random → fetch POST /api/rolls
     ↓
3. server.js receives POST → rolls.logRoll() → computes rollResult
     ↓
4. server.js responds 201 + io.emit("dice_rolled", { ...rollRecord })
     ↓
5. All clients receive "dice_rolled":
   ├── socket.js → updates lastRoll store → DiceRoller shows result with animation
   ├── dashboardStore.js → logs to activity history
   └── overlay-dice.html → showRoll() → anime.js card + bounce + 4s auto-hide
```

---

## Key Design Decisions

| Decision                                         | Rationale                                                               |
| ------------------------------------------------ | ----------------------------------------------------------------------- |
| In-memory data (no DB)                           | MVP speed — characters reset on restart, fine for demo                  |
| Vanilla JS for overlays                          | Lighter than frameworks, better OBS Browser Source performance          |
| Socket.io over raw WS                            | Auto-reconnect, room support, CDN available for overlay scripts         |
| Svelte 5 runes (`$state`, `$derived`, `$effect`) | Latest Svelte reactivity model, simpler than stores for component state |
| SvelteKit file-based routing                     | Clean URL structure, layout nesting, standard Svelte framework choice   |
| Separate CSS files per component                 | Avoids Svelte scoped style limitations with dynamic classes             |
| anime.js for animations                          | Small library, elastic/spring easing, already used in overlay-dice.html |
| `.env` + `?server=` param for server URL         | No hardcoded IPs — `npm run setup-ip` auto-detects local address        |

---

## Server URL Configuration

The project now uses `.env` files instead of hardcoding IP addresses:

1. Root `.env` (generated by `npm run setup-ip`) sets `PORT` and `CONTROL_PANEL_ORIGIN`.
2. `control-panel/.env` sets `VITE_SERVER_URL` and `VITE_PORT` for the frontend.
3. Overlays accept a `server` query parameter, for example:
   `overlay-hp.html?server=http://192.168.1.83:3000`

If the overlays are loaded without a query parameter, they fall back to
`http://localhost:3000`.

---

## Feature Summary

The current codebase includes:

- Full CRUD character management (create, update HP, update photo, update fields)
- Condition system (add/remove D&D 5e status effects with intensity levels)
- Resource pool system (Rage, Ki, Spell Slots, etc. with short/long rest recharge)
- SvelteKit control panel with three top-level routes: `/control`, `/management`, `/dashboard`
- Live dashboard view suitable for a TV or second monitor
- Character photo support (URL or base64 data URI, with random fallback from `assets/img/`)
