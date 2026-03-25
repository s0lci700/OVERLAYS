---
name: doc-steward
description: Full documentation lifecycle manager for TableRelay. Audits staleness, archives orphans, extracts API surfaces, rebuilds indexes, and syncs summaries to Notion. Supersedes docs-refresh for full-lifecycle runs; docs-refresh remains valid for quick targeted refreshes.
argument-hint: /doc-steward [phase] — phase is audit | clean | api | sync | all. Defaults to "all".
user-invocable: true
---

# Doc Steward

Full documentation lifecycle manager for the TableRelay project.

**Hard rules that apply to every phase:**
- Never write a doc from memory. Re-read source files immediately before writing.
- Notion is a co-equal source of truth alongside the code. Decisions, sprint intent, and feature plans live there.
- Never edit `generated-tokens.css`. Token source of truth is `design/tokens.json`.
- Never update files in `docs/done/` — they are archived.

---

## Phases

Run one phase or the full pipeline:

| Invocation | What runs |
|---|---|
| `/doc-steward audit` | Freshness report for all docs (root + `docs/`) — no writes |
| `/doc-steward sprint-sync` | Pull Notion sprint → update `SPRINT.md` only |
| `/doc-steward clean` | Archive orphans, update root docs (PROJECT.md, README.md), rebuild index |
| `/doc-steward api` | Extract API surface → `docs/API.md` |
| `/doc-steward sync` | Push all doc summaries (including root docs) to Notion Docs Index |
| `/doc-steward all` | audit → sprint-sync → clean → api → sync (full run) |
| `/doc-steward` | Same as `all` |

---

## Phase 0 — Orientation (always run first, every phase)

1. Read `docs/README.md` (doc inventory) and `docs/INDEX.md` (file map)
2. Search Notion for **"TableRelay"** and **"Dados & Risas"** — look for sprint pages, architecture notes, session planning. Build a mental model of *what changed recently that docs might not know about*.
3. Check `SPRINT.md` against what Notion shows. Note any gaps.

> If Notion MCP is unavailable, proceed but prepend every output section with: `⚠️ Notion not checked — manual review recommended.`

---

## Phase: `audit`

Freshness report only. No files are written.

### Steps

1. For each doc in `docs/` (excluding `docs/done/`):
   - Find its corresponding source file(s) based on the scope table below
   - **Read the source file now** — never rely on cached contents
   - Extract: exported symbols, Socket.io events, route paths, component props, key side effects
   - Compare against the doc
   - Classify:
     - `current` — accurately reflects source
     - `stale` — references renamed/removed APIs or is missing new additions
     - `missing` — source module exists but has no doc
     - `orphaned` — doc references code that no longer exists

2. Also check AI frontmatter (see Frontmatter Standard below):
   - `missing-frontmatter` — doc exists but has no `---` YAML header
   - `stale-frontmatter` — `last_updated` or `source_files` don't match reality

3. Output the audit table:

```
| Doc | Status | Source File(s) | Issues |
|-----|--------|---------------|--------|
| docs/SOCKET-EVENTS.md | current | src/server/handlers/*.ts | — |
| docs/API.md | missing | src/server/handlers/*.ts | No API doc exists yet |
| docs/UI-COMPONENTS.md | stale | control-panel/src/lib/components/ui/ | Missing stepper, read-only-field added in Phase 0 |
```

4. Ask: *"Proceed with clean / api / sync?"* — or if invoked as `all`, continue automatically.

---

## Phase: `clean`

Archive orphaned docs. Rebuild the index. Update frontmatter dates.

### Steps

1. For each doc classified `orphaned` in audit:
   - Move to `docs/done/<YYYY-MM-DD>-<filename>` (date-prefixed)
   - Add a one-line comment at the top: `<!-- Archived YYYY-MM-DD: source code no longer exists -->`

2. For each doc classified `stale`:
   - Update the doc content to match the current source
   - Bump `last_updated` in its frontmatter

3. For each doc classified `missing-frontmatter`:
   - Add the standard frontmatter block (see Frontmatter Standard below)

4. Rebuild `docs/INDEX.md`:
   - List every file in `docs/` (not `done/`) with a one-line description
   - Group by type: Reference, Architecture, Design, Environment, API

5. Rebuild `docs/README.md` inventory table to match current files.

---

## Phase: `api`

Extract the API surface from TypeScript handlers and frontend services. Write or update `docs/API.md`.

### What to extract

**Backend — `src/server/handlers/*.ts`:**
- Every exported `async function` name, its `req` body shape, route it serves (cross-check `src/server/router.ts`), and what Socket.io event it broadcasts after success

**Frontend services — `control-panel/src/lib/services/*.ts`:**
- Every exported function/class, its parameters + return type, and which PocketBase collection or backend route it calls

### Output format for `docs/API.md`

```markdown
---
title: API Reference
type: api
source_files: [src/server/handlers/, src/server/router.ts, control-panel/src/lib/services/]
last_updated: <today>
---

# API Reference

> Auto-generated by /doc-steward api. Edit source files, not this doc.

## REST Endpoints

### POST /api/characters
**Handler:** `createCharacter` in `src/server/handlers/characters.ts`
**Body:** `{ name: string, player: string, hp_max: number, ... }`
**Emits:** `character_created`

...

## Frontend Services

### characterService (control-panel/src/lib/services/characters.ts)
**`createCharacter(data)`** → `Promise<Character>`
Calls `POST /api/characters`. Throws `ServiceError` on failure.

...
```

