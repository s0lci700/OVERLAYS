---
id: TASK-1.5
title: Build conditions/status display component
phase: 1
status: Done
points: 5
surface: Cast/Players
milestone: Session 0 LAN Test
notion_url: https://www.notion.so/31eb63b6f5ec816cbdf2c1b35bf37d7f
last_synced: 2026-04-03
---

# TASK-1.5 — Build conditions/status display component

**Status:** ✅ Done · **Points:** 5 · **Surface:** 📱 Cast/Players

> Build an active conditions list that displays current conditions with intensity level, using the `condition-pill` component from Phase 0.

## Acceptance Criteria

- [ ] Renders each `Condition` from character's `conditions` field
- [ ] Each condition shown as a `condition-pill` (variant="condition") with `condition_name`
- [ ] Intensity level displayed (if > 1)
- [ ] Empty state when no conditions active
- [ ] Storybook story with fixture conditions (Poisoned, Frightened, etc.)

## Condition Shape

```typescript
interface Condition {
  id: string;
  condition_name: string;
  intensity_level: number;
  applied_at: string; // ISO 8601
}
```

## Dependencies

- **Requires:** TASK-1.2 (page scaffold)
- **Uses:** `condition-pill` component from Phase 0 (already built)
