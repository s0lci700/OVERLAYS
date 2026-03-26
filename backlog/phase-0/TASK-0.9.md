---
id: TASK-0.9
title: Broadcast adapter interface + MockAdapter
phase: 0
status: Done
points: 2
surface: Foundation
milestone: Session 0 LAN Test
notion_url: https://www.notion.so/324b63b6f5ec8193b302edf1162a698f
last_synced: 2026-03-25
---

# TASK-0.9 — Broadcast adapter interface + MockAdapter

**Status:** ✅ Done · **Points:** 2 · **Surface:** 🏗 Foundation

> Define the `BroadcastAdapter` interface in `contracts/broadcast.ts` and implement a `MockAdapter` for testing. OBS and vMix adapters are stubbed for later phases.

## Outcome

- `contracts/broadcast.ts` — `BroadcastAdapter` interface
- `services/broadcast/mock.ts` — `MockAdapter` (captures calls, no side effects)
- `services/broadcast/factory.ts` — returns adapter based on env
- `services/broadcast/obs.ts`, `vmix.ts` — stubs for Phase 5

## Dependencies

- **Requires:** TASK-0.2
- **Unblocked:** Phase 5 (Audience Overlays) OBS/vMix integration
