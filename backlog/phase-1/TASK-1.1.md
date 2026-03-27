---
id: TASK-1.1
title: Define PocketBase character collections
phase: 1
status: Done
points: 5
surface: Cast/Players
milestone: Session 0 LAN Test
notion_url: https://www.notion.so/31eb63b6f5ec8130a6dad207e06f6f59
last_synced: 2026-03-25
---

# TASK-1.1 — Define PocketBase character collections

**Status:** ✅ Done · **Points:** 5 · **Surface:** 📱 Cast/Players

> Audit and migrate PocketBase collections to match the character record contract. Define character, resources, equipment, conditions, and codex_entries collections with typed fields and access rules.

## Acceptance Criteria

- [x] Schema for `characters` collection — `scripts/migrate-collections.ts` defines all fields matching `records.ts`: identity, HP, combat stats, ability_scores (json), proficiency arrays (json), resources (json, ResourceSlot[]), conditions (json, Condition[]), portrait (file), flags
- [x] `character_conditions` — ⚡️ **Arch decision:** embedded as `Condition[]` JSON in the `characters` record, not a separate collection. Shape: `{ id, condition_name, intensity_level, applied_at }`. Simpler real-time updates via socket events, no joins needed.
- [ ] Schema for `character_equipment` — deferred to Phase 2+
- [ ] Schema for `character_notes` — deferred to Phase 2+
- [ ] Schema for `codex_entries` — deferred to Phase 4+ (Cast/DM)
- [ ] Schema for `character_codex_unlocks` — deferred to Phase 4+
- [x] Access rules — `characters` read-open/write-admin, `sessions` read-open/write-admin, `campaigns` all-admin; applied via `listRule`/`viewRule`/`createRule`/`updateRule`/`deleteRule` in migration script
- [x] Migration script applies schema idempotently — `bun scripts/migrate-collections.ts`

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
