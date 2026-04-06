---
id: phase-2
title: Phase 2 — Stage Controls
milestone: Session 0 LAN Test
status: In Progress
points_total: 29
points_done: 10
tasks_total: 5
tasks_done: 2
notion_url: https://www.notion.so/31eb63b6f5ec811aad2fd015fed13e40
last_synced: 2026-04-04
---

# Phase 2 — Stage Controls 🚧

**Milestone:** Session 0 LAN Test
**Progress:** 2 of 5 tasks done · 10 of 29 pts complete

## Goal

Build all Stage operator surfaces: live character state management, physical dice intake, reveal queue orchestration, and session package import. The Stage surface has primary write authority — all mutations flow from here via Socket.io to Cast, Players, Commons, and Audience overlays.

## Key Architectural Decisions

- **Socket-first mutations:** Local `$state` update (0ms) → `socket.emit()` (~1ms LAN) → REST `fetch` fire-and-forget (background PocketBase persist)
- **`stage.svelte.ts` store** is the state backbone for all Stage routes — owns activeRoster, selectedCharacter, sessionContext, recentMutations
- Server needs `socket.on` relay handlers (~10 lines each) to fan out emits to all clients
- Dice route records physical dice results — does NOT simulate rolls

## Dependency Chain

```
TASK-2.4 → TASK-2.1 (characters route needs stage store)
TASK-2.4 → TASK-2.2 (dice route needs getCharacterList())
TASK-2.5 → TASK-2.3 (queue route needs stageQueue store)
```

## Tasks

| ID | Title | Status | Pts |
|----|-------|--------|-----|
| [TASK-2.1](TASK-2.1.md) | Build Live Characters route | ✅ Done | 5 |
| [TASK-2.2](TASK-2.2.md) | Build Dice Route — physical dice intake | 📋 Planned | 8 |
| [TASK-2.3](TASK-2.3.md) | Build Reveal/Content Queue route | 📋 Planned | 8 |
| [TASK-2.4](TASK-2.4.md) | Stage stores + socket event architecture | ✅ Done | 5 |
| [TASK-2.5](TASK-2.5.md) | Session package importer / stageQueue store | 📋 Planned | 3 |
