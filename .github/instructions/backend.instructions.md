---
applyTo: 'server.js,data/**,scripts/**'
---

# Backend Conventions — TableRelay Server

Rules for `server.js`, the `data/` PocketBase wrappers, and `scripts/`.

---

## PocketBase data layer

- All functions in `data/characters.js` and `data/rolls.js` take `pb` as their **first argument** and are `async`. Always `await` them.
- `pb.collection().getOne()` **throws** a `ClientResponseError` on 404 — it does not return `null`. Guard with `try/catch`, not `if (!result)`.
- The `pb` instance is authenticated as superuser on startup via `connectToPocketBase()` in `server.js`. Never re-authenticate inside individual route handlers.

```js
// ✅ Correct — pass pb, use try/catch for 404
async function getById(pb, id) {
  try {
    return await pb.collection('characters').getOne(id);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

// ❌ Wrong — no pb arg, no 404 guard
async function getById(id) {
  const result = await globalPb.collection('characters').getOne(id);
  if (!result) return null; // never reached on 404, throws instead
  return result;
}
```

### Available `data/characters.js` exports

| Function              | Signature                                          | Notes                                    |
| --------------------- | -------------------------------------------------- | ---------------------------------------- |
| `getAll(pb)`          | `async (pb) => Character[]`                        | Returns full roster                      |
| `findById(pb, id)`    | `async (pb, id) => Character \| null`              | Returns null if not found                |
| `createCharacter(pb, data)` | `async (pb, data) => Character`              | Creates and returns new record           |
| `updateCharacterData(pb, id, data)` | `async (pb, id, data) => Character`    | Partial field update                     |
| `updateHp(pb, id, delta)` | `async (pb, id, delta) => Character`           | Clamps HP to [0, hp_max]                 |
| `updatePhoto(pb, id, photoPath)` | `async (pb, id, photoPath) => Character` | URL or base64 data URI                   |
| `addCondition(pb, id, condition)` | `async (pb, id, condition) => Condition` | `createShortId()` for condition IDs      |
| `removeCondition(pb, id, conditionId)` | `async (pb, id, conditionId) => void` | —                                 |
| `updateResource(pb, id, resourceId, delta)` | `async (pb, id, resourceId, delta) => Resource` | Clamps to [0, pool_max] |
| `restoreResources(pb, id, rechargeType)` | `async (pb, id, rechargeType) => Character` | `"SHORT_REST"` or `"LONG_REST"` |
| `removeCharacter(pb, id)` | `async (pb, id) => void`                       | Hard delete                              |

### Available `data/rolls.js` exports

| Function              | Signature                            | Notes                    |
| --------------------- | ------------------------------------ | ------------------------ |
| `getAll(pb)`          | `async (pb) => Roll[]`               | Full roll history        |
| `logRoll(pb, data)`   | `async (pb, data) => Roll`           | Persists and returns roll |

---

## Socket.io event flow

**Rule:** REST first, then broadcast. Never emit without first persisting to PocketBase.

```
1. Route handler receives request
2. Validate input (reject bad shapes early — 400)
3. Call data/ function to write to PocketBase
4. On success: respond 2xx to caller + io.emit() to all clients
5. On error: respond 4xx/5xx (do NOT emit partial state)
```

### Canonical event payloads

All events broadcast to **all** connected clients via `io.emit()`.

| Event                  | Payload                                               | Triggered by                            |
| ---------------------- | ----------------------------------------------------- | --------------------------------------- |
| `initialData`          | `{ characters: Character[], rolls: Roll[] }`          | Socket `connection` event (unicast)     |
| `hp_updated`           | `{ character: Character, hp_current: number }`        | `PUT /api/characters/:id/hp`            |
| `character_created`    | `{ character: Character }`                            | `POST /api/characters`                  |
| `character_updated`    | `{ character: Character }`                            | `PUT /api/characters/:id` or `/photo`   |
| `condition_added`      | `{ charId, condition: Condition }`                    | `POST /api/characters/:id/conditions`   |
| `condition_removed`    | `{ charId, conditionId }`                             | `DELETE /api/characters/:id/conditions/:cid` |
| `resource_updated`     | `{ charId, resource: Resource }`                      | `PUT /api/characters/:id/resources/:rid` |
| `dice_rolled`          | `{ ...Roll }`                                         | `POST /api/rolls`                       |
| `scene_changed`        | `{ title, subtitle, theme }`                          | `POST /api/scene`                       |
| `announcement`         | `{ message, type, duration }`                         | `POST /api/announce`                    |

Full payloads with TypeScript signatures: `docs/SOCKET-EVENTS.md`.

---

## Input validation

- Validate at the route boundary — do not trust client input.
- Reject missing required fields with `400` before touching PocketBase.
- Numeric fields (`delta`, `hp_current`): validate as finite numbers, clamp in the data layer.
- IDs: validate as non-empty strings; let PocketBase throw `404` for unknown records (wrap in try/catch).

---

## Error handling

- Wrap `async main()` startup in a try/catch — `process.exit(1)` if PocketBase auth fails.
- Route handlers: use `try/catch` around all `data/` calls and respond with `500` on unexpected errors.
- Never let unhandled promise rejections crash the process.

---

## Server startup order

1. `./pocketbase serve` — must be running before the Node server starts.
2. `bun server.js` — authenticates PocketBase on startup, then listens on `:3000`.
3. If PocketBase is unreachable at startup, the server exits (`process.exit(1)`).

---

## Seeding

- `scripts/seed.js` reads `data/template-characters.json` (4 characters, stable IDs `CH101`–`CH104`).
- The seeder guards against double-seeding — safe to run multiple times.
- Run with: `bun run scripts/seed.js` (requires `.env` in root with PocketBase credentials).

