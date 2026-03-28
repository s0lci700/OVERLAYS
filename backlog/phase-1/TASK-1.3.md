---
id: TASK-1.3
title: Build sheet sections — header, abilities, saves, skills
phase: 1
status: Done
points: 3
surface: Cast/Players
milestone: Session 0 LAN Test
notion_url: https://www.notion.so/31eb63b6f5ec81de8226d6e9c6958ddc
last_synced: 2026-03-28
---

# TASK-1.3 — Build sheet sections — header, abilities, saves, skills

**Status:** ✅ Done · **Points:** 3 · **Surface:** 📱 Cast/Players

> Build the core character sheet UI sections: header (name/class/level/HP), ability scores with modifiers, saving throws, and skill list.

## Acceptance Criteria

- [x] **Header section:** character name, class + subclass, level, species, portrait (if present), current HP / max HP / temp HP, AC, speed
- [x] **Ability scores section:** 6 ability scores (STR/DEX/CON/INT/WIS/CHA) displayed with computed modifiers `floor((score - 10) / 2)`
- [x] **Saving throws section:** list of 6 saves with computed total (ability modifier + proficiency bonus if proficient)
- [x] **Skills section:** full skill list with computed totals, proficiency/expertise indicators
- [x] All derived values computed at render time from raw PocketBase inputs — not stored in DB
- [x] Sections use tokens from `design/tokens.json` — no hardcoded colors/spacing
- [x] Each section has a Storybook story using fixtures from `src/lib/mocks/`

## Components to Create

- `CharacterHeader.svelte` — name, class, level, HP bar, AC, speed
- `AbilityScoresPanel.svelte` — 6 stat blocks with modifier display
- `SavingThrowsPanel.svelte` — 6 saves with proficiency dots
- `SkillsPanel.svelte` — all skills with total and proficiency indicator

## Dependencies

- **Requires:** TASK-1.2 (page scaffold must exist)
