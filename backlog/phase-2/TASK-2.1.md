---
id: TASK-2.1
title: Build Live Characters route
phase: 2
status: Done
points: 5
surface: Stage
milestone: Session 0 LAN Test
notion_url: https://www.notion.so/31eb63b6f5ec8135929ee29ea6034093
last_synced: 2026-04-04
---

# TASK-2.1 — Build Live Characters Route

**Status:** ✅ Done · **Points:** 5 · **Surface:** 🎮 Stage

> Stage route for managing live character state. HP adjustment, condition toggles, resource controls, and recent mutations log. Emits socket events via `stage.svelte.ts` store.

## Acceptance Criteria

- [ ] Route exists at `(stage)/live/characters/+page.svelte`
- [ ] Active roster displayed (name, HP, conditions, resources) from `stage.svelte.ts` store
- [ ] Character selection via click/toggle; selected character highlighted
- [ ] HP mutation UI with increment buttons (+1, +5, -1, -5); emits `hp_updated`
- [ ] Condition management: dropdown to add from predefined list, X to remove; emits `condition_added` / `condition_removed`
- [ ] Resource adjustment UI: pips per resource pool; emits `resource_updated`
- [ ] Recent mutations log showing last 8–10 actions (character + action + timestamp)
- [ ] Add-condition UI wired into `CardActions.svelte`

## Dependencies

- **Requires:** TASK-2.4 (`stage.svelte.ts` store with mutation actions) ✅ store built
- **Requires:** Server socket relay handlers for `hpUpdated`, `conditionAdded`, `conditionRemoved`, `resourceUpdated`
- **Uses:** `contracts/events.ts` event constants

## Technical Notes

- Store is at `$lib/derived/stage.svelte.ts` (not `$lib/stores/`)
- Import `initializeRoster`, `mutateHp`, `addCondition`, `removeCondition`, `updateResource` from store
- `+page.server.js` or `+layout.server.js` should call `initializeRoster()` with PocketBase data
- Selection state is local component `$state` — not in the shared store
