---
title: Data Flow
type: architecture
source_files:
  - server.ts
  - src/server/router.ts
  - src/server/pb.ts
  - src/server/data/characters.ts
  - src/server/data/rolls.ts
  - src/server/handlers/characters.ts
  - src/server/handlers/rolls.ts
  - src/server/handlers/misc.ts
  - src/server/handlers/overlay.ts
  - src/server/socket/index.ts
  - src/server/socket/rooms.ts
  - control-panel/src/lib/services/pocketbase.ts
  - control-panel/src/lib/services/socket.js
  - control-panel/src/lib/services/socket.svelte.ts
  - control-panel/src/lib/components/overlays/shared/overlaySocket.svelte.ts
  - control-panel/src/routes/(cast)/players/[id]/+layout.server.ts
last_updated: 2026-03-28
---

# Data Flow

Canonical reference for how persisted data, live events, and frontend state move through the system.

The short version:

- **PocketBase is the persistence layer**
- **The Bun server is the runtime orchestrator**
- **Socket.io is the live fan-out channel**
- **Clients mostly listen; Stage writes through REST**

There is no single universal path. The repo currently uses **three distinct paths**:

1. **SSR / direct PocketBase reads** for some Cast pages
2. **REST → PocketBase → Socket.io broadcast** for authoritative live mutations
3. **Socket.io subscription** for live replication into Stage and overlay UIs

---

## System Model

```text
PocketBase (:8090, SQLite)
  ↑ persisted reads/writes
  │
  │
Bun server (:3000)
  - Express REST API
  - PocketBase admin-auth singleton
  - Socket.io server
  - in-memory scene/encounter state
  │
  ├─ REST responses to Stage / operator clients
  └─ Socket.io broadcasts to all connected clients
       │
       ├─ Stage store: control-panel/src/lib/services/socket.js
       ├─ Typed client socket: control-panel/src/lib/services/socket.svelte.ts
       └─ Overlay socket helper: control-panel/src/lib/components/overlays/shared/overlaySocket.svelte.ts
```

Important current boundary:

- **Clients do not currently send mutation events over Socket.io.**
- `src/server/socket/events/*.ts` are Phase 2 stubs only.
- Real writes happen via **HTTP handlers** in `src/server/handlers/`.

---

## Authority Rules

### Persisted authority

`PocketBase` stores the durable record for:

- characters
- rolls
- portrait/file references
- resources and conditions inside character records

If the server restarts, this is the source that survives.

### Runtime authority

The Bun server owns:

- who gets the initial snapshot on connect
- which live event is emitted after a mutation
- in-memory `scene` state
- in-memory `encounter` state
- sidecar logging in `logs/sidecar.jsonl`

### UI authority

Clients own only local presentation state:

- selection mode
- animation state
- expanded/collapsed UI
- temporary view-only derivations

They should not be treated as canonical for game state.

---

## Path A: SSR / Direct PocketBase Read

This path is used for Cast player pages that render stable data on navigation.

Current example:

- [control-panel/src/routes/(cast)/players/[id]/+layout.server.ts](../control-panel/src/routes/(cast)/players/%5Bid%5D/+layout.server.ts)

Flow:

```text
Browser requests /players/[id]
  ↓
SvelteKit server load (+layout.server.ts)
  ↓
getCharacter(id)
  control-panel/src/lib/services/character.ts
  ↓
getCharacterRecord(id)
  control-panel/src/lib/services/pocketbase.ts
  ↓
pb.collection('characters').getOne(id)
  ↓
PocketBase returns CharacterRecord
  ↓
SvelteKit passes { character } into route tree
```

### Why this bypasses the Bun server

SvelteKit SSR is already running on the server side, so it can talk to PocketBase directly.

That means:

- this path does **not** go through `src/server/router.ts`
- this path does **not** emit Socket.io
- this path is for **initial/stable render**, not live orchestration

### PocketBase URL behavior

`control-panel/src/lib/services/pocketbase.ts` switches URLs based on environment:

- SSR uses `http://127.0.0.1:8090`
- browser uses `VITE_POCKETBASE_URL` unless localhost override logic kicks in

This is an important detail because the LAN IP is correct for browsers but not always for the local Node SSR process.

---

## Path B: Initial Socket Hydration

Every live client starts with a socket connection snapshot.

Server entry:

- [server.ts](../server.ts)
- [src/server/socket/index.ts](../src/server/socket/index.ts)

Flow:

