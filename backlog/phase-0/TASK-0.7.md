---
id: TASK-0.7
title: Create canonical mock fixture files
phase: 0
status: Done
points: 3
surface: DX
milestone: Session 0 LAN Test
notion_url: https://www.notion.so/31eb63b6f5ec81388801e727d3fd4dad
last_synced: 2026-03-25
---

# TASK-0.7 — Create canonical mock fixture files

**Status:** ✅ Done · **Points:** 3 · **Surface:** 🔧 DX

> Create `src/lib/mocks/` as the single source of fixture data for Storybook stories, Vitest tests, and development. No component should define its own inline mock data.

## Outcome

`src/lib/mocks/` — 8 fixture files + `index.ts` + Vitest test:
- `characters.ts` — 4 characters (Sir Nabo, etc.) with stable 5-char IDs
- `campaigns.ts`, `sessions.ts`, `conditions.ts`, `resources.ts`
- `rolls.ts`, `events.ts`, `overlays.ts`
- `index.ts` — re-exports all fixtures

## Dependencies

- **Requires:** TASK-0.2 (contracts), TASK-0.6 (Storybook)
- **Unblocked:** All Phase 1–5 stories and tests
