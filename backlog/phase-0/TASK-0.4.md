---
id: TASK-0.4
title: Establish services layer scaffold
phase: 0
status: Done
points: 5
surface: Foundation
milestone: Session 0 LAN Test
notion_url: https://www.notion.so/31eb63b6f5ec810da69ce78670f70934
last_synced: 2026-03-25
---

# TASK-0.4 — Establish services layer scaffold

**Status:** ✅ Done · **Points:** 5 · **Surface:** 🏗 Foundation

> Create `control-panel/src/lib/services/` with a typed service layer for all PocketBase and socket interactions. No component should call PocketBase directly.

## Outcome

`services/` layer — 4 modules:
- `pocketbase.ts` — `pb` singleton, canonical init pattern
- `character.ts` — `getCharacter`, `updateCharacter` with `ServiceError` error mapping
- `socket.ts` — typed socket client with event subscription helpers
- `errors.ts` — `ServiceError` class with typed `code` field

## Pattern

All service functions: try/catch → `mapPbError()` → throw `ServiceError`. Components never catch `ClientResponseError` directly.

## Dependencies

- **Requires:** TASK-0.2
- **Unblocked:** Phase 1 (Player Sheet), Phase 2 (Stage Controls)
