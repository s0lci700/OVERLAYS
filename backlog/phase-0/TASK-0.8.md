---
id: TASK-0.8
title: Decompose server.js into modular structure
phase: 0
status: Done
points: 3
surface: Foundation
milestone: Session 0 LAN Test
notion_url: https://www.notion.so/324b63b6f5ec81dd80f7e83f8fe1b881
last_synced: 2026-03-25
---

# TASK-0.8 — Decompose server.js into modular structure

**Status:** ✅ Done · **Points:** 3 · **Surface:** 🏗 Foundation

> Replace the monolithic `server.js` with a typed modular structure in `src/server/`. Every Phase 2–5 feature adds to the server; a modular base prevents the file from becoming unworkable.

## Outcome

- `server.ts` — entry point (Express + Socket.io init, no business logic)
- `src/server/handlers/` — `characters.ts`, `rolls.ts`, `misc.ts`, `encounters.ts`
- `src/server/socket/index.ts` — socket event registration
- `src/server/state.ts` — in-memory state (characters, lastRoll, focusedChar)
- `src/server/pb.ts` — PocketBase singleton + `connectToPocketBase()`
- `src/server/data/` — `characters.ts`, `rolls.ts`, `id.ts` (typed replacements for `data/*.js`)
- `src/server/router.ts` — route registration

Legacy `data/*.js` (CommonJS) deleted; replaced with typed `src/server/data/*.ts` ES modules.

## Dependencies

- **Requires:** TASK-0.2
- **Unblocked:** Phase 2 (Stage Controls) — all new handlers go in `src/server/handlers/`
