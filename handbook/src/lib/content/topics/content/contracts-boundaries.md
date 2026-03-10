## What is a contract?

A contract is the agreed-upon shape of data passed between two parts of a system. When both sides agree, they can evolve independently without breaking each other.

In TypeScript, interfaces and type aliases _are_ contracts:

```typescript
// This is a contract between server.js and all clients
type HpUpdatedPayload = {
  id: string;
  hp: number;
};

// server.js emits it:
io.emit('hp_updated', { id, hp });

// socket.js consumes it:
socket.on('hp_updated', (data: HpUpdatedPayload) => { ... });
```

## Why boundaries matter

Without clear boundaries, every layer becomes aware of every other layer. A change in PocketBase's field names cascades into component templates. OVERLAYS avoids this with clear handoff points:

```
PocketBase  →  data/characters.js  →  server.js  →  Socket.io  →  socket.js store  →  Svelte components
```

Each arrow is a boundary. `data/characters.js` owns the PocketBase shape. Components never query PocketBase directly.

## Separation of concerns in OVERLAYS

| Layer | Responsibility |
|-------|----------------|
| `data/characters.js` | PocketBase CRUD; translate DB → domain objects |
| `server.js` | Orchestrate actions; broadcast socket events |
| `socket.js` | Maintain shared client state; emit from store |
| Svelte components | Render state; fire user-triggered actions |
| Overlays (audience/) | Passive rendering only — never write |

## The overlay rule

Overlays are a hard boundary: they **only receive** socket events. They never send REST requests or emit socket messages. This keeps them simple, composable, and crash-safe during live sessions.
