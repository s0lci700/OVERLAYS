# Architecture Guide

> Quick-reference map for navigating the DADOS & RISAS codebase.
> Branch: `feat/design-esdh` (ESDH brand redesign)

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

| File | Purpose | Key exports |
|---|---|---|
| `server.js` | Express app, Socket.io server, all API routes | Listens on `:3000` |
| `data/characters.js` | Character fixtures + CRUD (HP, conditions, resources, rest) | `getAll`, `findById`, `updateHp`, `addCondition`, `removeCondition`, `updateResource`, `restoreResources` |
| `data/rolls.js` | Roll history logger | `getAll`, `logRoll` |
| `data/resources.js` | **Unused** — standalone resource pool experiment | `getActive`, `forCharacter` |
| `data/state.js` | **Unused** — snapshot aggregator re-exporting all data modules | `getSnapshot` |

### Control Panel (`/control-panel/src/`)

| File | Purpose | Key exports / state |
|---|---|---|
| `main.js` | Svelte mount point | — |
| `app.css` | Design tokens, CSS reset, shared bases, app shell layout | CSS custom properties |
| `App.svelte` | Root component: header, tab navigation, content routing | `activeTab`, `connected` |
| `lib/socket.js` | Socket.io singleton + Svelte stores | `socket`, `characters` (writable), `lastRoll` (writable), `serverPort` |
| `lib/dashboardStore.js` | Activity history, pending action queue, role state | `history`, `pendingActions`, `isSyncing`, `currentRole`, `recordHistory`, `enqueuePending`, `dequeuePending` |
| `lib/CharacterCard.svelte` | Per-character card: HP, conditions, resources, rest, damage/heal | Props: `character` |
| `lib/CharacterCard.css` | Card styles: HP bar, pips, conditions, stepper | — |
| `lib/DiceRoller.svelte` | Dice roller: character selector, modifier, d4–d20 grid | `selectedCharId`, `modifier` |
| `lib/DiceRoller.css` | Dice grid, result card, crit/fail states | — |

### OBS Overlays (`/public/`)

| File | Purpose |
|---|---|
| `overlay-hp.html` | HP bars overlay — positioned top-right, color-coded health states |
| `overlay-hp.css` | HP overlay styles: gradients, pulse animation, status banner |
| `overlay-dice.html` | Dice roll popup — bottom-center, anime.js bounce, auto-hide 4s |
| `overlay-dice.css` | Dice card styles: crit/fail states, result number |

### Documentation (`/docs/`)

| File | Purpose |
|---|---|
| `ARCHITECTURE.md` | This file — codebase navigation |
| `SOCKET-EVENTS.md` | Complete Socket.io event reference with payloads |
| `DESIGN-SYSTEM.md` | CSS tokens, typography, component style guide |

### Project Management (root)

| File | Purpose |
|---|---|
| `README.md` | Setup guide, API reference, demo script |
| `CLAUDE.md` | LLM project context (architecture, conventions, running instructions) |
| `TODO.md` | Day-by-day task checklist |
| `PROGRESS.md` | Development log with technical details |
| `TRACKER.md` | One-page status for teammates |
| `CONTEXTO_COMPLETO_PITCH.md` | Full pitch strategy context (Spanish) |
| `DAY2_COMPLETION_REPORT.md` | Day 2 completion summary |
| `control-panel/CONTROL-STATE-PLAN.md` | Transaction manager design plan (not yet implemented) |

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

| Decision | Rationale |
|---|---|
| In-memory data (no DB) | MVP speed — characters reset on restart, fine for demo |
| Vanilla JS for overlays | Lighter than frameworks, better OBS Browser Source performance |
| Socket.io over raw WS | Auto-reconnect, room support, CDN available for overlay scripts |
| Svelte 5 runes (`$state`, `$derived`, `$effect`) | Latest Svelte reactivity model, simpler than stores for component state |
| Separate CSS files per component | Avoids Svelte scoped style limitations with dynamic classes |
| anime.js for animations | Small library, elastic/spring easing, already used in overlay-dice.html |
| Hardcoded server IP | Demo-only — documented in README, must update per machine |

---

## Hardcoded IP Locations

The server IP `192.168.1.83` appears in these files — update all when switching machines:

1. `server.js` — `const serverPort` and `const controlPanelPort`
2. `control-panel/src/lib/socket.js` — `const serverPort` and `const controlPanelPort`
3. `public/overlay-hp.html` — `const socket = io("http://...")`
4. `public/overlay-dice.html` — `const socket = io("http://...")`

---

## Branch Context

The `feat/design-esdh` branch extends the MVP (main) with:

- ESDH brand aesthetic (dark theme, Bebas Neue + JetBrains Mono + Dancing Script)
- Condition management (add/remove status effects via API + Socket.io)
- Resource pool system (pip-based UI, short/long rest restoration)
- Dashboard store (activity history, pending actions, role state)
- Separated CSS files per component
- Comprehensive JSDoc documentation throughout