```text
server.ts
  ↓
connectToPocketBase()
  src/server/pb.ts
  ↓
initSocket(io)
  src/server/socket/index.ts

On each new socket connection:
  ↓
ensureAuth()
  ↓
characterModule.getAll(pb)
  src/server/data/characters.ts
  ↓
socket.emit('initialData', {
  characters,
  encounter,
  scene,
  focusedChar
})
```

### What `initialData` contains today

Current shape from `src/server/socket/index.ts`:

```ts
{
  characters,
  encounter,
  scene,
  focusedChar
}
```

In the error fallback path, the server also emits `rolls: []`, but successful hydration currently does not include rolls there.

### Who consumes `initialData`

1. `control-panel/src/lib/services/socket.js`
   - populates the Stage `characters` store

2. `control-panel/src/lib/components/overlays/shared/overlaySocket.svelte.ts`
   - seeds overlay-local `characters`
   - builds an in-memory `charMap`

This is the reconnect safety net for live surfaces.

---

## Path C: Authoritative Mutation Flow

This is the most important live path in the repo.

The pattern is:

```text
Client action
  ↓
fetch() to Bun REST API
  ↓
Express handler validates request
  ↓
data module writes to PocketBase
  ↓
handler calls broadcast(...)
  ↓
Socket.io emits to all connected clients
  ↓
client stores/helpers update local reactive state
```

### Example: HP update

Client example:

- Stage characters page calls `fetch(`${SERVER_URL}/api/characters/${id}/hp`, { method: 'PUT' ... })`

Server flow:

```text
PUT /api/characters/:id/hp
  ↓
src/server/handlers/characters.ts:updateHp
  ↓
characterModule.updateHp(pb, charId, hp_current)
  src/server/data/characters.ts
  ↓
findById(pb, id)
  ↓
clamp hp_current between 0 and hp_max
  ↓
pb.collection('characters').update(id, { hp_current: clamped })
  ↓
broadcast('hp_updated', { character, hp_current })
  src/server/socket/rooms.ts
  ↓
io.emit('hp_updated', payload)
```

Client replication:

- `control-panel/src/lib/services/socket.js`
  replaces the matching character in the Stage store
- `control-panel/src/lib/derived/overviewStore.js`
  logs the event to history
- overlay components listening for `hp_updated`
  update their own reactive state

### Example: condition add

```text
POST /api/characters/:id/conditions
  ↓
handlers/characters.ts:addCondition
  ↓
data/characters.ts:addCondition
  ↓
PocketBase character update
  ↓
broadcast('condition_added', { charId, condition })
```

### Example: resource update

```text
PUT /api/characters/:id/resources/:rid
  ↓
handlers/characters.ts:updateResource
  ↓
data/characters.ts:updateResource
  ↓
PocketBase character update
  ↓
broadcast('resource_updated', { charId, resource })
```

### Example: rest

```text
POST /api/characters/:id/rest
  ↓
handlers/characters.ts:restoreResources
  ↓
data/characters.ts:restoreResources
  ↓
PocketBase character update
  ↓
broadcast('rest_taken', { charId, type, restored, character })
```

### Example: dice roll

```text
POST /api/rolls
  ↓
handlers/rolls.ts:logRoll
  ↓
characterModule.getCharacterName(pb, charId)
  ↓
rollsModule.logRoll(pb, payload)
  src/server/data/rolls.ts
  ↓
PocketBase create in rolls collection
  ↓
broadcast('dice_rolled', rollRecord)
```

### Example: non-PocketBase live events

Not every broadcast is backed by PocketBase writes.

These handlers mostly emit runtime events only:

- `src/server/handlers/overlay.ts`
  - `announce`
  - `level_up`
  - `player_down`
  - `lower_third`
- `src/server/handlers/misc.ts`
  - `sync_start`
  - `scene_changed`
  - `character_focused`
  - `character_unfocused`

For these events, the server is the authority and PocketBase may not be involved at all.

---

## The Broadcast Hub

All server fan-out goes through:

- [src/server/socket/rooms.ts](../src/server/socket/rooms.ts)

Current behavior:

```ts
export function broadcast(event, data = {}) {
  _io.emit(event, data);
  logEvent(event, summary);
}
```

What this means today:

- broadcasts are **global**, not room-scoped
- every connected client receives the event
- every broadcast is mirrored into `logs/sidecar.jsonl`

Room-aware delivery is planned, but not implemented yet.

---

## Client Consumption Paths

The repo currently has more than one client-side socket consumer.

### 1. Legacy Stage store

File:

- [control-panel/src/lib/services/socket.js](../control-panel/src/lib/services/socket.js)

Used by Stage pages and related components.

Behavior:

