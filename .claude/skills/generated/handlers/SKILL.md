---
name: handlers
description: "Skill for the Handlers area of OVERLAYS. 43 symbols across 12 files."
---

# Handlers

43 symbols | 12 files | Cohesion: 79%

## When to Use

- Working with code in `backend/`
- Understanding how setSceneState, setFocusedChar, setSyncStartTime work
- Modifying handlers-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `backend/handlers/characters.ts` | createCharacter, updatePhoto, deleteCharacter, listCharacters, updateCharacter (+6) |
| `backend/handlers/misc.ts` | syncStart, changeScene, focusCharacter, preloadTokens, getMainIP (+1) |
| `backend/handlers/overlay.ts` | announce, levelUp, playerDown, lowerThird |
| `backend/data/characters.ts` | removeCharacter, getAll, updateCharacterData, restoreResources |
| `backend/handlers/encounter.ts` | getEncounter, startEncounter, nextTurn, endEncounter |
| `backend/socket/rooms.ts` | setSyncStartTime, logEvent, broadcast |
| `backend/state/scene.ts` | setSceneState, setFocusedChar |
| `backend/state/encounter.ts` | getEncounterState, setEncounterState |
| `server.ts` | main, scheduleRefresh |
| `backend/pb.ts` | connectToPocketBase, ensureAuth |

## Entry Points

Start here when exploring this area:

- **`setSceneState`** (Function) — `backend/state/scene.ts:20`
- **`setFocusedChar`** (Function) — `backend/state/scene.ts:29`
- **`setSyncStartTime`** (Function) — `backend/socket/rooms.ts:22`
- **`broadcast`** (Function) — `backend/socket/rooms.ts:41`
- **`announce`** (Function) — `backend/handlers/overlay.ts:7`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `setSceneState` | Function | `backend/state/scene.ts` | 20 |
| `setFocusedChar` | Function | `backend/state/scene.ts` | 29 |
| `setSyncStartTime` | Function | `backend/socket/rooms.ts` | 22 |
| `broadcast` | Function | `backend/socket/rooms.ts` | 41 |
| `announce` | Function | `backend/handlers/overlay.ts` | 7 |
| `levelUp` | Function | `backend/handlers/overlay.ts` | 16 |
| `playerDown` | Function | `backend/handlers/overlay.ts` | 25 |
| `lowerThird` | Function | `backend/handlers/overlay.ts` | 34 |
| `syncStart` | Function | `backend/handlers/misc.ts` | 64 |
| `changeScene` | Function | `backend/handlers/misc.ts` | 75 |
| `focusCharacter` | Function | `backend/handlers/misc.ts` | 85 |
| `createCharacter` | Function | `backend/handlers/characters.ts` | 38 |
| `updatePhoto` | Function | `backend/handlers/characters.ts` | 107 |
| `deleteCharacter` | Function | `backend/handlers/characters.ts` | 227 |
| `removeCharacter` | Function | `backend/data/characters.ts` | 217 |
| `getEncounterState` | Function | `backend/state/encounter.ts` | 31 |
| `setEncounterState` | Function | `backend/state/encounter.ts` | 35 |
| `getEncounter` | Function | `backend/handlers/encounter.ts` | 11 |
| `startEncounter` | Function | `backend/handlers/encounter.ts` | 15 |
| `nextTurn` | Function | `backend/handlers/encounter.ts` | 48 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Main → WithPortraitUrl` | cross_community | 6 |
| `Main → CreateShortId` | cross_community | 6 |
| `Main → PhotoStringToBlob` | cross_community | 5 |
| `Main → ClampHp` | cross_community | 5 |
| `Main → ClampResource` | cross_community | 5 |
| `UpdateCharacter → ServiceError` | cross_community | 4 |
| `FocusCharacter → ServiceError` | cross_community | 4 |
| `StartEncounter → ServiceError` | cross_community | 4 |
| `NextTurn → ServiceError` | cross_community | 4 |
| `LogRoll → ServiceError` | cross_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Data | 7 calls |
| State | 1 calls |
| Derived | 1 calls |

## How to Explore

1. `gitnexus_context({name: "setSceneState"})` — see callers and callees
2. `gitnexus_query({query: "handlers"})` — find related execution flows
3. Read key files listed above for implementation details
