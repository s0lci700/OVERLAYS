---
name: data
description: "Skill for the Data area of OVERLAYS. 16 symbols across 5 files."
---

# Data

16 symbols | 5 files | Cohesion: 68%

## When to Use

- Working with code in `backend/`
- Understanding how logRoll, getCharacter, findById work
- Modifying data-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `backend/data/characters.ts` | withPortraitUrl, findById, getCharacterName, updateHp, addCondition (+5) |
| `backend/handlers/rolls.ts` | isFiniteNumber, logRoll |
| `control-panel/src/lib/data/hitDice.ts` | getHitDie, formatHitDice |
| `backend/handlers/characters.ts` | getCharacter |
| `backend/seed.ts` | seedIfEmpty |

## Entry Points

Start here when exploring this area:

- **`logRoll`** (Function) — `backend/handlers/rolls.ts:13`
- **`getCharacter`** (Function) — `backend/handlers/characters.ts:26`
- **`findById`** (Function) — `backend/data/characters.ts:80`
- **`getCharacterName`** (Function) — `backend/data/characters.ts:90`
- **`updateHp`** (Function) — `backend/data/characters.ts:110`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `logRoll` | Function | `backend/handlers/rolls.ts` | 13 |
| `getCharacter` | Function | `backend/handlers/characters.ts` | 26 |
| `findById` | Function | `backend/data/characters.ts` | 80 |
| `getCharacterName` | Function | `backend/data/characters.ts` | 90 |
| `updateHp` | Function | `backend/data/characters.ts` | 110 |
| `addCondition` | Function | `backend/data/characters.ts` | 156 |
| `removeCondition` | Function | `backend/data/characters.ts` | 169 |
| `updateResource` | Function | `backend/data/characters.ts` | 184 |
| `seedIfEmpty` | Function | `backend/seed.ts` | 12 |
| `createCharacter` | Function | `backend/data/characters.ts` | 97 |
| `updatePhoto` | Function | `backend/data/characters.ts` | 124 |
| `getHitDie` | Function | `control-panel/src/lib/data/hitDice.ts` | 37 |
| `formatHitDice` | Function | `control-panel/src/lib/data/hitDice.ts` | 45 |
| `isFiniteNumber` | Function | `backend/handlers/rolls.ts` | 11 |
| `withPortraitUrl` | Function | `backend/data/characters.ts` | 21 |
| `photoStringToBlob` | Function | `backend/data/characters.ts` | 36 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `Main → WithPortraitUrl` | cross_community | 6 |
| `Main → PhotoStringToBlob` | cross_community | 5 |
| `LogRoll → WithPortraitUrl` | intra_community | 4 |
| `LogRoll → ServiceError` | cross_community | 4 |
| `DeleteCharacter → WithPortraitUrl` | cross_community | 4 |
| `UpdateResource → WithPortraitUrl` | cross_community | 4 |
| `RestoreResources → WithPortraitUrl` | cross_community | 4 |
| `UpdateCharacter → WithPortraitUrl` | cross_community | 3 |
| `FocusCharacter → WithPortraitUrl` | cross_community | 3 |
| `StartEncounter → WithPortraitUrl` | cross_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Handlers | 1 calls |

## How to Explore

1. `gitnexus_context({name: "logRoll"})` — see callers and callees
2. `gitnexus_query({query: "data"})` — find related execution flows
3. Read key files listed above for implementation details
