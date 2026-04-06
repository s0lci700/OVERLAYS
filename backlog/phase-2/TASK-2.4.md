---
id: TASK-2.4
title: Stage stores + socket event architecture
phase: 2
status: Done
points: 5
surface: Stage
milestone: Session 0 LAN Test
notion_url: https://www.notion.so/31eb63b6f5ec8158b773c89748ce5400
last_synced: 2026-04-04
---

# TASK-2.4 — Stage Session Store

**Status:** ✅ Done · **Points:** 5 · **Surface:** 🎮 Stage

> Define Stage Svelte stores: characterStore, diceStore, queueStore, sessionStore. Separate socket event emitters. Socket-first mutation architecture.

## Acceptance Criteria

- [x] Store file exists at `src/lib/derived/stage.svelte.ts`
- [x] Svelte 5 runes module (`$state` at module level, `.svelte.ts` extension)
- [x] State shape: `activeRoster`, `selectedCharacterId`, `sessionContext`, `recentMutations`
- [x] `initializeRoster(characters)` — loads roster from PocketBase data
- [x] `selectCharacter(characterId)` — sets selection, returns character
- [x] `mutateHp(characterId, { delta })` — clamps, logs, emits `HP_UPDATED`
- [x] `addCondition(characterId, conditionName)` — optimistic temp ID, logs, emits `CONDITION_ADDED`
- [x] `removeCondition(characterId, conditionId)` — splice by ID, logs, emits `CONDITION_REMOVED`
- [x] `updateResource(characterId, resourceName, { delta })` — clamps, logs, emits `RESOURCE_UPDATED`
- [x] `getCharacterList()`, `getSelectedCharacter()`, `getSessionContext()` accessors
- [x] Socket imported via `getSocket()` from `$lib/services/socket.svelte` (lazy, not at module top-level)
- [ ] Server-side socket relay handlers added (`socket.on('hpUpdated', ...)` etc.) — **BLOCKING TASK-2.1**

## Implementation Notes

- Socket-first pattern: local state → emit → REST fire-and-forget
- `getSocket()` called lazily inside each action (socket may not be initialized at module load)
- Optimistic condition add uses `temp-${Date.now()}` ID; server sync replaces it on next `initialData`
- `logMutation()` keeps last 10 entries (unshift + pop)
- Single `const timestamp = new Date().toISOString()` captured per action (shared between log and emit)

## Dependencies

- `$lib/contracts/events.ts` event name constants ✅
- `$lib/services/socket.svelte.ts` `getSocket()` ✅
- `$lib/contracts/records.ts` `CharacterRecord`, `Condition`, `ResourceSlot`, `SessionRecord` ✅
