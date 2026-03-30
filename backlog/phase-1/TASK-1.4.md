---
id: TASK-1.4
title: Build resource tracker component
phase: 1
status: Done
points: 5
surface: Cast/Players
milestone: Session 0 LAN Test
notion_url: https://www.notion.so/31eb63b6f5ec81ceb5e0f1ca2761d8db
last_synced: 2026-03-30
---

# TASK-1.4 — Build resource tracker component

**Status:** ✅ Done · **Points:** 5 · **Surface:** 📱 Cast/Players

> Build a pool-based resource tracker component for class features (Rage, Spell Slots, Action Surge, etc.) that displays `pool_current / pool_max` with `reset_on` recharge type.

## Acceptance Criteria

- [ ] Renders each `ResourceSlot` from character's `resources` JSON field
- [ ] Displays pool pips or fraction (`current / max`) per resource
- [ ] Shows recharge type label (`long rest`, `short rest`, `turn`, `dm`)
- [ ] Tappable pips to increment/decrement (sends update via service)
- [ ] Storybook story with fixture resources (Rage, Spell Slots, Second Wind)

## Resource Shape

```typescript
interface ResourceSlot {
  id: string;
  name: string;
  pool_max: number;
  pool_current: number;
  reset_on: 'long_rest' | 'short_rest' | 'turn' | 'dm';
}
```

## Dependencies

- **Requires:** TASK-1.2 (page scaffold)
- **Uses:** `condition-pill` design patterns from Phase 0
