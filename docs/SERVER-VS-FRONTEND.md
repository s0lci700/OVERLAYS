---
title: Server vs Frontend — Layer Reference
type: architecture
source_files: [src/server/, control-panel/src/lib/services/]
last_updated: 2026-03-26
---

# Server vs Frontend — Layer Reference

> Quick answer: `src/server/` is backend code that runs in Bun. `control-panel/src/lib/` is frontend code that runs in the browser. They never import each other. They talk over the network.

---

## The mental model

```
┌─────────────────────────────────────────────────────────────────────┐
│  BUN PROCESS  (server.ts → :3000)                                   │
│                                                                     │
│  src/server/                                                        │
│  ├── data/characters.ts   ← PocketBase SDK (direct DB access)      │
│  ├── data/rolls.ts        ← PocketBase SDK (direct DB access)      │
│  ├── data/id.ts           ← ID generator                           │
│  ├── handlers/            ← Express route handlers (REST API)      │
│  ├── router.ts            ← mounts all 20 routes                   │
│  ├── socket/              ← Socket.io event setup                  │
│  ├── state/               ← in-memory encounter + scene state      │
│  ├── pb.ts                ← PocketBase singleton (admin auth)      │
│  └── seed.ts              ← seeds DB on startup                    │
│                                                                     │
└───────────────────────────┬─────────────────────────────────────────┘
                            │  REST (HTTP)  +  Socket.io (WebSocket)
                            │  network boundary — nothing crosses this
                            │  except JSON payloads
┌───────────────────────────▼─────────────────────────────────────────┐
│  BROWSER  (SvelteKit → :5173)                                       │
│                                                                     │
│  control-panel/src/lib/                                             │
│  ├── services/pocketbase.ts  ← PocketBase HTTP client (browser)    │
│  ├── services/character.ts   ← facade: fetch + socket subscribe    │
│  ├── services/socket.ts      ← Socket.io client (typed)            │
│  ├── services/errors.ts      ← ServiceError class                  │
│  ├── contracts/              ← TypeScript types only (no runtime)  │
│  ├── components/             ← Svelte UI components                │
│  ├── mocks/                  ← fixture data for Storybook          │
│  └── stores/                 ← Svelte stores                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Why both sides have similar function names

This is the confusing part. Both `src/server/data/characters.ts` and
`control-panel/src/lib/services/pocketbase.ts` export functions like
`addCondition`, `updateResource`, `getAll`. They look the same but do
completely different things:

| Function | In `src/server/data/characters.ts` | In `control-panel/src/lib/services/pocketbase.ts` |
|---|---|---|
| `addCondition(...)` | Calls `pb.collection('characters').update(...)` via **PocketBase Node.js SDK** — direct DB write | Calls `pb.collection('characters').update(...)` via **PocketBase browser SDK** — HTTP request to PocketBase |
| `updateResource(...)` | Direct SDK call, runs server-side | HTTP call, runs in browser |
| Receives | `pb: PocketBase` as first arg (admin-authed singleton) | Nothing — uses the shared `pb` singleton initialized from `VITE_POCKETBASE_URL` |
| Auth context | Admin token (full access) | Unauthenticated or user token |
| Called by | Express route handlers | Svelte components / SvelteKit load functions |

---

## Who calls what

### Server side — request → response chain

```
HTTP request arrives at :3000
  → src/server/router.ts            (which route is this?)
  → src/server/handlers/characters.ts  (validate, parse body)
  → src/server/data/characters.ts   (read/write PocketBase via SDK)
  → PocketBase :8090                (SQLite write)
  → broadcast() via socket/rooms.ts (emit to ALL clients)
  → HTTP response back to caller
```

### Frontend side — user action chain

```
User taps a button in a Svelte component
  → control-panel/src/lib/services/character.ts   (facade)
  → control-panel/src/lib/services/pocketbase.ts  (PB browser client)
  → PocketBase :8090 directly (HTTP)
  OR
  → fetch() to Express :3000 (REST API)
  → server handles it, broadcasts via socket
  → control-panel/src/lib/services/socket.ts      (receives broadcast)
  → Svelte store / $state updates
  → UI re-renders
```

---

## Which side to edit for each task

| Task | Edit here |
|---|---|
| Change what data is stored in PocketBase | `src/server/data/characters.ts` + `control-panel/src/lib/contracts/records.ts` |
| Add a new REST endpoint | `src/server/router.ts` + `src/server/handlers/` |
| Change what a Svelte component displays | `control-panel/src/lib/components/` |
| Change how the browser fetches data | `control-panel/src/lib/services/pocketbase.ts` or `character.ts` |
| Add a new Socket.io event | `src/server/socket/` + `control-panel/src/lib/services/socket.ts` + `control-panel/src/lib/contracts/events.ts` |
| Add a new TypeScript type/shape | `control-panel/src/lib/contracts/records.ts` (imported by both sides) |

---

## The one thing shared across the boundary

`control-panel/src/lib/contracts/records.ts` defines `CharacterRecord`,
`ResourceSlot`, `Condition`, etc. These are **TypeScript types only** —
no runtime code, just shapes. The server side has the same shapes
implicitly through PocketBase SDK responses; the browser side imports
them explicitly for type safety.

Neither process imports the other's code.

---

## Current consumption status (as of Phase 1)

| Module | Status |
|---|---|
| `src/server/data/characters.ts` | ✅ Active — called by all character handlers |
| `src/server/data/rolls.ts` | ✅ Active — called by rolls handler |
| `control-panel/src/lib/services/pocketbase.ts` | ✅ Active — pb singleton + all service functions exist |
| `control-panel/src/lib/services/character.ts:getCharacter` | ⚠️ Wired but unconsumed — no route calls it yet (TASK-1.2) |
| `control-panel/src/lib/services/socket.ts` | ✅ Active — used by overlay routes |
