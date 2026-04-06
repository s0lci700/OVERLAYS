---
id: TASK-2.5
title: Session package importer / stageQueue store
phase: 2
status: Planned
points: 3
surface: Stage
milestone: Session 0 LAN Test
notion_url: https://www.notion.so/31eb63b6f5ec81f49921e39641f073b5
last_synced: 2026-04-03
---

# TASK-2.5 — stageQueue Store + Session Package Importer

**Status:** 📋 Planned · **Points:** 3 · **Surface:** 🎮 Stage

> Import session.json from Prep App. Register locations, NPCs, enemies, story beats. Stage Overview panel shows current session package state. Also: `stageQueue.svelte.ts` store for reveal queue lifecycle.

## Acceptance Criteria

- [ ] Store at `src/lib/derived/stage-queue.svelte.ts` (follows `derived/` convention)
- [ ] State shape: `items: QueueItem[]`, `activePayloads: Record<string, QueueItem>`, `publishedHistory`
- [ ] `addToQueue(payload)` — creates draft item with generated ID + timestamp
- [ ] `armPayload(itemId)` — draft → armed, validates content completeness
- [ ] `publishPayload(itemId)` — armed → published, adds to activePayloads, logs history, emits `QUEUE_PAYLOAD_PUBLISHED`
- [ ] `clearPayload(itemId)` — removes from activePayloads, marks expired, emits `QUEUE_PAYLOAD_CLEARED`
- [ ] `deleteFromQueue(itemId)` — removes draft items only
- [ ] `expireExpired()` — scans for items past `expiresAt`, auto-transitions
- [ ] Socket emissions use constants from `contracts/events.ts`
- [ ] `session.json` import wired to `initializeRoster()` / `initializeSessionContext()` in `stage.svelte.ts`

## Dependencies

- **Requires:** `contracts/events.ts` queue event constants (`QUEUE_PAYLOAD_PUBLISHED`, `QUEUE_PAYLOAD_CLEARED`)
- **Requires:** `contracts/overlays.ts` or `contracts/stage.ts` payload shape types
- **Required by:** TASK-2.3 (queue route consumes this store)

## Notes

Notion task title is "Session package importer" but the detailed spec covers the `stageQueue` store needed by TASK-2.3. Both are combined here per actual scope of work.
Store location: `$lib/derived/stage-queue.svelte.ts` (NOT `$lib/stores/stageQueue.js` as in older Notion boilerplate).
