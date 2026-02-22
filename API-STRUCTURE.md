# Recommended API Structure for DADOS & RISAS

> This document describes the **target** API structure and layering. For the
> current MVP implementation, see [README.md](README.md) and [server.js](server.js),
> which list the live endpoints and Socket.io events.

## 1. Context & goals

- **Runtime stack:** Express 4.x server + Socket.io 4.x, Svelte Vite control panel, OBS overlays that consume WebSockets over the same hardcoded `http://192.168.1.83:3000` host.
- **Requirement:** Keep the whole pipeline JSON-first (no SQL for now), reliable for a 5‑hour live session, and orchestrate REST + WebSocket flows for HP, conditions, resources, rests, and dice rolls.
- **Scope:** Hold the in-memory data modules (`data/characters`, `data/rolls`) as the single source of truth, broadcast every mutation via `io.emit`, and keep every client (control panel + overlays) in sync with sub-100 ms latency.

## 2. Endpoint catalogue & DTOs

| Method | Path                                     | Request DTO                                                                    | Response DTO   | Side effects                                      |
| ------ | ---------------------------------------- | ------------------------------------------------------------------------------ | -------------- | ------------------------------------------------- | -------------------------------------------------------- |
| GET    | `/api/characters`                        | _none_                                                                         | `Character[]`  | emits `initialData` when each socket connects     |
| PUT    | `/api/characters/:id/hp`                 | `CharacterHPUpdate { hp_current: number }`                                     | `Character`    | emits `hp_updated { character, hp_current }`      |
| POST   | `/api/characters/:id/conditions`         | `ConditionPayload { condition_name: string, intensity_level?: number }`        | `Condition`    | emits `condition_added { charId, condition }`     |
| DELETE | `/api/characters/:id/conditions/:condId` | _none_                                                                         | `{ ok: true }` | emits `condition_removed { charId, conditionId }` |
| PUT    | `/api/characters/:id/resources/:rid`     | `ResourceUpdate { pool_current: number }`                                      | `Resource`     | emits `resource_updated { charId, resource }`     |
| POST   | `/api/characters/:id/rest`               | `RestRequest { type: "short"                                                   | "long" }`      | `{ restored: string[] }`                          | emits `rest_taken { charId, type, restored, character }` |
| POST   | `/api/rolls`                             | `RollLog { charId: string, result: number, modifier?: number, sides: number }` | `RollRecord`   | emits `dice_rolled { ...rollRecord }`             |

### Common DTO shapes (JSON-focused)

- `Character`: `{ id, name, player, hp_current, hp_max, armor_class, speed_walk, resources: Resource[], conditions: Condition[] }`
- `Resource`: `{ id, name, pool_current, pool_max, recharge, description? }`
- `Condition`: `{ id, condition_name, intensity_level?, duration_rounds? }`
- `RollRecord`: `{ id, charId, characterName, result, modifier, sides, rollResult }`

## 3. WebSocket contract

- `initialData { characters, rolls }` — emitted once per connection to hydrate everything.
- `hp_updated { character, hp_current }`
- `condition_added { charId, condition }`
- `condition_removed { charId, conditionId }`
- `resource_updated { charId, resource }`
- `rest_taken { charId, type, restored, character }`
- `dice_rolled { ...RollRecord }`
- Control panel uses REST to mutate state; overlays only listen, so every REST handler must re-emit the final representation.

## 4. Proposed layered architecture

```
Control Panel (REST + Socket.log)       OBS Overlays
        |                                     ^
        |                                     |
      (HTTP)                                 |
        ▼                                     |
    [Service layer — Express routes]----------|———— emits WebSocket events
        |
        ▼
    [Manager layer — domain logic + validation]
        |
        ▼
    [Resilience layer — circuit breaker / retry wrappers]
        |
        ▼
    [Data modules (characters/rolls) + broadcast helpers]
```

### Responsibilities

- **Service layer:** Keep each route handler narrow — validate path/query, deserialize JSON, call the manager, send HTTP response (200/201/400/404) and trigger `io.emit`. No business math here.
- **Manager layer:** Centralize operations such as `applyHpDelta`, `appendCondition`, `clampResource`, `applyRest`, and `recordRoll`. Each manager method should return the final data needed for responders/broadcasts (updated `Character`, `Resource`, `RollRecord`).
- **Resilience layer:** Wrap each manager method in a `opossum` circuit breaker configured for the 5‑hour live window:
  - Timeout (~1000 ms) to fail fast when a data module is unresponsive.
  - Retry/exponential backoff (e.g., 3 retries with `backoffFactor = 1.5`).
  - Bulkhead-style queueing (limit concurrent executions) to avoid overwhelming the server during bursty updates from the control panel.
  - Emits metrics (success/failure) to a simple log/tracing layer.
- **Data modules:** Keep as-is but expose pure functions (get, update, add). For persistence later they can grow to write to SQLite while preserving the interface the layers expect.

## 5. Resiliency & operational notes

- **Circuit breaker:** Use [`opossum`](https://nodeshift.dev/opossum/) to guard the manager calls invoked by each route; fallback to returning `500` if features are tripped.
- **Throttling:** Layer rate limiting on `/api/characters/:id/hp` and `/api/rolls` (e.g., 5 requests/sec per client) to protect overlays from floods; `express-rate-limit` can guard service layer before calling managers.
- **Backoff:** Manager/resilience wrappers should retry transient `io.emit`/data updates with exponential backoff before raising an error to the client; log every failure.
- **Logging & metrics:** Use structured logs for every successful mutation and broadcast; track HP update latency, rest duration, roll publish time.
- **Monitoring:** Add a simple health-check (already `/`) plus a periodic watcher that confirms the data modules are reachable and no websockets have been disconnected for >5 minutes. Use `setInterval` to emit an internal `heartbeat` event for debugging.

## 6. Tests & validation (JSON-focused)

1. **HP clamp** — PUT `/api/characters/:id/hp` with damage beyond negative or above max; expect HP to stay within bounds and receive the updated `Character`.
2. **Condition lifecycle** — POST and then DELETE a condition; expect `condition_added`/`condition_removed` payloads and non-null `conditions` arrays.
3. **Resource toggle** — PUT `/api/characters/:id/resources/:rid` to spend/recover; expect the broadcast `resource_updated` with the new pool.
4. **Rest automation** — POST `/api/characters/:id/rest` with `short`/`long` and confirm `rest_taken` reflects `restored`, and resource pools for the `Character` are reset appropriately.
5. **Dice logging** — POST `/api/rolls` with modifiers; verify the stored `RollRecord`, the broadcast `dice_rolled`, and that future clients receive it via `initialData`.

## 7. Next steps

- Introduce versioning (e.g., `v1` prefix) once persistence (SQLite) arrives.
- Add validation middleware (JSON schema) so DTO enforcement happens before hitting managers.
- Expand resilience layer to include observability (prometheus metrics or temporary file-based alerting) for the performance-critical live demo windows.
