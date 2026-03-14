# Architecture Guide

> Quick-reference map for navigating the TableRelay codebase (repo currently named `OVERLAYS`, rename pending).

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
│   data/characters.js        │ ← PocketBase character CRUD
│   data/rolls.js             │ ← PocketBase roll history
└──────┬───────────┬──────────┘
       │           │  Socket.io broadcast
       │           │  (all events → all clients)
       ▼     ┌─────┴─────┐
┌──────────┐ ▼           ▼
│PocketBase│ ┌──────────┐ ┌──────────┐
│ :8090    │ │ HP       │ │ Dice     │
│ (SQLite) │ │ Overlay  │ │ Overlay  │
└──────────┘ │ (OBS)    │ │ (OBS)    │
             └──────────┘ └──────────┘
```

Every client connects to the same Socket.io server. When the control panel
sends a REST request (e.g., PUT HP), the server writes to PocketBase,
responds to the caller, and broadcasts a Socket.io event to **all** clients
(including overlays). Overlays never send requests — they only listen.

PocketBase runs as a separate process (`.\pocketbase.exe serve`) and must
be started before the Node.js server.

---

## File Map

### Backend (`/`)

| File                 | Purpose                                                        | Key exports                                                                                               |
| -------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `server.js`          | Express app, Socket.io server, all API routes. Wraps startup in `async main()`, authenticates PocketBase before listening. | Listens on `:3000` |
| `data/characters.js` | PocketBase character CRUD — all functions are async and require `pb` as first arg | `getAll`, `findById`, `createCharacter`, `updateCharacterData`, `updateHp`, `updatePhoto`, `addCondition`, `removeCondition`, `updateResource`, `restoreResources`, `removeCharacter` |
| `data/rolls.js`      | PocketBase roll history — async, requires `pb` as first arg   | `getAll`, `logRoll`                                                                                       |
| `data/id.js`         | Short 5-character ID generator (still used by `addCondition`) | `createShortId`                                                                                           |
| `scripts/seed.js`    | One-time seeder — reads `data/template-characters.json` and populates PocketBase. Guards against double-seeding. | Run with `node -r dotenv/config scripts/seed.js` |

### Control Panel (`/control-panel/src/`)

The control panel is a **SvelteKit** application. File-based routes live under `routes/`; reusable components and stores live under `lib/`.

#### Routes

Route groups use `(parens)` — they are organizational only and do NOT appear in URLs. Old routes (`/control/`, `/management/`, `/dashboard/`, `/session/`) have been moved to `routes/_deprecated/` (gitignored, reference only).

| Route path          | File                                                    | Purpose                                    |
| ------------------- | ------------------------------------------------------- | ------------------------------------------ |
| `/`                 | `routes/+page.svelte`                                   | Redirects to `/live/characters`            |
| (all routes)        | `routes/+layout.svelte`                                 | App shell: header, sidebar, navigation     |
| `/live/characters`  | `routes/(stage)/live/characters/+page.svelte`           | Character HP / conditions / resources view |
| `/live/dice`        | `routes/(stage)/live/dice/+page.svelte`                 | Dice roller view                           |
| `/live` (shared)    | `routes/(stage)/live/+layout.svelte`                    | PERSONAJES / DADOS bottom nav              |
| `/setup/create`     | `routes/(stage)/setup/create/+page.svelte`              | Character creation form                    |
| `/setup/manage`     | `routes/(stage)/setup/manage/+page.svelte`              | Photo/data editing + bulk controls         |
| `/setup` (shared)   | `routes/(stage)/setup/+layout.svelte`                   | CREAR / GESTIONAR bottom nav               |
| `/overview`         | `routes/(stage)/overview/+page.svelte`                  | Live read-only operator dashboard          |
| `/dm`               | `routes/(cast)/dm/+page.svelte`                         | Initiative tracker + SessionCards          |
| `/players/[id]`     | `routes/(cast)/players/[id]/+page.svelte`               | Player character sheet (mobile-first)      |

#### Library (`lib/`)

| File                              | Purpose                                                          | Key exports / state                                                                                          |
| --------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `lib/socket.js`                   | Socket.io singleton + Svelte stores                              | `socket`, `characters` (writable), `lastRoll` (writable), `SERVER_URL`                                      |
| `lib/stores/overviewStore.js`     | Activity history, pending action queue, role state               | `history`, `pendingActions`, `isSyncing`, `currentRole`, `recordHistory`, `enqueuePending`, `dequeuePending` |
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
   ├── overviewStore.js → logs to activity history
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
   ├── overviewStore.js → logs to activity history
   └── overlay-dice.html → showRoll() → anime.js card + bounce + 4s auto-hide
```

---

## Key Design Decisions

| Decision                                         | Rationale                                                               |
| ------------------------------------------------ | ----------------------------------------------------------------------- |
| In-memory data (no DB)                           | MVP speed — characters reset on restart, fine for demo                  |
| Svelte for overlays                          | Light and Reactive framework, better OBS Browser Source performance          |
| Socket.io over raw WS                            | Auto-reconnect, room support, CDN available for overlay scripts         |
| Svelte 5 runes (`$state`, `$derived`, `$effect`) | Latest Svelte reactivity model, simpler than stores for component state |
| SvelteKit file-based routing                     | Clean URL structure, layout nesting, standard Svelte framework choice   |
| Separate CSS files per component                 | Avoids Svelte scoped style limitations with dynamic classes             |
| anime.js for animations                          | Small library, elastic/spring easing, already used in overlay-dice.html |
| `.env` + `?server=` param for server URL         | No hardcoded IPs — `bun run setup-ip` auto-detects local address        |

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
- SvelteKit control panel with Stage routes (`/live`, `/setup`, `/overview`) and Cast routes (`/dm`, `/players/[id]`)
- Live dashboard view suitable for a TV or second monitor
- Character photo support (URL or base64 data URI, with random fallback from `assets/img/`)
