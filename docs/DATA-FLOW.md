---
title: Data Flow
type: architecture
source_files:
  - server.ts
  - src/server/data/characters.ts
  - src/server/handlers/characters.ts
  - src/server/socket/index.ts
  - src/server/socket/rooms.ts
  - src/server/pb.ts
  - control-panel/src/lib/services/pocketbase.ts
  - control-panel/src/lib/services/character.ts
  - control-panel/src/lib/services/socket.ts
last_updated: 2026-03-27
---

# Data Flow

How data moves from PocketBase through the server and into every connected client.

There are **two paths**: SSR (page load) and live Socket.io (ongoing state). Most UI runs on the live path.

---

## Cluster map (from GitNexus)

| Cluster | Symbols | Cohesion | Location |
|---|---|---|---|
| `Data` | 14 | 87% | `src/server/data/` |
| `Handlers` | 29 | 82% | `src/server/handlers/` |
| `Server` | 16 | 61% | `src/server/socket/`, `src/server/pb.ts` |
| `Services` | 51 | 80% | `control-panel/src/lib/services/` |
| `Components` | 42 | 87% | `control-panel/src/lib/components/` |

---

## Path 1 — SSR (page navigation)

Used by `(cast)/players/[id]` and any route with a `+layout.server.ts` or `+page.server.ts`.
The Node.js SSR process talks directly to PocketBase — **not** through the Express server.

```
Browser navigates to /players/[id]
  │
  ▼  (SvelteKit SSR, Node.js process)
+layout.server.ts
  → getCharacter(id)                      control-panel/src/lib/services/character.ts
    → getCharacterRecord(id)              control-panel/src/lib/services/pocketbase.ts:91
      → assertNonEmptyString(id)          validates ID is non-empty
      → pb.collection('characters')
           .getOne(id)                    → PocketBase :8090 (127.0.0.1 — never LAN IP)
      ← CharacterRecord
      on error → mapPocketBaseError()     pocketbase.ts:20  ← PB error → ServiceError
    ← CharacterRecord | throws ServiceError
  ← on ServiceError(NOT_FOUND) → throw error(404)   ← ServiceError → HttpError boundary
  ← on ServiceError(other)     → throw error(500)
← { character } passed to +page.svelte as load data
```

**Why `127.0.0.1` and not the LAN IP?**
`VITE_POCKETBASE_URL` is set to the LAN IP by `bun run setup-ip` — correct for browsers,
but unreachable from the Node.js server process. `pocketbase.ts` detects `import.meta.env.SSR`
and substitutes `http://127.0.0.1:8090` for server-side calls.

**Error translation chain:**
```
PocketBase SDK error (ClientResponseError)
  → mapPocketBaseError()     → ServiceError  (pocketbase.ts)
  → getCharacter()           → HttpError     (character.ts — the conversion boundary)
  → +layout.server.ts        → isHttpError() guards; 404 → redirect to /players
```
`instanceof ServiceError` checks in load functions are always dead code — `getCharacter()`
converts them to `HttpError` before they propagate.

---

## Path 2 — Live state (Socket.io)

Used by Stage, Cast/DM, Cast/Players, Commons, and all Audience overlays.
Data arrives via `initialData` on connect, then updates arrive as discrete events.

### Server startup

```
server.ts → main()
  → connectToPocketBase()               src/server/pb.ts
  → seedIfEmpty()
  → initSocket(io)                      src/server/socket/index.ts:17
      → initRooms(io)                   src/server/socket/rooms.ts
      → registerSessionEvents(socket)   src/server/socket/events/session.ts
      → registerCharacterEvents(socket) src/server/socket/events/character.ts
      → registerCombatEvents(socket)    src/server/socket/events/combat.ts
```

### On every new socket connection

