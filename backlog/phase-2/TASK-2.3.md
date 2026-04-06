---
id: TASK-2.3
title: Build Reveal/Content Queue route
phase: 2
status: Planned
points: 8
surface: Stage
milestone: Session 0 LAN Test
notion_url: https://www.notion.so/31eb63b6f5ec815a9221c543f871760b
last_synced: 2026-04-03
---

# TASK-2.3 — Build Reveal/Content Queue Route

**Status:** 📋 Planned · **Points:** 8 · **Surface:** 🎮 Stage

> RevealQueueCard queue: arm content blocks (character intro, info block, location update) for overlay display. Arm/clear lifecycle. Distinct from dice publish flow.

## Acceptance Criteria

- [ ] Route exists at `(stage)/live/queue/+page.svelte`
- [ ] Two-panel layout: left = queued items list with status badges; right = selected item preview
- [ ] "Add to queue" opens modal with type selector (character_intro, info_block, location_update) and type-specific fields
- [ ] Status transitions: draft → armed → published → expired (via buttons in preview pane)
- [ ] Arm/publish/clear/expire actions wired to `stageQueue` store
- [ ] Publish emits Socket.io event to Commons overlay
- [ ] Compact published history (last 5–10 items)

## Dependencies

- **Requires:** TASK-2.5 (`stageQueue.svelte.ts` store with queue lifecycle actions)
- **Requires:** `contracts/overlays.ts` payload shape types
- **Requires:** `contracts/events.ts` queue event constants

## Notes

Store path should be `$lib/derived/stage-queue.svelte.ts` (not `$lib/stores/stageQueue.js` as in older Notion notes — follow TASK-0.3 `derived/` convention).
