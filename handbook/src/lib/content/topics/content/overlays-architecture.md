## The three surfaces

OVERLAYS has three distinct surfaces, each with a different role:

**Stage (operator-facing)** — `/live/characters`, `/live/dice`, `/setup/*`
The main write authority. Operators manage HP, conditions, dice rolls, and character data. Every user action goes: component → REST fetch → server.js → PocketBase → socket broadcast → all clients update.

**Cast (DM & player-facing)** — `/dm`, `/players/[id]`
Read-heavy with some writes (initiative, session cards). Composed from shared and feature components.

**Audience (overlays)** — `/persistent/*`, `/moments/*`, `/show/*`
Passive. Rendered in OBS browser sources at 1920×1080. Receive socket events only — never send requests.

## Data flow

```
User action (component)
  → REST fetch to server.js
  → PocketBase update (via data/characters.js)
  → io.emit() broadcast to ALL clients
  → socket.js store update ($characters, $lastRoll)
  → Svelte reactivity re-renders all subscribed components
  → Overlays also receive the event and update their DOM
```

## Socket.io as the broadcast bus

Every state change goes through Socket.io. This means overlays, the control panel, and any connected device all stay in sync without polling.

```javascript
// server.js — single broadcast, all clients update
io.emit('hp_updated', { id, hp, maxHp });
```

## PocketBase as persistent state

PocketBase (SQLite under the hood) is the source of truth. On each new Socket.io connection, the server sends `initialData` — the full character roster and recent rolls fetched live from PocketBase.

## Key files to read first

| File | Why |
|------|-----|
| `server.js` | All Express routes and Socket.io event handlers |
| `data/characters.js` | PocketBase CRUD wrappers |
| `control-panel/src/lib/stores/socket.js` | Shared client state |
| `control-panel/src/routes/(stage)/live/characters/` | Main operator surface |
