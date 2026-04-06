---
id: TASK-2.2
title: Build Dice Route — physical dice intake
phase: 2
status: Planned
points: 8
surface: Stage
milestone: Session 0 LAN Test
notion_url: https://www.notion.so/31eb63b6f5ec810f89ebf0c4a9a2f1a0
last_synced: 2026-04-03
---

# TASK-2.2 — Build Dice/Action Input Route

**Status:** 📋 Planned · **Points:** 8 · **Surface:** 🎮 Stage

> RollPublishCard: operator enters physical dice result, selects die type, tags character, publishes `dice_result_event`. Outcome resolved (success/failure/crit). Feeds DiceResultOverlay payload.

## Acceptance Criteria

- [ ] Route exists at `(stage)/live/dice/+page.svelte`
- [ ] Roll type selector (ability_check, skill_check, attack_roll, saving_throw, initiative, custom)
- [ ] Rolled dice input (space-separated values → array of selectable die buttons)
- [ ] Advantage/disadvantage toggle (affects die highlighting, not auto-selection)
- [ ] Selected die picker + modifier input + target DC/AC (contextual per roll type)
- [ ] Outcome display (computed total vs target, outcome classification) before publishing
- [ ] Publish button disabled until roll is valid; emits `dice_result_event`
- [ ] Recent rolls history (last 8–10, filterable by character)

## Dependencies

- **Requires:** TASK-2.4 (`stage.svelte.ts` with `getCharacterList()` for actor picker)
- **Requires:** `contracts/events.ts` `DICE_RESULT_EVENT` constant and shape
- **Requires:** Server must listen on `dice_result_event` and broadcast

## Notes

Route does NOT simulate rolls — it records what was rolled at the table.
