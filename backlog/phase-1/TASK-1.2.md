---
id: TASK-1.2
title: Build record-driven character page
phase: 1
status: Planned
points: 8
surface: Cast/Players
milestone: Session 0 LAN Test
notion_url: https://www.notion.so/31eb63b6f5ec819cb9ede91243f53d81
last_synced: 2026-03-25
---

# TASK-1.2 — Build record-driven character page

**Status:** 📋 Planned · **Points:** 8 · **Surface:** 📱 Cast/Players

> Create the `(cast)/players/[id]` route that loads a character from PocketBase via the `character.ts` service and renders a full character sheet page.

## Acceptance Criteria

- [ ] Route `control-panel/src/routes/(cast)/players/[id]/+page.svelte` exists
- [ ] `+page.server.ts` loads character via `character.ts` service on the server
- [ ] Page renders from stable PocketBase record (not socket state) as baseline
- [ ] 404 handling when character ID not found — redirect to `/characters`
- [ ] Loading state while character data is fetching
- [ ] Page layout matches mobile-first design (phone viewport)

## Architecture Notes

- Load order: PocketBase record first → render stable data → then attach socket overlay (TASK-1.6)
- Never block render on socket connection — socket state is an enhancement, not a requirement
- Use `character.ts` service (`getCharacter(id)`), never call `pb` directly in the route

## Dependencies

- **Requires:** TASK-1.1 (schema must exist in PocketBase)
- **Blocks:** TASK-1.3, TASK-1.4, TASK-1.5, TASK-1.6