---

## Phase: `sync`

Push doc summaries to a Notion database. This makes the doc index human-browsable and filterable outside the repo.

### Steps

1. Search Notion for a page or database titled **"TableRelay Docs Index"**.
   - If found: update it.
   - If not found: create a new database under the main TableRelay workspace page with these columns:
     - **Name** (title)
     - **Path** (text) — e.g. `docs/SOCKET-EVENTS.md`
     - **Type** (select) — Reference | Architecture | Design | Environment | API
     - **Status** (select) — Current | Stale | Orphaned
     - **Last Updated** (date)
     - **Source Files** (text)
     - **Summary** (text) — one sentence

2. For each doc in `docs/` (not `done/`):
   - Upsert a row: name from frontmatter title, path, type, status from audit, last_updated from frontmatter, summary from the doc's Purpose/intro section (one sentence, ≤120 chars)

3. For each doc moved to `done/` in the clean phase:
   - Update its Notion row Status → `Orphaned`

4. Report: how many rows created/updated/skipped.

---

## Frontmatter Standard

Every file in `docs/` (not `done/`) should have this header:

```yaml
---
title: <Human-readable title>
type: reference | architecture | design | environment | api
source_files: [path/to/source1, path/to/source2]
last_updated: YYYY-MM-DD
---
```

This makes docs indexable by GitNexus, AI agents, and the Notion sync phase without parsing prose.

---

## Scope Table

### Root docs (repo root — different rules from `docs/`)

These are not technical reference docs — they are project-level documents with their own update logic. Always include them in `audit` and `clean`. They have a dedicated `sprint-sync` sub-phase.

| File | What it is | Source of truth | Goes stale when |
|---|---|---|---|
| `SPRINT.md` | Snapshot of active sprint | **Notion** (not the code) | Sprint tasks move in Notion |
| `PROJECT.md` | Architecture vision + "Current State vs. Target" table | **Code + Notion** | Phases ship, routes are added/removed |
| `README.md` | Public-facing project intro | **Code + SPRINT.md** | Features ship, commands change |

#### Audit rules per root doc

**`SPRINT.md`:**
- Search Notion for the active sprint page (search "Sprint 1", "Sprint 2", phase titles from SPRINT.md)
- Compare: are tasks in SPRINT.md still accurate? Are completed tasks reflected? Are new tasks in Notion missing from the file?
- Classify as `current`, `behind` (Notion has moved forward), or `ahead` (Notion doesn't match)
- **Never edit SPRINT.md from code alone** — Notion is the source of truth for sprint state. Only update it by pulling Notion data.

**`PROJECT.md`:**
- Read the "Current State vs. Target" table — check each row's Status column against actual `control-panel/src/routes/` directory structure
- Check that the route structure diagram matches `src/routes/` on disk
- Check "Repo rename" note — if the repo has been renamed, update it
- Cross-check Notion for any new phases or scope decisions not yet reflected
- Classify as `current` or `stale` (per section — a doc can be partially stale)

**`README.md`:**
- Check that commands listed match those in `package.json` scripts (root + `control-panel/`)
- Check that the feature/surface descriptions match what's actually built (cross-ref `PROJECT.md` Current State table)
- Check that any version numbers or tech stack mentions are accurate
- Classify as `current` or `stale`

#### `sprint-sync` sub-phase

A fast-path within `audit` that only handles `SPRINT.md` alignment with Notion:

1. Pull the active sprint page from Notion (search for current phase title)
2. Diff: tasks in Notion vs tasks in `SPRINT.md`
3. Report additions, completions, and status changes
4. If invoked as `/doc-steward sprint-sync`: update `SPRINT.md` to match Notion and report what changed

> `sprint-sync` runs automatically as part of `audit` and `all`. It can also be invoked standalone as `/doc-steward sprint-sync`.

---

### Technical reference docs (`docs/`)

| Source path | Primary doc | Doc type |
|---|---|---|
| `src/server/handlers/*.ts` | `docs/API.md` | api |
| `src/server/router.ts` | `docs/API.md` | api |
| `src/server/socket/` | `docs/SOCKET-EVENTS.md` | reference |
| `data/characters.js`, `data/rolls.js` | `docs/ARCHITECTURE.md` | architecture |
| `design/tokens.json` | `docs/DESIGN-SYSTEM.md` | design |
| `control-panel/src/lib/services/` | `docs/API.md` | api |
| `control-panel/src/lib/components/ui/` | `docs/UI-COMPONENTS.md` | reference |
| `.env` structure | `docs/ENVIRONMENT.md` | environment |
| `control-panel/.storybook/` | `docs/UI-COMPONENTS.md` | reference |

---

## Notes for future phases

- **`/doc-steward verify`** (not yet built): fast-path that only cross-checks `docs/SOCKET-EVENTS.md` against actual `broadcast()` calls in `src/server/handlers/` — use between full runs when you suspect socket drift.
- **OpenAPI export**: when the project reaches a stable API surface, the `api` phase should also write `docs/openapi.yaml` from handler metadata.
- **Remote sources beyond Notion**: when additional remote doc stores are added (e.g. Confluence, Linear), add them as optional sync targets in a new `sync-<target>` sub-phase.
