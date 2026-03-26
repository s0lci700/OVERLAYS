---
id: TASK-0.6
title: Set up Storybook with surface-based organization
phase: 0
status: Done
points: 8
surface: DX
milestone: Session 0 LAN Test
notion_url: https://www.notion.so/31eb63b6f5ec81bda3f5e5947eb6af85
last_synced: 2026-03-25
---

# TASK-0.6 — Set up Storybook with surface-based organization

**Status:** ✅ Done · **Points:** 8 · **Surface:** 🔧 DX

> Configure Storybook 10 with `@storybook/sveltekit` and organize stories by surface (Stage/Cast/Commons/Audience/Shared). Must be configured before Phase 1 component work.

## Outcome

- Storybook 10 with `@storybook/addon-svelte-csf` v5
- 31 stories organized by surface
- `manager.js` custom theme
- `.storybook/README.md` conventions doc
- Socket mock via `viteFinal` alias (`$lib/socket` → `__mocks__/socket.js`)
- CSF format: `defineMeta` + `<Story>` tags + `{#snippet children(args)}`

## Key Convention

Story format uses `defineMeta` + `<Story>` (NOT `export const X = {...}` format). See `.storybook/README.md`.

## Dependencies

- **Requires:** TASK-0.2, TASK-0.3
- **Unblocked:** TASK-0.7, all Phase 1–5 component stories
