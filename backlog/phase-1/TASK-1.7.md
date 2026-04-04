---
id: TASK-1.7
title: Story coverage audit — Cast/Players
phase: 1
status: Done
points: 2
surface: DX
milestone: Session 0 LAN Test
notion_url: https://www.notion.so/31eb63b6f5ec81caabb0c80e88a02af1
last_synced: 2026-04-03
---

# TASK-1.7 — Story coverage audit — Cast/Players

**Status:** ✅ Done · **Points:** 2 · **Surface:** 🔧 DX

> End-of-phase coverage check. Stories are written inline with each component during Phase 1. This task audits that all Cast/Players components have complete story coverage: default, edge cases, loading, error. Fill any gaps.

## Acceptance Criteria

- [ ] All Cast/Players components have Storybook stories
- [ ] Each story covers: default state, edge cases (low HP, many conditions), loading, error
- [ ] Stories use mock fixtures from `src/lib/mocks/`
- [ ] All stories render cleanly at 375px, 768px, 1920px viewports
- [ ] Gap report produced listing any components without stories

## Dependencies

- **Requires:** TASK-1.3, TASK-1.4, TASK-1.5 (components must exist)
- **Requires:** TASK-0.6, TASK-0.7 (Storybook + fixtures must exist)
