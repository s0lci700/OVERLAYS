---
id: phase-1
title: Phase 1 — Player Sheet
milestone: Session 0 LAN Test
status: In Progress
points_total: 33
points_done: 0
tasks_total: 7
tasks_done: 0
notion_url: https://www.notion.so/31eb63b6f5ec8138bc31d91a3fa4a4ab
last_synced: 2026-03-25
---

# Phase 1 — Player Sheet 🚧

**Milestone:** Session 0 LAN Test
**Progress:** 0 of 7 tasks done · 0 of 33 pts

## Goal

Build a functional digital character sheet for players to use on mobile/phone during sessions. D&D advisor confirmed this is the highest-priority gap — the pilot cannot proceed without it.

## Key Architectural Decisions

- Store **authoritative raw inputs** (ability scores, proficiencies, HP max, AC base) in PocketBase
- **Compute derived values** in app layer (modifiers, saves, skills, spell DC) — never store computed fields
- Route `/players/[id]` renders from stable record first, then attaches live socket state
- Live state (HP current, conditions) overlaid via Socket.io — not polled from PocketBase

## Dependency Chain

```
TASK-1.1 → TASK-1.2 → TASK-1.3
                     → TASK-1.4
                     → TASK-1.5
                     → TASK-1.6 (requires socket.ts + contracts from Phase 0 ✅)
```

## Tasks

| ID | Title | Status | Pts |
|----|-------|--------|-----|
| [TASK-1.1](TASK-1.1.md) | Define PocketBase character collections | 🚧 In Progress | 5 |
| [TASK-1.2](TASK-1.2.md) | Build record-driven character page | 📋 Planned | 8 |
| [TASK-1.3](TASK-1.3.md) | Ability scores + derived values engine | 📋 Planned | 3 |
| [TASK-1.4](TASK-1.4.md) | Resource tracker + conditions panel | 📋 Planned | 5 |
| [TASK-1.5](TASK-1.5.md) | Equipment list + notes sections | 📋 Planned | 5 |
| [TASK-1.6](TASK-1.6.md) | Live socket updates + codex unlockables | 📋 Planned | 5 |
| [TASK-1.7](TASK-1.7.md) | Story coverage audit — Cast/Players | 📋 Planned | 2 |
