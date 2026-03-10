## What is authoritative state?

In any multi-surface system, some piece of code is the single source of truth for a given value. That piece of code is called the **authority**.

When a value has a clear authority, every consumer knows where to get the real version — and knows not to invent its own. When there is no clear authority, surfaces drift out of sync: an overlay shows one HP value, the control panel shows another, the database holds a third.

## Why UI must not invent truth

A component that derives HP from local counters is not reacting to state — it is _inventing_ state. If the server later says the HP is different, the component is now wrong. The longer a surface holds an invented truth, the more it diverges from the authoritative source.

The rule is simple: **producers write, consumers react**. A component that displays a value should derive it from an upstream authority, not maintain it independently.

## Producers and consumers

Every value in the system has a lineage:

| Role | What it does | Example in OVERLAYS |
|------|-------------|---------------------|
| Authority / producer | Owns the value; writes the canonical version | `server.js` + PocketBase |
| Broadcaster | Distributes updates to all consumers | `io.emit()` in `server.js` |
| Consumer | Reads updates and reacts | `socket.js` store → components, overlays |

The key rule: **a consumer must never hold a competing version of the value it consumes**. It can derive from it, display it, or trigger a write back to the producer — but it cannot maintain its own copy in parallel.

## How update flow differs from local state

Local component state — a panel toggle, a hover flag — is owned entirely by the component. No other surface needs to know. The component is its own authority.

Authoritative state flows in one direction, from producer to all consumers, and that flow is explicit:

```
PocketBase (persisted authority)  →  server.js (runtime authority)
  → io.emit() (broadcast)         →  socket.js store (shared client replica)
      → Svelte components (render)
      → Overlays (passive render)
```

Any deviation from this path — a component that modifies the store directly, an overlay that fetches its own data — breaks the authority chain.

## How this applies in OVERLAYS today

**`server.js` is the runtime authority.** It is the only service that writes to PocketBase via `data/characters.js`. After a write, it broadcasts the updated value to every connected client via `io.emit()`.

**The stage surface writes, then reacts.** When an operator changes HP, the component sends a REST request to `server.js`. The server writes to PocketBase, then emits `hp_updated`. The component does not optimistically update local state — it waits for the broadcast, which updates the shared store, which re-renders all subscribed components.

**Overlays are pure consumers.** They never send requests. They listen for socket events and update their DOM. Because they hold no competing state, they cannot diverge.

**`socket.js` stores are client-side replicas**, not authorities. They hold a synchronized copy of what the server last broadcast. Components read from the store, but the store does not own the truth — the server does.

## Common mistakes

- **Optimistic local updates without reconciliation** — updating a local counter on click, then ignoring the server broadcast. If the server rejects the write, the UI is now wrong.
- **Fetching inside an overlay** — an overlay that polls an API endpoint has its own update cycle, independent of the broadcast. It can fall out of sync during high-activity moments.
- **Treating the shared store as the authority** — writing to `$characters` directly from a component and expecting it to persist. The store is a read replica; changes not originating from a broadcast will be overwritten on the next event.
- **Multiple components maintaining the same derived value** — if two components both compute "is this character at critical HP?", they may compute differently. Derive it once, in one place.

## Commonly confused with

**Local component state** — local state (a collapsed panel, a form field value) is correct for things the server does not need to know about. The distinction is whether other surfaces need the value. If they do, it belongs upstream.

**The Socket.io broadcast mechanism** — the transport is one implementation of authoritative state flow. The concept applies regardless of whether the transport is Socket.io, SSE, polling, or a reactive database. The principle is producer/consumer clarity, not the specific technology.
