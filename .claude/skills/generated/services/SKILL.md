---
name: services
description: "Skill for the Services area of OVERLAYS. 32 symbols across 11 files."
---

# Services

32 symbols | 11 files | Cohesion: 89%

## When to Use

- Working with code in `control-panel/`
- Understanding how getCharacterRecord, updateCharacterRecord, listActiveCharacters work
- Modifying services-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `control-panel/src/lib/services/pocketbase.ts` | mapPocketBaseError, assertNonEmptyString, getCharacterRecord, updateCharacterRecord, listActiveCharacters (+6) |
| `control-panel/src/lib/services/socket.svelte.ts` | assertEnvVariable, mapSocketError, getSocket, connectSocket, bindSocketListeners (+1) |
| `control-panel/src/lib/services/router.js` | parseHash, handler, generateHash, updateHash |
| `control-panel/src/lib/services/character.ts` | getCharacter, subscribeToCharacterUpdates, listCharacters |
| `control-panel/src/lib/services/character-form.ts` | normalizeSelection, buildCharacterPayload |
| `control-panel/src/routes/(cast)/players/[id]/+layout.server.ts` | load |
| `control-panel/src/lib/services/errors.ts` | ServiceError |
| `control-panel/src/routes/+layout.server.ts` | load |
| `control-panel/src/routes/(cast)/players/+page.server.ts` | load |
| `control-panel/src/routes/(cast)/dm/+page.server.ts` | load |

## Entry Points

Start here when exploring this area:

- **`getCharacterRecord`** (Function) — `control-panel/src/lib/services/pocketbase.ts:113`
- **`updateCharacterRecord`** (Function) — `control-panel/src/lib/services/pocketbase.ts:124`
- **`listActiveCharacters`** (Function) — `control-panel/src/lib/services/pocketbase.ts:150`
- **`addCondition`** (Function) — `control-panel/src/lib/services/pocketbase.ts:163`
- **`removeCondition`** (Function) — `control-panel/src/lib/services/pocketbase.ts:179`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `ServiceError` | Class | `control-panel/src/lib/services/errors.ts` | 39 |
| `getCharacterRecord` | Function | `control-panel/src/lib/services/pocketbase.ts` | 113 |
| `updateCharacterRecord` | Function | `control-panel/src/lib/services/pocketbase.ts` | 124 |
| `listActiveCharacters` | Function | `control-panel/src/lib/services/pocketbase.ts` | 150 |
| `addCondition` | Function | `control-panel/src/lib/services/pocketbase.ts` | 163 |
| `removeCondition` | Function | `control-panel/src/lib/services/pocketbase.ts` | 179 |
| `updateResource` | Function | `control-panel/src/lib/services/pocketbase.ts` | 198 |
| `restoreResources` | Function | `control-panel/src/lib/services/pocketbase.ts` | 219 |
| `getCharacter` | Function | `control-panel/src/lib/services/character.ts` | 41 |
| `load` | Function | `control-panel/src/routes/(cast)/players/[id]/+layout.server.ts` | 5 |
| `getSocket` | Function | `control-panel/src/lib/services/socket.svelte.ts` | 103 |
| `connectSocket` | Function | `control-panel/src/lib/services/socket.svelte.ts` | 114 |
| `subscribe` | Function | `control-panel/src/lib/services/socket.svelte.ts` | 218 |
| `subscribeToCharacterUpdates` | Function | `control-panel/src/lib/services/character.ts` | 66 |
| `load` | Function | `control-panel/src/routes/+layout.server.ts` | 3 |
| `listCharacterRecords` | Function | `control-panel/src/lib/services/pocketbase.ts` | 139 |
| `listCharacters` | Function | `control-panel/src/lib/services/character.ts` | 15 |
| `load` | Function | `control-panel/src/routes/(cast)/players/+page.server.ts` | 6 |
| `load` | Function | `control-panel/src/routes/(cast)/dm/+page.server.ts` | 3 |
| `load` | Function | `control-panel/src/routes/(stage)/live/characters/+page.server.ts` | 3 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Load → ServiceError` | cross_community | 5 |
| `Load → ServiceError` | cross_community | 5 |
| `Load → ServiceError` | cross_community | 5 |
| `UpdateCharacter → ServiceError` | cross_community | 4 |
| `FocusCharacter → ServiceError` | cross_community | 4 |
| `StartEncounter → ServiceError` | cross_community | 4 |
| `NextTurn → ServiceError` | cross_community | 4 |
| `LogRoll → ServiceError` | cross_community | 4 |
| `SyncStart → ServiceError` | cross_community | 4 |
| `ChangeScene → ServiceError` | cross_community | 4 |

## How to Explore

1. `gitnexus_context({name: "getCharacterRecord"})` — see callers and callees
2. `gitnexus_query({query: "services"})` — find related execution flows
3. Read key files listed above for implementation details
