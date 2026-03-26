---
id: TASK-1.6
title: Wire live state socket overlay — HP, conditions
phase: 1
status: Planned
points: 5
surface: Cast/Players
milestone: Session 0 LAN Test
notion_url: https://www.notion.so/31eb63b6f5ec81449adee532800a9a0c
last_synced: 2026-03-25
---

# TASK-1.6 — Wire live state socket overlay — HP, conditions

**Status:** 📋 Planned · **Points:** 5 · **Surface:** 📱 Cast/Players

> Subscribe to `hp_updated` and `condition_added/removed` socket events via the `character.ts` service so the player sheet reflects live state changes from the Stage operator without a page reload.

## Acceptance Criteria

- [ ] Character page subscribes to `hp_updated` on mount — updates HP display reactively
- [ ] Character page subscribes to `condition_added` — adds pill to conditions list
- [ ] Character page subscribes to `condition_removed` — removes pill from conditions list
- [ ] Subscriptions are cleaned up on component destroy (no memory leaks)
- [ ] Baseline record from PocketBase is the initial state; socket events are deltas only
- [ ] If socket disconnects, page shows stale indicator but does not crash

## Socket Events Used

```typescript
// From contracts/events.ts
hp_updated:       { character_id, hp_current, hp_max, hp_temp }
condition_added:  { character_id, condition: Condition }
condition_removed:{ character_id, condition_id: string }
```

## Pattern

```svelte
onMount(() => {
  const unsub = socket.on('hp_updated', (data) => {
    if (data.character_id === character.id) {
      hp_current = data.hp_current;
    }
  });
  return unsub; // cleanup on destroy
});
```

## Dependencies

- **Requires:** TASK-1.2 (page scaffold), TASK-1.3 (sections to update)
- **Requires:** `socket.ts` service from Phase 0 ✅, `contracts/events.ts` from Phase 0 ✅
