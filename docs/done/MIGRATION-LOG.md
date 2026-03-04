# Migration Log — PocketBase Integration

> Session: 2026-03-02
> Goal: Migrate DADOS & RISAS from in-memory demo state to PocketBase persistence (Phases 1–2 of 4).

---

## What was completed

### Phase 1 — Pre-Migration Housekeeping

- **Deleted dead files**: `data/resources.js`, `data/photos.js`, `control-panel/src/lib/CharacterBulkControls.svelte`
- **Split CharacterCard**: extracted all action logic into a new `CardActions.svelte` component. `CharacterCard.svelte` is now display-only.
- **Wrapped server.js** in `async function main()` so PocketBase auth can be awaited before the server starts listening.

### Phase 2 — PocketBase Setup

- PocketBase binary already present at repo root (`pocketbase.exe`)
- Superuser created via admin UI
- Added `pb_data/`, `pb_migrations/`, `pocketbase`, `pocketbase.exe` to `.gitignore`
- Added `POCKETBASE_URL`, `PB_MAIL`, `PB_PASS` to `.env`

### Phase 3 — Collections Schema

All 10 collections created in PocketBase admin in dependency order:

**Tier 1 (no foreign keys):** `abilities`, `conditions_library`, `npc_templates`, `campaigns`

**Tier 2 (depend on Tier 1):** `sessions`, `party`, `characters`

**Tier 3 (depend on Tier 2):** `encounters`, `npc_instances`, `rolls`

`characters` collection fields include: `campaign_id`, `name`, `player`, `hp_current`, `hp_max`, `hp_temp`, `ability_scores` (JSON), `turn_state` (JSON), `death_state` (JSON), `armor_class`, `speed_walk`, `entity_type`, `visible_to_players`, `class_primary` (JSON), `conditions` (JSON), `resources` (JSON), `photo`, `background` (JSON), `species` (JSON), `languages` (JSON), `alignment` (Text), `proficiencies` (JSON), `equipment` (JSON)

### Phase 4 — Data Layer Migration

Fully rewrote `data/characters.js` and `data/rolls.js` — all functions are now:
- `async`
- Accept `pb` as first parameter
- Read/write from PocketBase instead of in-memory arrays
- No more `loadCharacterTemplate()`, `createShortId()` for IDs, `clamp`, `normalizeKeyList`, `normalizeText`, or `pickText`

`restoreResources` returns `{ character, restored }` to match what `server.js` expects.

### Phase 5 — Seed Data

Created `scripts/seed.js`:
- Authenticates as PocketBase superuser
- Guards against double-seeding (exits early if any characters already exist)
- Maps each entry in `data/template-characters.json` through `JSONToCharacter()` and creates the record
- Successfully seeded 4 characters: **Cynthia, Hector, Luis, Marcelo**

### Phase 6 — Wire Server to PocketBase

- Added `pocketbase/cjs` import and `const pb = new PocketBase(...)` at module scope
- Extracted `connectToPocketBase()` function — called with `await` at start of `main()`
- All 14 `characterModule.*` and `rollsModule.*` call sites updated with `pb` as first argument, `async` callbacks, and `await`
- Verified: server starts, connects to PocketBase, and `/api/characters` returns all 4 seeded characters

---

## Known issues / tech debt

- **PocketBase `getOne()` throws on 404** — it does not return `null`. All `if (!character) return 404` guards in `server.js` are currently dead code. A missing character ID will produce a 500 instead of a clean 404. Needs try/catch wrappers on each route eventually.
- **`createShortId()` still used** in `addCondition` — condition IDs are still short strings generated client-side. This is fine for now but could be replaced with PocketBase-generated IDs if the condition schema moves to its own collection later.
- **`CharacterBulkControls.svelte` CSS** may still exist — verify it's been cleaned up.

---

## What's next — Session 3

### Phase 7 — DM Session Panel

New route: `/control/session` — a live DM view for running encounters.

Planned components:
- **SessionBar** — shows active campaign/session name, current scene
- **InitiativeStrip** — ordered list of combatants with HP and turn marker
- **TargetSelector** — quick-select a character or NPC to apply damage/conditions

This requires:
1. A `/control/session` SvelteKit route + layout entry
2. New Socket.io events: `encounter_started`, `turn_advanced`, `initiative_set`
3. Possibly a `sessions` record in PocketBase to track the active encounter state

The approach will be the same: Sol writes each piece, Copilot reviews and asks questions rather than writing for them.

---

## How to start the stack

```bash
# Terminal 1 — PocketBase
.\pocketbase.exe serve

# Terminal 2 — Node.js API server
node -r dotenv/config server.js

# Terminal 3 — Svelte control panel
cd control-panel && bun run dev -- --host
```

Seed only needs to run once. If you need to re-seed, delete all records from the `characters` collection in PocketBase admin first.
