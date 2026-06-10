---
name: derived
description: "Skill for the Derived area of OVERLAYS. 11 symbols across 2 files."
---

# Derived

11 symbols | 2 files | Cohesion: 92%

## When to Use

- Working with code in `control-panel/`
- Understanding how emit, selectCharacter, mutateHp work
- Modifying derived-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `control-panel/src/lib/derived/stage.svelte.ts` | getCharacterById, clamp, hPBoundsCheck, checkExistingCondition, logMutation (+5) |
| `control-panel/src/lib/services/socket.svelte.ts` | emit |

## Entry Points

Start here when exploring this area:

- **`emit`** (Function) — `control-panel/src/lib/services/socket.svelte.ts:230`
- **`selectCharacter`** (Function) — `control-panel/src/lib/derived/stage.svelte.ts:91`
- **`mutateHp`** (Function) — `control-panel/src/lib/derived/stage.svelte.ts:101`
- **`addCondition`** (Function) — `control-panel/src/lib/derived/stage.svelte.ts:125`
- **`removeCondition`** (Function) — `control-panel/src/lib/derived/stage.svelte.ts:156`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `emit` | Function | `control-panel/src/lib/services/socket.svelte.ts` | 230 |
| `selectCharacter` | Function | `control-panel/src/lib/derived/stage.svelte.ts` | 91 |
| `mutateHp` | Function | `control-panel/src/lib/derived/stage.svelte.ts` | 101 |
| `addCondition` | Function | `control-panel/src/lib/derived/stage.svelte.ts` | 125 |
| `removeCondition` | Function | `control-panel/src/lib/derived/stage.svelte.ts` | 156 |
| `updateResource` | Function | `control-panel/src/lib/derived/stage.svelte.ts` | 184 |
| `getCharacterById` | Function | `control-panel/src/lib/derived/stage.svelte.ts` | 56 |
| `clamp` | Function | `control-panel/src/lib/derived/stage.svelte.ts` | 60 |
| `hPBoundsCheck` | Function | `control-panel/src/lib/derived/stage.svelte.ts` | 64 |
| `checkExistingCondition` | Function | `control-panel/src/lib/derived/stage.svelte.ts` | 74 |
| `logMutation` | Function | `control-panel/src/lib/derived/stage.svelte.ts` | 84 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `UpdateCharacter → ServiceError` | cross_community | 4 |
| `FocusCharacter → ServiceError` | cross_community | 4 |
| `StartEncounter → ServiceError` | cross_community | 4 |
| `NextTurn → ServiceError` | cross_community | 4 |
| `LogRoll → ServiceError` | cross_community | 4 |
| `SyncStart → ServiceError` | cross_community | 4 |
| `ChangeScene → ServiceError` | cross_community | 4 |
| `EndEncounter → ServiceError` | cross_community | 4 |
| `DeleteCharacter → ServiceError` | cross_community | 4 |
| `Announce → ServiceError` | cross_community | 4 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Services | 1 calls |

## How to Explore

1. `gitnexus_context({name: "emit"})` — see callers and callees
2. `gitnexus_query({query: "derived"})` — find related execution flows
3. Read key files listed above for implementation details
