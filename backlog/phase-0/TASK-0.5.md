---
id: TASK-0.5
title: Sync architecture docs to repo
phase: 0
status: Done
points: 3
surface: DX
milestone: Session 0 LAN Test
notion_url: https://www.notion.so/31eb63b6f5ec818496dcc7336ac973ab
last_synced: 2026-03-25
---

# TASK-0.5 — Sync architecture docs to repo

**Status:** ✅ Done · **Points:** 3 · **Surface:** 🔧 DX

> Create a baseline `docs/` folder with architecture index, state ownership matrix, and API surface documentation.

## Outcome

`docs/` baseline established:
- `ARCHITECTURE.md` — data flows, module map, layer diagram
- `SOCKET-EVENTS.md` — complete event contracts
- `DESIGN-SYSTEM.md` — tokens, component states
- `ENVIRONMENT.md` — `.env` setup
- `INDEX.md` — fast file navigation map
- `README.md` — doc inventory
- `API.md` — REST endpoints + frontend services (added Phase 1)

All docs have YAML frontmatter (`title`, `type`, `source_files`, `last_updated`).

## Dependencies

- **Requires:** TASK-0.1, TASK-0.2 (to have something to document)
