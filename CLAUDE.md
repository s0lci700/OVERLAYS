# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Project:** *Dados & Risas* — D&D comedy show production system. The software product is called **TableRelay** (repo rename pending from `OVERLAYS`).

---

## Environment

- **OS:** Windows 11. Do NOT suggest bash/zsh solutions — use PowerShell syntax when shell commands are needed.
- **Shell:** PowerShell. Config file is at `$PROFILE` — run `echo $PROFILE` to locate it.
- **Terminal:** Windows Terminal with oh-my-posh (Gruvbox-based theme). Themes live in `AppData` or the project root.
- **Package manager:** Always use `bun`, never `npm`.
- **MCP configs:** Always go in `.mcp.json` at the project root — never in `.claude/settings.json`. Check for an existing `.mcp.json` before adding new entries.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **OVERLAYS** (1260 symbols, 1636 relationships, 10 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/OVERLAYS/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/OVERLAYS/context` | Codebase overview, check index freshness |
| `gitnexus://repo/OVERLAYS/clusters` | All functional areas |
| `gitnexus://repo/OVERLAYS/processes` | All execution flows |
| `gitnexus://repo/OVERLAYS/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->

---

## System Architecture

```text
Phone / Tablet / Desktop
  └── control-panel (SvelteKit + Vite, :5173) — REST + Socket.io client
        │
        ▼
  Bun server (Express + Socket.io, :3000)
  [data/characters.js] [data/rolls.js]  ← PocketBase SDK wrappers
        │  io.emit broadcasts to ALL clients
        ▼
  PocketBase (:8090, SQLite)
        │
        ▼
  (audience)/ overlay routes (served at :5173)
  — OBS Browser Sources, listen-only via Socket.io

dados-risas-prep/  ← separate repo (Prep App)
  Session authoring → exports session.json → imported by Runtime
```

**Two applications:**

- **Runtime System** (this repo) — used *during* recording sessions
- **Prep System** (`dados-risas-prep`, separate repo) — session authoring, exports `session.json`

**Five product surfaces** (see `control-panel/CLAUDE.md` for routes):

| Surface | Route group | Users | Authority |
| --- | --- | --- | --- |
| **Stage** | `(stage)` | Operators | Primary write: setup, live state, reveal queue |
| **Cast/DM** | `(cast)/dm` | DM | Tablet companion: combat, NPC reference |
| **Cast/Players** | `(cast)/players/[id]` | Players | Character sheet: read + safe fields |
| **Commons** | `(commons)` | Whole room | Passive wallboard mirror, no controls |
| **Audience** | `(audience)` | OBS/vMix | Payload-driven overlays, listen-only |

State is persisted in PocketBase. Every socket connection receives `initialData` (full character roster + roll history). Overlays and Commons **never send requests** — they only listen to Socket.io broadcasts.

---

## Commands

Always use `bun` instead of `npm`.

**PocketBase (start first):**

- `./pocketbase serve` — starts on port 8090; admin UI at `http://127.0.0.1:8090/_/`
- `bun run scripts/seed.js` — seeds `characters` from `data/template-characters.json`; skips if records exist

**Backend (root):**

- `bun server.js` — Express + Socket.io on port 3000 (requires PocketBase + `.env`)
- `bun run setup-ip` — auto-detect LAN IP and write root `.env` + `control-panel/.env`
- `bun run generate:tokens` — regenerate CSS from `design/tokens.json`; run after editing tokens

**E2E:**

- `npx playwright test app.test.js --config tests-log/playwright.config.js`
- Manual API: `test.http` at repo root

**Required `.env` (root):**

```text
POCKETBASE_URL=http://127.0.0.1:8090
PB_MAIL=admin@example.com
PB_PASS=yourpassword
PORT=3000
CONTROL_PANEL_ORIGIN=http://localhost:5173
```

**Start order:** PocketBase → `bun server.js` → `bun run dev -- --host` in `control-panel/`.

---

## Backend Conventions

**Tech stack versions:** This project uses `shadcn-svelte` with `bits-ui`. Before assuming any component API shape (e.g. Listbox, Dialog), verify what's actually installed: `cat control-panel/package.json | grep bits-ui`. Do not assume components or props exist without checking — bits-ui v2 has breaking API changes from v0/v1.

**PocketBase data layer:** All functions in `data/characters.js` and `data/rolls.js` take `pb` as their first argument and are `async`. `pb.collection().getOne()` **throws** a `ClientResponseError` on 404 — use try/catch, not `if (!result)` guards.

**Key files:**

- `server.js` — all Express routes, Socket.io setup, PocketBase auth on startup (`connectToPocketBase()` — exits with code 1 on failure)
- `data/characters.js` — exports `getAll`, `createCharacter`, `updateHp`, `updatePhoto`, `updateCharacterData`, `addCondition`, `removeCondition`, `updateResource`, `restoreResources`
- `data/rolls.js` — exports `getAll(pb)`, `logRoll(pb, {...})`
- `data/template-characters.json` — seed fixture (4 characters, stable 5-char IDs like `"CH101"`)
- `design/tokens.json` — canonical token source (never edit the generated CSS files)

**Socket flow:** Stage always sends REST first; the server's Socket.io broadcast updates shared state in all clients. Never mutate `characters` or `lastRoll` stores directly from component logic.

---

## Server Management

- **Always close servers** (Ctrl+C) to free ports before finishing a task. This is mandatory.
- Start order: PocketBase → Node server → control panel dev server.

---

## Additional References

- `SPRINT.md` — active sprint tasks (always current)
- `docs/ARCHITECTURE.md` — full data-flow diagrams and file map
- `docs/SOCKET-EVENTS.md` — complete Socket.io event payloads
- `docs/DESIGN-SYSTEM.md` — CSS tokens, component states, animation reference
- `docs/ENVIRONMENT.md` — `.env` setup, IP configuration
- `docs/THEMING.md` — token generator usage and live theme editor
- `docs/INDEX.md` — fast file map and entry points
- `control-panel/CLAUDE.md` — frontend conventions (SvelteKit, Svelte 5, components, CSS, Storybook)

---

## Workflow Rules

**Always re-read files before analyzing.** Do NOT rely on previously cached or in-context file contents — the codebase changes frequently between sessions. When asked to audit, review, or reference a file, read it fresh first.

**Verify UI changes by code inspection, not by running servers.** Use `svelte-check` or read the final file to confirm correctness. Do not attempt to launch a browser or dev server for visual verification — Playwright and preview servers are unreliable in this environment.

**When a session is interrupted by a rate limit**, summarize current progress and list remaining TODOs clearly so work can resume in the next session without re-explaining context.

**Do not ask "should I continue?" between phases.** Keep executing the plan unless there is a genuine ambiguity that requires a decision — not just a pause for confirmation. If the next step is clear, do it.

---

## Agent Rules — How to Update the Planner

After any audit, investigation, or review:

**For tech findings (bugs, improvements, refactors):**

1. Create a GitHub Issue at: [github.com/s0lci700/OVERLAYS/issues/new](https://github.com/s0lci700/OVERLAYS/issues/new)
2. Apply labels:
   - Area: `area:frontend` ← Svelte components, CSS, overlays, design tokens
   - Area: `area:backend` ← server.js, API routes, Socket.io, data modules, PocketBase
   - Priority: `p0` blocking / `p1` this sprint / `p2` next sprint / `p3` someday
   - Size: `size:quick` <1hr / `size:small` 1–3hr / `size:medium` 3–8hr / `size:large` 8+hr
3. Assign to the correct Milestone (Sprint 1, 2, or 3)
4. Notion task is created automatically when the area label is applied.

**For non-tech findings (outreach, session planning, content):**

Add directly to [Notion](https://notion.so/319b63b6f5ec81bcbe9aeb2b6815c88c):

- Area: `📣 Pitch & Outreach` or `🎭 Session Planning`
- These never become GitHub Issues.

### Routing cheat-sheet

| Type of finding | Where it goes |
| --- | --- |
| Svelte component bug | GitHub Issue, `area:frontend` |
| CSS / overlay visual fix | GitHub Issue, `area:frontend` |
| API endpoint bug | GitHub Issue, `area:backend` |
| Socket.io event issue | GitHub Issue, `area:backend` |
| PocketBase / data layer issue | GitHub Issue, `area:backend` |
| Contact ESDH / follow up | Notion, Pitch & Outreach |
| Campaign planning with Lucas | Notion, Session Planning |

### Label → Notion field mapping

| GitHub Label | Notion Field | Value |
| --- | --- | --- |
| `area:frontend` | Area | 🎨 Frontend |
| `area:backend` | Area | ⚙️ Backend |
| `p0` | Priority | P0 — Now |
| `p1` | Priority | P1 — Soon |
| `p2` | Priority | P2 — Later |
| `p3` | Priority | P3 — Someday |
| `size:quick` | Size | Quick |
| `size:small` | Size | Small |
| `size:medium` | Size | Medium |
| `size:large` | Size | Large |