```
io.on('connection', socket)             src/server/socket/index.ts
  → ensureAuth()                        ← verifies PocketBase token is still valid
  → characterModule.getAll(pb)          src/server/data/characters.ts:18
      → pb.collection('characters').getList()  → PocketBase
  → socket.emit('initialData', {
        characters,                     ← full roster at connection time
        encounter,                      ← getEncounterState()
        scene,                          ← getSceneState()
        focusedChar                     ← getFocusedChar()
    })
```

### On a write operation (example: HP update)

```
Stage UI
  → PATCH /api/characters/:id/hp        (REST to Express :3000)
      ↓
  updateHp handler                      src/server/handlers/characters.ts:65
    → validate req.body.hp_current
    → characterModule.updateHp(pb, id, val)
        → findById(pb, id)              src/server/data/characters.ts
        → clamp(hp_current, 0, hp_max)  ← business logic lives in data layer
        → pb.collection('characters').update(id, { hp_current: clamped })
        ← CharacterRecord
    → broadcast('hp_updated', { character, hp_current })
        → logEvent(event, payload)      src/server/socket/rooms.ts:30 ← JSONL sidecar log
        → io.emit(event, payload)       ← pushes to ALL connected sockets
    ← HTTP 200 { character }            back to the calling client (Stage only)
```

**`broadcast` at `rooms.ts:41` is the single emit point for the entire system.**
GitNexus found 21 incoming callers — every handler that mutates state routes through it:

| Handler category | Events emitted |
|---|---|
| Characters | `character_created`, `hp_updated`, `character_updated`, `condition_added`, `condition_removed`, `character_deleted`, `resource_updated`, `rest_taken` |
| Encounter | `encounter_started`, `turn_advanced`, `encounter_ended` |
| Overlay triggers | `announce`, `level_up`, `player_down`, `lower_third` |
| Scene / misc | `scene_changed`, `character_focused`, `sync_start` |
| Rolls | `dice_rolled` |

### Client receives the broadcast

```
socket.ts singleton (Stage / Cast routes)
  socket.on('initialData')    → writes full character array to $characters store
  socket.on('hp_updated')     → finds character by id, mutates hp_current in place
  socket.on('condition_added')→ pushes to character.conditions array
  ...

Svelte components
  {#each $characters as character} → rerenders automatically on any store mutation
```

Overlay routes use a **separate** `overlaySocket.svelte.ts` singleton
(`control-panel/src/lib/components/overlays/shared/`). It connects to the same
server and receives the same broadcasts, but **never emits anything**. This is enforced
by the architecture — overlays have no write paths at all.

---

## Key boundaries

| Boundary | File | What crosses it |
|---|---|---|
| PB SDK → ServiceError | `pocketbase.ts:mapPocketBaseError` | Every client-side PB call |
| ServiceError → HttpError | `character.ts:getCharacter` | SSR load functions |
| REST → Socket.io | `rooms.ts:broadcast` | Every server-side write |
| SSR URL vs browser URL | `pocketbase.ts:getPocketBaseURL` | `import.meta.env.SSR` check |
| Write surface vs listen-only | Socket singleton split | Stage/Cast write; Audience/Commons never do |

---

## What static analysis cannot see

GitNexus traces static call edges. Two things are invisible to it:

1. **Socket event listeners** — `socket.on('hp_updated', handler)` is a runtime string match.
   The graph shows `broadcast` emitting but cannot trace what receives it on the client.
2. **PocketBase realtime** — PB has a built-in realtime subscription API. This project does
   **not** use it. All live updates come from the Socket.io broadcast after a REST write, not
   from PocketBase pushing changes.

---

## References

- `docs/SOCKET-EVENTS.md` — complete payload shapes for every Socket.io event
- `docs/API.md` — all REST endpoints
- `docs/ARCHITECTURE.md` — system overview and surface map
- `src/server/socket/rooms.ts` — `broadcast()` implementation
- `control-panel/src/lib/services/pocketbase.ts` — SSR URL logic and error translation
