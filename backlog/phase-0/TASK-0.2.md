---
id: TASK-0.2
title: Define shared contract type modules
phase: 0
status: Done
points: 5
surface: Foundation
milestone: Session 0 LAN Test
notion_url: https://www.notion.so/31eb63b6f5ec81198966f7d09c3ebdfb
last_synced: 2026-03-25
---

# TASK-0.2 — Define shared contract type modules

**Status:** ✅ Done · **Points:** 5 · **Surface:** 🏗 Foundation

> Create `control-panel/src/lib/contracts/` as the canonical location for all shared TypeScript interfaces — character records, socket events, overlay payloads, broadcast adapters.

## Outcome

`src/lib/contracts/` — 6 `.ts` files:
- `records.ts` — `CharacterRecord`, `CampaignRecord`, `SessionRecord`, `ResourceSlot`, `Condition`
- `events.ts` — socket event types
- `overlays.ts` — overlay payload types
- `broadcast.ts` — `BroadcastAdapter` interface
- `errors.ts` — `ServiceError` class
- `index.ts` — re-exports

## Dependencies

- **Requires:** TASK-0.1
- **Unblocked:** TASK-0.4, TASK-0.7, all Phase 1+ tasks
