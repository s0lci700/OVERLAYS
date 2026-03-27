---
title: Socket.io Event Reference
type: reference
source_files: [src/server/handlers/, src/server/socket/]
last_updated: 2026-03-25
---

# Socket.io Event Reference

> Complete reference for all Socket.io events in DADOS & RISAS.
>
> **Note on event naming:** Server emits use `snake_case` (e.g. `hp_updated`). The TypeScript contract file `$lib/contracts/events.ts` currently defines `camelCase` constants (`hpUpdated`, `conditionAdded`). These do **not** match the server — treat `events.ts` as a forward-looking contract, not the current wire format. Components should listen for the snake_case names shown in this document.

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
  encounter: EncounterState,// Current encounter (active, round, participants)
  scene: SceneState,        // Current scene (title, subtitle, visible)
  focusedChar: Character | null // Character currently in focus (or null)
}
```

**Listeners:**

- `control-panel/src/lib/services/socket.js` — populates `characters` store
- `control-panel/src/lib/components/overlays/shared/overlaySocket.svelte.ts` — bootstraps overlay state

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

---

## Character Deletion

### `character_deleted`

**Direction:** Server → all clients
**When:** `DELETE /api/characters/:id` succeeds
**Payload:**

```js
{
  charId: string  // ID of the deleted character
}
```

**Listeners:**

| File | Action |
|---|---|
| `services/socket.js` | Filters character out of `characters` store |

---

## Encounter Events

### `encounter_started`

**Direction:** Server → all clients
**When:** `POST /api/encounter/start` succeeds
**Payload:**

```js
{
  active: boolean,
  round: number,
  currentTurnIndex: number,
  participants: Array<{
    charId: string,        // PocketBase character ID
    name: string,
    photo: string | null,  // URL or base64 data URI
    class_primary: object | null,
    hp_current: number,
    hp_max: number,
    initiative: number
  }>
}
```

### `turn_advanced`

**Direction:** Server → all clients
**When:** `POST /api/encounter/next-turn` succeeds
**Payload:**

```js
{
  round: number,
  currentTurnIndex: number,
  currentParticipant: {  // Full participant object (same shape as encounter_started participants)
    charId: string,
    name: string,
    photo: string | null,
    class_primary: object | null,
    hp_current: number,
    hp_max: number,
    initiative: number
  }
}
```

### `encounter_ended`

**Direction:** Server → all clients
**When:** `POST /api/encounter/end` succeeds
**Payload:** `{}`

**Listeners (all encounter events):**

| File | Action |
|---|---|
| `components/overlays/OverlayTurnOrder.svelte` | Updates initiative strip display |

---

## Scene Events

### `scene_changed`

**Direction:** Server → all clients
**When:** `POST /api/scene/change` succeeds
**Payload:**

```js
{
  title: string,
  subtitle: string,
  visible: boolean
}
```

**Listeners:**

| File | Action |
|---|---|
| `components/overlays/OverlaySceneTitle.svelte` | Shows/hides and updates scene title |

### `character_focused`

**Direction:** Server → all clients
**When:** `POST /api/character-focus` with a valid character
**Payload:**

```js
{
  character: Character  // Character to spotlight
}
```

### `character_unfocused`

**Direction:** Server → all clients
**When:** `POST /api/character-focus` with no/null character
**Payload:** `{}`

**Listeners (focus events):**

| File | Action |
|---|---|
| `components/overlays/OverlayCharacterFocus.svelte` | Shows/hides character focus panel |

---

## Show / Moment Events

### `sync_start`

**Direction:** Server → all clients
**When:** `POST /api/sync-start`
**Payload:**

```js
{
  ts_abs: number  // Unix timestamp (ms) marking session sync point
}
```

### `announce`

**Direction:** Server → all clients
**When:** `POST /api/announce`
**Payload:**

```js
{
  type: string,          // Announcement category key
  title: string,
  body: string | null,
  image: string | null,
  duration: number | null  // Display duration in ms (null = persistent)
}
```

**Listeners:**

| File | Action |
|---|---|
| `components/overlays/OverlayAnnounce.svelte` | Displays announcement overlay |

### `level_up`

**Direction:** Server → all clients
**When:** `POST /api/level-up`
**Payload:**

```js
{
  charId: string,
  newLevel: number,
  className: string  // Class name for display (e.g. "Barbarian")
}
```

**Listeners:**

| File | Action |
|---|---|
| `components/overlays/OverlayLevelUp.svelte` | Plays level-up moment animation |

### `player_down`

**Direction:** Server → all clients
**When:** `POST /api/player-down`
**Payload:**

```js
{
  charId: string,
  isDead: boolean  // true = dead, false = unconscious/0 HP
}
```

**Listeners:**

| File | Action |
|---|---|
| `components/overlays/OverlayPlayerDown.svelte` | Plays player-down moment animation |

### `lower_third`

**Direction:** Server → all clients
**When:** `POST /api/lower-third`
**Payload:**

```js
{
  characterName: string,
  playerName: string,    // Player's real name
  duration: number       // Display duration in ms (default 5000)
}
```

**Listeners:**

| File | Action |
|---|---|
| `components/overlays/OverlayLowerThird.svelte` | Shows lower-third name card |

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
