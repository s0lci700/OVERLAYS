---
name: actions
description: "Skill for the Actions area of OVERLAYS. 11 symbols across 5 files."
---

# Actions

11 symbols | 5 files | Cohesion: 72%

## When to Use

- Working with code in `backend/`
- Understanding how clampHp, buildCondition, createShortId work
- Modifying actions-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `backend/actions/characters.ts` | updateHp, addCondition, removeCondition, updateResource, updateResourceById |
| `backend/domain/character.ts` | clampHp, buildCondition, clampResource |
| `backend/data/id.ts` | createShortId |
| `backend/socket/events/character.ts` | registerCharacterEvents |
| `backend/handlers/characters.ts` | updateResource |

## Entry Points

Start here when exploring this area:

- **`clampHp`** (Function) — `backend/domain/character.ts:8`
- **`buildCondition`** (Function) — `backend/domain/character.ts:12`
- **`createShortId`** (Function) — `backend/data/id.ts:10`
- **`registerCharacterEvents`** (Function) — `backend/socket/events/character.ts:25`
- **`updateResource`** (Function) — `backend/handlers/characters.ts:240`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `clampHp` | Function | `backend/domain/character.ts` | 8 |
| `buildCondition` | Function | `backend/domain/character.ts` | 12 |
| `createShortId` | Function | `backend/data/id.ts` | 10 |
| `registerCharacterEvents` | Function | `backend/socket/events/character.ts` | 25 |
| `updateResource` | Function | `backend/handlers/characters.ts` | 240 |
| `clampResource` | Function | `backend/domain/character.ts` | 21 |
| `updateHp` | Method | `backend/actions/characters.ts` | 21 |
| `addCondition` | Method | `backend/actions/characters.ts` | 33 |
| `removeCondition` | Method | `backend/actions/characters.ts` | 46 |
| `updateResource` | Method | `backend/actions/characters.ts` | 70 |
| `updateResourceById` | Method | `backend/actions/characters.ts` | 87 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Main → WithPortraitUrl` | cross_community | 6 |
| `Main → CreateShortId` | cross_community | 6 |
| `Main → ClampHp` | cross_community | 5 |
| `Main → ClampResource` | cross_community | 5 |
| `UpdateResource → WithPortraitUrl` | cross_community | 4 |
| `UpdateResource → ClampResource` | intra_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Data | 4 calls |

## How to Explore

1. `gitnexus_context({name: "clampHp"})` — see callers and callees
2. `gitnexus_query({query: "actions"})` — find related execution flows
3. Read key files listed above for implementation details
