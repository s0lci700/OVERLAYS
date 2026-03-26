---
id: TASK-1.1
title: Define PocketBase character collections
phase: 1
status: In Progress
points: 5
surface: Cast/Players
milestone: Session 0 LAN Test
notion_url: https://www.notion.so/31eb63b6f5ec8130a6dad207e06f6f59
last_synced: 2026-03-25
---

# TASK-1.1 — Define PocketBase character collections

**Status:** 🚧 In Progress · **Points:** 5 · **Surface:** 📱 Cast/Players

> Audit and migrate PocketBase collections to match the character record contract. Define character, resources, equipment, conditions, and codex_entries collections with typed fields and access rules.

## Acceptance Criteria

- [ ] Schema for `characters` collection: all fields from `records.ts` (`ability_scores` JSON, `saving_throw_proficiencies`, `skill_proficiencies`, `expertise`, `passives`, `resources`, `spellcasting` JSON, HP fields, `ac_base`, `speed`, `proficiency_bonus`, `portrait` file, `is_active`, `is_visible_to_party_overlay`)
- [ ] Schema for `character_conditions` (relation to characters, condition_key, label, visible_to_player, is_active, expires_at)
- [ ] Schema for `character_equipment` (relation to characters, item_name, quantity, equipped bool, rarity)
- [ ] Schema for `character_notes` (relation to characters, author_user, note_text, note_type select)
- [ ] Schema for `codex_entries` (entry_type select, name, description, data JSON)
- [ ] Schema for `character_codex_unlocks` (relation to characters + codex_entries, unlocked_at)
- [ ] Access rules documented per collection (player read-own, DM read-all, stage operator full write)
- [ ] Migration script applies schema idempotently

## Migration Script

`scripts/migrate-collections.ts` is the canonical way to apply the schema.

**Workflow:**
1. Edit `control-panel/src/lib/contracts/records.ts` (source of truth for TypeScript types)
2. Mirror any field changes in `scripts/migrate-collections.ts`
3. Run: `bun scripts/migrate-collections.ts`
4. First-time only: `bun scripts/seed.js`

**Collections currently defined:** `characters`, `campaigns`, `sessions`

**Safe to re-run** — uses `import(deleteMissing=false)`, never drops unrelated collections.

**Field → PocketBase type mapping:**
- `string` → `text`
- `number` → `number` (with min/max constraints)
- `boolean` → `bool`
- `string[] / object / nested type` → `json`
- `portrait` → `file` (5 MB max, image/* only)
- foreign keys → `relation` (with cascade delete for child collections)

## Key Architecture Notes

**JSON fields** (`ability_scores`, `resources`, `spellcasting`): PocketBase stores raw JSON — no schema enforcement. App layer (`contracts/records.ts`) validates shape. This is intentional.

**Derived values are NOT stored** — `speed_modifier`, `saving_throw_totals`, `skill_totals`, `passive_perception` are computed at render time from stored raw inputs.

**Cascade delete:** `character_conditions`, `character_equipment`, `character_notes`, `character_codex_unlocks` all cascade-delete when parent character is deleted. `codex_entries` does NOT cascade (shared reference data).

## Dependencies

- **Requires:** TASK-0.2 (contracts), TASK-0.4 (services layer)
- **Blocks:** TASK-1.2 (needs schema to exist in PocketBase)
