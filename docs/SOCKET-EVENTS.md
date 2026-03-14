# Socket.io Event Reference

> Complete reference for all Socket.io events in DADOS & RISAS.

---

## Connection

### `connection` (server-side)

Fired when any client connects. Server sends `initialData` in response.

### `initialData`

**Direction:** Server → connecting client (not broadcast)
**When:** Immediately after a client connects
**Payload:**

```js
{
  characters: Character[],  // Full roster with HP, conditions, resources
  rolls: Roll[]             // All dice roll history
}
```

**Listeners:**

- `control-panel/src/lib/services/socket.js` — populates `characters` store
- `control-panel/src/lib/components/overlays/shared/overlaySocket.svelte.js` — bootstraps overlay state

---

## Character Events

### `hp_updated`

**Direction:** Server → all clients
**When:** `PUT /api/characters/:id/hp` succeeds
**Payload:**

```js
{
  character: Character,   // Full updated character object
  hp_current: number      // Convenience duplicate of character.hp_current
}
```

**Listeners:**
| File | Action |
|---|---|
| `services/socket.js` | Replaces character in `characters` store |
| `derived/overviewStore.js` | Logs to activity history |
| `components/overlays/OverlayHP.svelte` | Reactive HP bar + condition-aware state update |

### `character_created`

**Direction:** Server → all clients
**When:** `POST /api/characters` succeeds
**Payload:**

```js
{
  character: Character; // Newly created character object
}
```

**Listeners:**
| File | Action |
|---|---|
| `services/socket.js` | Appends to `characters` store |

### `character_updated`

**Direction:** Server → all clients
**When:** `PUT /api/characters/:id/photo` or `PUT /api/characters/:id` succeeds
**Payload:**

```js
{
  character: Character; // Updated character object
}
```

**Listeners:**
| File | Action |
|---|---|
| `services/socket.js` | Replaces character in `characters` store |

---

## Condition Events

### `condition_added`

**Direction:** Server → all clients
**When:** `POST /api/characters/:id/conditions` succeeds
**Payload:**

```js
{
  charId: string,          // Character ID the condition was added to
  condition: {
    id: string,            // 5-character ID assigned by server
    condition_name: string,// e.g. "Poisoned", "Stunned"
    intensity_level: number,// Severity (default 1)
    applied_at: string     // ISO 8601 timestamp
  }
}
```

**Listeners:**
| File | Action |
|---|---|
| `services/socket.js` | Appends condition to character in `characters` store |
| `derived/overviewStore.js` | Logs to activity history |

### `condition_removed`

**Direction:** Server → all clients
**When:** `DELETE /api/characters/:id/conditions/:condId` succeeds
**Payload:**

```js
{
  charId: string,       // Character ID
  conditionId: string   // 5-character ID of the removed condition
}
```

**Listeners:**
| File | Action |
|---|---|
| `services/socket.js` | Filters condition out of character in `characters` store |
| `derived/overviewStore.js` | Logs to activity history |

---

## Resource Events

### `resource_updated`

**Direction:** Server → all clients
**When:** `PUT /api/characters/:id/resources/:rid` succeeds
**Payload:**

```js
{
  charId: string,       // Character ID
  resource: {
    id: string,         // Resource ID (e.g. "RS001")
    name: string,       // Display name (e.g. "RAGE")
    pool_max: number,   // Maximum uses
    pool_current: number,// Updated remaining uses
    recharge: string    // "LONG_REST" | "SHORT_REST" | "TURN" | "DM"
  }
}
```

**Listeners:**
| File | Action |
|---|---|
| `services/socket.js` | Updates matching resource in character's `resources` array |
| `derived/overviewStore.js` | Logs to activity history |

---

## Rest Events

### `rest_taken`

**Direction:** Server → all clients
**When:** `POST /api/characters/:id/rest` succeeds
**Payload:**

```js
{
  charId: string,          // Character ID
  type: "short" | "long",  // Rest type
  restored: string[],      // Names of resources that were restored
  character: Character      // Full updated character (all pools refreshed)
}
```

**Listeners:**
| File | Action |
|---|---|
| `services/socket.js` | Replaces entire character object in `characters` store |
| `derived/overviewStore.js` | Logs to activity history |

---

## Dice Events

### `dice_rolled`

**Direction:** Server → all clients
**When:** `POST /api/rolls` succeeds
**Payload:**

```js
{
  id: string,              // 5-character ID for the roll record
  charId: string,          // Character who rolled
  characterName: string,   // Character name (for display)
  result: number,          // Base die result (1–sides)
  modifier: number,        // Modifier applied (default 0)
  rollResult: number,      // Final result (result + modifier)
  sides: number,           // Die type (4, 6, 8, 10, 12, or 20)
  timestamp: string        // ISO 8601 timestamp
}
```

**Listeners:**
| File | Action |
|---|---|
| `services/socket.js` | Sets `lastRoll` store |
| `derived/overviewStore.js` | Logs to activity history |
| `components/overlays/OverlayDice.svelte` | Renders roll moment overlay with timed dismissal |

---

## Event Flow Diagram

```
Control Panel (Svelte)                Server (:3000)                  OBS Overlays
─────────────────────                ──────────────                  ────────────
       │                                  │                              │
       │── fetch PUT/POST ───────────────→│                              │
       │                                  │── io.emit("event") ────────→│
       │←── Socket.io "event" ───────────│                              │
       │                                  │                              │
      │  services/socket.js updates      │                    overlay components update reactively
      │  derived/overviewStore logs      │
       │  components re-render            │
```

---

## Type Reference

### Character

```js
{
  id: string,
  name: string,
  player: string,
  hp_current: number,
  hp_max: number,
  hp_temp: number,
  armor_class: number,
  speed_walk: number,
  ability_scores: { str, dex, con, int, wis, cha },
  conditions: Condition[],
  resources: Resource[]
}
```

### Condition

```js
{
  id: string,              // 5-character ID
  condition_name: string,
  intensity_level: number,
  applied_at: string       // ISO 8601
}
```

### Resource

```js
{
  id: string,
  name: string,
  pool_max: number,
  pool_current: number,
  recharge: "LONG_REST" | "SHORT_REST" | "TURN" | "DM"
}
```

### Roll

```js
{
  id: string,              // 5-character ID
  charId: string,
  characterName: string,
  result: number,
  modifier: number,
  rollResult: number,
  sides: number,
  timestamp: string        // ISO 8601
}
```