- owns singleton `socket`
- owns writable `characters` store
- owns writable `lastRoll` store
- listens for:
  - `initialData`
  - `hp_updated`
  - `character_created`
  - `character_updated`
  - `condition_added`
  - `condition_removed`
  - `resource_updated`
  - `rest_taken`
  - `character_deleted`
  - `dice_rolled`

This is the main live replication path for Stage.

### 2. Overlay socket helper

File:

- [control-panel/src/lib/components/overlays/shared/overlaySocket.svelte.ts](../control-panel/src/lib/components/overlays/shared/overlaySocket.svelte.ts)

Behavior:

- creates a socket per overlay bootstrap
- listens to `initialData`, `character_updated`, `hp_updated`
- exposes:
  - `socket`
  - `characters`
  - `getChar(id)`

This path is intentionally listen-only.

### 3. Typed socket client

File:

- [control-panel/src/lib/services/socket.svelte.ts](../control-panel/src/lib/services/socket.svelte.ts)

Status:

- exists as the typed/client abstraction
- supports `connectSocket`, `subscribe`, `emit`
- uses `EventPayloadMap` from `contracts/events.ts`

Important caveat:

- the wire format emitted by the server is currently **snake_case**
- `contracts/events.ts` still describes mostly **camelCase / forward-looking** event names

Treat `socket.svelte.ts` as infrastructure in progress, not the exact source of truth for current wire events.

---

## PocketBase-Specific Notes

### Server-side PocketBase singleton

File:

- [src/server/pb.ts](../src/server/pb.ts)

Key behaviors:

- authenticates as PocketBase superuser on boot
- refreshes auth periodically
- calls `pb.autoCancellation(false)`

That last setting is important because concurrent server requests and socket hydration should not cancel each other.

### Data modules own business logic

Files:

- `src/server/data/characters.ts`
- `src/server/data/rolls.ts`

These modules are intentionally thin but still own important rules:

- HP clamping
- resource clamping
- rest restoration behavior
- condition ID creation
- record lookup / null handling

Handlers should validate request shape and choose status codes.
Data modules should own persistence behavior and write rules.

---

## Current Realities and Exceptions

### No incoming socket mutations yet

Files in `src/server/socket/events/` are stubs.

So although the project uses Socket.io heavily, it is currently being used for:

- connection hydration
- server-to-client replication
- server-to-client moment/show events

It is **not** currently used for:

- client-originated authoritative writes
- room/session-scoped command routing

### PocketBase realtime is not used

PocketBase has its own realtime subscription mechanism, but this repo does not rely on it for live UI replication.

Live updates come from:

```text
REST write
  → PocketBase persistence
  → server broadcast
  → Socket.io listeners
```

### Some frontend code still talks to PocketBase directly

The repo has both:

- **server-mediated authoritative writes** via REST
- **direct PocketBase reads/writes** in frontend service modules

For documentation and architecture reasoning, treat the REST path as the canonical live gameplay mutation path, and direct PocketBase usage as a separate service capability that is not the main realtime orchestration path.

### Cast player sheet is currently baseline-first

The Cast player route loads from PocketBase through SvelteKit server load first.
Its live socket overlay path is still partial / planned compared with Stage and Audience.

---

## Practical Debugging Map

If data looks wrong, check the system in this order:

1. **PocketBase record wrong**
   - inspect `characters` / `rolls` collections
   - inspect `src/server/data/*.ts`

2. **REST mutation succeeds but clients do not update**
   - inspect handler in `src/server/handlers/*.ts`
   - confirm it calls `broadcast(...)`

3. **Broadcast emitted but one surface stays stale**
   - inspect the relevant client listener:
     - `socket.js`
     - `overlaySocket.svelte.ts`
     - route/component-local listener

4. **Reconnect gives empty state**
   - inspect `src/server/socket/index.ts`
   - inspect `ensureAuth()` in `src/server/pb.ts`

5. **Types look correct but runtime events do not match**
   - check `docs/SOCKET-EVENTS.md`
   - do not assume `contracts/events.ts` matches current snake_case wire names

---

## References

- [docs/ARCHITECTURE.md](./ARCHITECTURE.md)
- [docs/SOCKET-EVENTS.md](./SOCKET-EVENTS.md)
- [docs/SERVER-VS-FRONTEND.md](./SERVER-VS-FRONTEND.md)
- [server.ts](../server.ts)
- [src/server/socket/rooms.ts](../src/server/socket/rooms.ts)
- [control-panel/src/lib/services/pocketbase.ts](../control-panel/src/lib/services/pocketbase.ts)
- [control-panel/src/lib/services/socket.js](../control-panel/src/lib/services/socket.js)
