---
id: TASK-0.3
title: Align SvelteKit directory to surface map
phase: 0
status: Done
points: 3
surface: Foundation
milestone: Session 0 LAN Test
notion_url: https://www.notion.so/31eb63b6f5ec81918ad0fc31cc67f58a
last_synced: 2026-03-25
---

# TASK-0.3 — Align SvelteKit directory to surface map

**Status:** ✅ Done · **Points:** 3 · **Surface:** 🏗 Foundation

> Reorganize `control-panel/src/` to use domain-first component directories and `$lib/` path aliases throughout, matching the five-surface architecture.

## Outcome

- Domain-first component dirs: `components/stage/`, `components/cast/`, `components/shared/`
- `$lib/` aliases configured throughout (`$lib/contracts`, `$lib/services`, `$lib/mocks`)
- Route groups: `(stage)`, `(cast)`, `(commons)`, `(audience)`

## Dependencies

- **Requires:** TASK-0.1
- **Unblocked:** Phase 1 component work
